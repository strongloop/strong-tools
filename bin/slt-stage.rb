#!/usr/bin/env ruby

require 'json'

# path to slt bin that is part of strong-tools
SLT = Dir[
  File.expand_path('../slt', __FILE__),
  File.expand_path('../slt.cmd', __FILE__),
  File.expand_path('../slt.js', __FILE__),
].first

SEMVER = Regexp.new('\Av?' +
                    '(?<major>\d+)' +
                    '\.' +
                    '(?<minor>\d+)' +
                    '\.' +
                    '(?<patch>\d+)' +
                    '-?(?<pre>[^\+]+)?' +
                    '\+?(?<meta>.+)?' +
                    '\Z')

# Simplified semver, discards prerelease and meta
def ver(str)
  parts = SEMVER.match(str)
  [ parts[:major].to_i, parts[:minor].to_i, parts[:patch].to_i ]
end

def inc_patch(v)
  v = ver(v)
  [v[0], v[1], v[2]+1]
end

registry = `npm config get registry`.strip
if registry =~ /registry\.npmjs\.org/
  puts 'Cannot stage to npmjs.org!'
  exit 1
end

current = JSON.load(IO.read('package.json'))
published = JSON.load(`npm info --json #{current['name']}`) rescue {}

pub_versions = published['versions'] rescue ['0.0.0']
cur_ver = ver(current['version'] || '0.0.0')
compatible_releases = `#{SLT} semver -r ~#{cur_ver.join('.')} #{pub_versions.join(' ')}`.lines.map(&:strip)
latest = compatible_releases.last || '0.0.0'
next_ver = [cur_ver, inc_patch(latest)].max

if next_ver == cur_ver
  puts "local version newer than published, using it: #{cur_ver.join('.')}"
else
  version = next_ver.join('.')
  puts "published (#{latest}) version newer than local (#{cur_ver.join('.')}), using publshed + 0.0.1 => #{version}"
  system "npm version --git-tag-version=false --sign-git-tag=false #{version}"
end

exec "npm install && npm publish"

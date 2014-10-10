#!/usr/bin/env ruby

require 'json'

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

cur_ver = ver(current['version'] || '0.0.0')
latest = published['dist-tags']['latest'] rescue '0.0.0'
next_ver = [cur_ver, inc_patch(latest)].max

if next_ver == cur_ver
  puts "local version newer than published, using it"
else
  version = next_ver.join('.')
  puts "published version newer than local, using publshed + 0.0.1 => #{version}"
  system "npm version --git-tag-version=false --sign-git-tag=false #{version}"
end

exec "npm install && npm publish"

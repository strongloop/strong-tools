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
  [v[0], v[1], v[2]+1]
end

registry = `npm config get registry`.strip
if registry =~ /registry\.npmjs\.org/
  puts 'Cannot stage to npmjs.org!'
  exit 1
end

current = JSON.load(IO.read('package.json'))
published = JSON.load(`npm info --json #{current['name']}`)

cur_ver = ver(current['version'] || '1.0.0')
latest = published['dist-tags']['latest'] rescue '1.0.0'
pub_ver = ver(latest)

if ((cur_ver <=> pub_ver) > 0)
  puts "local version newer than published, using it"
else
  puts "published version newer than local, using publshed + 0.0.1"
  next_ver = inc_patch(pub_ver).join('.')
  system "npm version --git-tag-version=false --sign-git-tag=false #{next_ver}"
end

exec "npm install && npm publish"

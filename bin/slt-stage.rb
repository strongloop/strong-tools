#!/usr/bin/env ruby

require 'json'

# path to slt bin that is part of strong-tools
SLT = Dir[
  File.expand_path('../slt', __FILE__),
  File.expand_path('../slt.cmd', __FILE__),
  File.expand_path('../slt.js', __FILE__),
].first

def inc_ver(v)
  if v =~ /\d+\.\d+\.\d+-/
    inc = 'prerelease'
  else
    inc = 'patch'
  end
  `#{SLT} semver --inc #{inc} #{v}`.lines.map(&:strip).last
end

registry = `npm config get registry`.strip
if registry =~ /registry\.npmjs\.org/
  puts 'Cannot stage to npmjs.org!'
  exit 1
end

local = JSON.load(IO.read('package.json'))
published = JSON.load(`npm info --json #{local['name']}`) rescue {}

pub_versions = Array(published['versions']) rescue ['0.0.0']
local_ver = local['version'] || '0.0.0'
puts "#{SLT} semver -r ~#{local_ver} #{local_ver} #{pub_versions.join(' ')}"
compatible_releases = `#{SLT} semver -r ~#{local_ver} #{pub_versions.join(' ')}`.lines.map(&:strip)
puts "compatible: #{compatible_releases.inspect}"
latest = compatible_releases.last || '0.0.0'
# semver sorts versions if all you give it is a list :-)
next_ver = `#{SLT} semver #{local_ver} #{inc_ver(latest)}`.lines.map(&:strip).last

if next_ver == local_ver
  puts "local version newer than published, using it: #{local_ver}"
else
  version = next_ver
  puts "published (#{latest}) version newer than local (#{local_ver}), using publshed + 0.0.1 => #{version}"
  system "npm version --git-tag-version=false --sign-git-tag=false #{version}"
end

# npm uses .gitignore if there is no .npmignore, so we'll use that as
# our starting point if there isn't already a .npmigore file
if File.exists?(".gitignore") && !File.exist?(".npmignore")
  IO.copy_stream(".gitignore", ".npmignore")
end
open(".npmignore", "a") do |i|
  if `#{SLT} info get . publishConfig.export-tests`.lines.map(&:strip).last != "true"
    i.puts("test")
  end
  i.puts(".travis.yml")
end

exec "npm install && npm publish #{ARGV.join(' ')}"

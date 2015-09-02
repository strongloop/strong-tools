#!/usr/bin/env node

var path = require('path');
var tools = require('../');

var cmd = process.argv[2] || 'help';
var pkg = path.resolve(process.argv[3] || './package.json');

if (cmd in tools) {
  if (tools[cmd].cli)
    tools[cmd].cli.apply(null, process.argv.slice(3));
  else
    defaultCLI(tools[cmd], pkg);
} else {
  usage(path.basename(process.argv[1]), console.log.bind(console));
  process.exit(1);
}

function usage($0, p) {
  p('Usage: %s <CMD> [PKG]', $0);
  p('');
  p('Commands:');
  p('  lint        Perform a simple linting of the given package.json');
  p('  cla         Create or verify contribution guidelines');
  p('  license     Set package licensing');
  p('  info        Display metadata about package');
  p('  version     Version manipulation');
  p('  semver      Wrapper for semver command from semver package');
  p('  help        Print this usage guide');
  p('');
  p('Confirm license changes are acceptable with:');
  p('    git diff -M --cached -w --ignore-blank-lines');
}

function defaultCLI(fn, pkgPath) {
  var project = new tools.Project(pkgPath);
  return project.gather(function(err, project) {
    if (err)
      console.error(err);
    else
      fn(project);
  });
}

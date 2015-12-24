#!/usr/bin/env node

var _ = require('lodash');
var fs = require('fs');
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
  var usageFile = path.resolve(__dirname, 'slt.ejs');
  var generateUsage = _.template(fs.readFileSync(usageFile, 'utf8'));
  p(generateUsage({$0: $0}));
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

#!/usr/bin/env node
// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');
var bluebird = require('bluebird');
var fs = require('fs');
var path = require('path');
var tools = require('../');

var cmd = process.argv[2] || 'help';
var pkg = path.resolve(process.argv[3] || './package.json');

if (cmd in tools) {
  if (tools[cmd].cli)
    bluebird.resolve(tools[cmd].cli.apply(null, process.argv.slice(3)))
            .catch(function() {
              process.exit(1);
            });
  else
    defaultCLI(tools[cmd], pkg);
} else {
  usage(process.env.ARGV0 || path.basename(process.argv[1]), console.log);
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

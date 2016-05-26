// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var Project = require('../lib/project');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tap').test;

var cla = require('../').cla;
var output = [];
function logger() {
  output.push(arguments);
}

var SANDBOX = path.resolve(__dirname, 'SANDBOX-cla');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');
var SANDBOX_CONTRIB = path.resolve(SANDBOX, 'CONTRIBUTING.md');
var SANDBOX_CONTRIB_SUGG = path.resolve(SANDBOX, 'CONTRIBUTING.md.suggested');
var sandbox_pkg = null;

test('setup', function(t) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');
  sandbox_pkg = new Project(SANDBOX_PKG);
  t.assert(cla, 'cla is exported');
  t.ok(sandbox_pkg, 'sandbox created');
  t.ok(!fs.existsSync(SANDBOX_CONTRIB),
       'Starting with no CONTIRBUTING.md');
  t.ok(!fs.existsSync(SANDBOX_CONTRIB_SUGG),
       'Starting with no CONTIRBUTING.md.suggested');
  t.end();
});

test('No CONTRIBUTING.md files exist', function(t) {
  cla(sandbox_pkg, logger, function() {
    t.ok(fs.existsSync(SANDBOX_CONTRIB),
         'A default CONTRIBUTING.md is created');
    t.ok(!fs.existsSync(SANDBOX_CONTRIB_SUGG),
         'A CONTRIBUTIONG.md.suggested is NOT created');
    t.end();
  });
});

test('CONTRIBUTING.md already up to date', function(t) {
  cla(sandbox_pkg, logger, function() {
    t.ok(fs.existsSync(SANDBOX_CONTRIB),
         'The original CONTRIBUTING.md still exists');
    t.ok(!fs.existsSync(SANDBOX_CONTRIB_SUGG),
         'A CONTRIBUTIONG.md.suggested is NOT created');
    t.end();
  });
});

test('CONTRIBUTING.md exists, but is wrong', function(t) {
  fs.writeFileSync(SANDBOX_CONTRIB, 'This is the stuff', 'utf8');
  cla(sandbox_pkg, logger, function() {
    t.ok(fs.existsSync(SANDBOX_CONTRIB),
         'The original CONTRIBUTING.md still exists');
    t.ok(fs.existsSync(SANDBOX_CONTRIB_SUGG),
         'A CONTRIBUTIONG.md.suggested is created');
    t.end();
  });
});

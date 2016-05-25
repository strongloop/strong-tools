// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tap').test;
var Project = require('../lib/project');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-project');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

test('setup', function(t) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');
  t.pass('sandbox created');
  t.end();
});

test('API', function(t) {
  t.strictEqual(typeof require('../lib/project'), 'function',
                   'project exports a function');
  t.ok(new Project('') instanceof Project,
       'Project is a constructor');
  t.ok(Project('') instanceof Project,
       'does not require new');
  t.ok(Project(SANDBOX).pkgJSONPath === SANDBOX_PKG,
       'knows how to find package.json from directory');
  t.ok(Project(SANDBOX_PKG).rootPath === SANDBOX,
       'knows how to find package root from package.json');
  t.end();
});

test('package parsing', function(t) {
  var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  var p1 = new Project(SANDBOX);
  t.ok(!('version' in p1.rawPkgJSON),
       'does not modify data on load');
  t.strictEqual(p1.version(), '1.0.0-0',
                   'reports 1.0.0-0 as version if missing');
  p1.version(p1.version());
  p1.persist();
  var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.notEqual(updated, original, 'file has changed');
  t.strictEqual(updated.version, '1.0.0-0',
                   'persists the updated version');
  t.end();
});

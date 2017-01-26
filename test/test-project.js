// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var fs = require('fs');
var helpers = require('./helpers');
var path = require('path');
var test = require('tap').test;
var Project = require('../lib/project');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-project');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

test('setup', function(t) {
  helpers.resetSandboxSync(t, SANDBOX, SANDBOX_PKG, {name: 'testing'});
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

test('package info gathering', function(t) {
  var self = new Project(require.resolve('../package.json'));
  self.gather(function(err, project) {
    t.ifErr(err, 'should not error out');
    t.same(self, project);
    t.equal(project.get('license'), 'MIT');
    t.equal(project.license(), 'MIT');
    // fake out the name so we know it wasn't used to generate the gh slug
    project.normalizedPkgJSON.name = 'not-really';
    t.equal(project.ghSlug(), 'strongloop/strong-tools');
    t.end();
  });
});

test('optionalDep getter/setter', function(t) {
  var self = new Project(require.resolve('../package.json'));
  self.gather(function(err, project) {
    t.ifErr(err, 'should not error out');
    t.same(self, project);
    t.notOk(self.optionalDep('not-real'));
    self.optionalDep('not-real', '1.0.0');
    t.equal(self.optionalDep('not-real'), '1.0.0');
    self.optionalDep('not-real', null);
    t.notOk(self.optionalDep('not-real'));
    t.end();
  });
});

test('script getter/setter', function(t) {
  var self = new Project(require.resolve('../package.json'));
  self.gather(function(err, project) {
    t.ifErr(err, 'should not error out');
    t.same(self, project);
    t.notOk(self.script('not-real'));
    self.script('not-real', 'foo');
    t.equal(self.script('not-real'), 'foo');
    self.script('not-real', null);
    t.notOk(self.script('not-real'));
    t.end();
  });
});

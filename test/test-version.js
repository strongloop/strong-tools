// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tap').test;
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-version');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

test('setup', function(t) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');
  t.pass('sandbox created');
  t.end();
});

test('API', function(t) {
  t.test('exports', function(t) {
    t.ok(tools.version, 'version is exported');
    t.ok(tools.version.inc, 'version exports .inc()');
    t.ok(tools.version.cli, 'version exports a CLI');
    t.end();
  });
  t.test('increment', function(t) {
    var incs = {
      '1.0.0': '1.0.1-0',
      '0.0.0': '0.0.1-0',
      '1.0.0-0': '1.0.0-1',
      '1.2.3-4': '1.2.3-5',
    };
    for (var i in incs) {
      t.strictEqual(tools.version.inc(i).toString(),
                    incs[i],
                    '-- increments ' + i + ' to ' + incs[i]);
    }
    t.end();
  });
  t.end();
});

test('CLI', function(t) {
  test('increment (CLI)', function(t) {
    var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
    tools.version.GIT_COMMIT = 'aaaabbbbbccccccddddd';
    tools.version.BUILD_NUMBER = '10';
    tools.version.cli.out = function() {};
    tools.version.cli('inc', SANDBOX_PKG);
    var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
    t.notEqual(updated.version, original.version,
               '-- should change version in package');
    t.strictEqual(updated.version, '1.0.0-10.aaaabbb',
                  '-- should increment missing version to 1.0.0-1');
    t.end();
  });
  t.end();
});

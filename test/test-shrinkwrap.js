// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tap').test;
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-shrinkwrap');
var SANDBOX_FILE = path.resolve(SANDBOX, 'npm-shrinkwrap.json');
var ORIGINAL = fs.readFileSync(require.resolve('./shrinkwrap-fixture.json'),
                               'utf8');
var EXPECTED = fs.readFileSync(require.resolve('./shrinkwrap-after.json'),
                               'utf8');

test('setup', function(t) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_FILE, ORIGINAL, 'utf8');
  t.notEqual(ORIGINAL, EXPECTED, 'expecations are sane');
  t.end();
});

test('API', function(t) {
  t.assert(tools.shrinkwrap, 'shrinkwrap is exported');
  t.assert(tools.shrinkwrap.cli, 'shrinkwrap exports a CLI');
  t.end();
});

test('shrinkwrapping', function(t) {
  tools.shrinkwrap.cli.out = function() {};
  return tools.shrinkwrap.cli(SANDBOX_FILE).then(function() {
    var updated = fs.readFileSync(SANDBOX_FILE, 'utf8');
    t.equal(updated, EXPECTED, 'should change shrinkwrap to match expected');
  });
});

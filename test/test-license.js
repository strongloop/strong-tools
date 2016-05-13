// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-lic');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
process.chdir(SANDBOX);
fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');

assert(tools.license, 'license is exported');

assert(tools.license.cli, 'license exports a CLI');
tools.license.cli.out = function() {};
var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
tools.license.cli('--mit').then(function() {
  var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  assert(original.license !== updated.license,
         '-- should change license in package');
  assert.strictEqual(updated.license, 'MIT',
                     '-- should be set to MIT');
}).then(function() {
  return tools.license.cli('--apache').then(function() {
    var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
    assert(original.license !== updated.license,
           '-- should change license in package');
    assert.strictEqual(updated.license, 'Apache-2.0',
                       '-- should be set to Apache-2.0');
  });
}).then(function() {
  return tools.license.cli('--artistic').then(function() {
    var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
    assert(original.license !== updated.license,
           '-- should change license in package');
    assert.strictEqual(updated.license, 'Artistic-2.0',
                       '-- should be set to Artistic-2.0');
  });
});

// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tap').test;
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-lic');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

test('setup', function(t) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');
  t.pass('sandbox created');
  t.end();
});

test('API', function(t) {
  t.ok(tools.license, 'license is exported');
  t.ok(tools.license.cli, 'license exports a CLI');
  t.end();
});

test('license writing', function(t) {
  var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  process.chdir(SANDBOX);
  t.test('MIT', function(t) {
    tools.license.cli.out = t.comment;
    return tools.license.cli('--mit').then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'MIT',
                    '-- should be set to MIT');
    });
  });
  t.test('Apache', function(t) {
    tools.license.cli.out = t.comment;
    return tools.license.cli('--apache').then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'Apache-2.0',
                    '-- should be set to Apache-2.0');
    });
  });
  t.test('Artistic', function(t) {
    tools.license.cli.out = t.comment;
    return tools.license.cli('--artistic').then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'Artistic-2.0',
                    '-- should be set to Artistic-2.0');
    });
  });
  t.end();
});

test('license fixing', function(t) {
  t.test('mit', function(t) {
    tools.license.cli.out = t.comment;
    var original = {name: 'testing', license: 'mit'};
    fs.writeFileSync(SANDBOX_PKG, JSON.stringify(original), 'utf8');
    process.chdir(SANDBOX);
    return tools.license.cli().then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'MIT',
                    '-- should be set to MIT');
    });
  });
  t.test('artistic', function(t) {
    tools.license.cli.out = t.comment;
    var original = {name: 'testing', license: 'artistic'};
    fs.writeFileSync(SANDBOX_PKG, JSON.stringify(original), 'utf8');
    process.chdir(SANDBOX);
    return tools.license.cli().then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'Artistic-2.0',
                    '-- should be set to Artistic-2.0');
    });
  });
  t.test('apache', function(t) {
    tools.license.cli.out = t.comment;
    var original = {name: 'testing', license: 'apache'};
    fs.writeFileSync(SANDBOX_PKG, JSON.stringify(original), 'utf8');
    process.chdir(SANDBOX);
    return tools.license.cli().then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'Apache-2.0',
                    '-- should be set to Apache-2.0');
    });
  });
  t.test('object', function(t) {
    t.test('dual mit', function(t) {
      tools.license.cli.out = t.comment;
      var original = {
        name: 'testing',
        license: {name: 'Dual MIT/StrongLoop', url: 'https://'},
      };
      fs.writeFileSync(SANDBOX_PKG, JSON.stringify(original), 'utf8');
      process.chdir(SANDBOX);
      return tools.license.cli().then(function() {
        var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
        t.notEqual(updated.license, original.license,
                   '-- should change license in package');
        t.strictEqual(updated.license, 'MIT',
                      '-- should be set to MIT');
      });
    });
    t.test('dual artistic', function(t) {
      tools.license.cli.out = t.comment;
      var original = {
        name: 'testing',
        license: {name: 'Dual Artistic/StrongLoop', url: 'https://'},
      };
      fs.writeFileSync(SANDBOX_PKG, JSON.stringify(original), 'utf8');
      process.chdir(SANDBOX);
      return tools.license.cli().then(function() {
        var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
        t.notEqual(updated.license, original.license,
                   '-- should change license in package');
        t.strictEqual(updated.license, 'Artistic-2.0',
                      '-- should be set to Artistic-2.0');
      });
    });
    t.end();
  });
  t.end();
});

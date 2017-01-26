// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var fs = require('fs');
var helpers = require('./helpers');
var path = require('path');
var test = require('tap').test;

var CUSTOM = path.resolve(__dirname, 'custom-license-fixture.tpl');
var SANDBOX = path.resolve(__dirname, 'SANDBOX-lic');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

// The interface for using custom license templates if env var based
// so we need to set this _before_ we require() the actual code.
process.env.SLT_LICENSE = CUSTOM;
var tools = require('../');

test('setup', function(t) {
  helpers.resetSandboxSync(t, SANDBOX, SANDBOX_PKG, {name: 'testing'});
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
  t.test('custom', function(t) {
    tools.license.cli.out = t.comment;
    return tools.license.cli('--custom').then(function() {
      var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
      var licensePath = path.resolve(SANDBOX, 'LICENSE.md');
      var license = fs.readFileSync(licensePath, 'utf8');
      var now = new Date().getFullYear();
      t.notEqual(updated.license, original.license,
                 '-- should change license in package');
      t.strictEqual(updated.license, 'SEE LICENSE IN LICENSE.md',
                    '-- should be set to SEE LICENSE IN LICENSE.md');
      t.match(license, /^This is a custom license!/);
      t.match(license, /^It is for a package called testing, which/m);
      t.match(license, /which is owned by Author\.$/m);
      t.match(license, new RegExp('created in ' + now + ', which is'));
      t.equal(license[license.length - 1], '\n', 'file is newline terminated');
    });
  });
  t.end();
});

test('license fixing', function(t) {
  var cases = [
    {
      name: 'mit',
      given: {name: 'testing', license: 'mit'},
      expect: {name: 'testing', license: 'MIT'},
    },
    {
      name: 'artistic',
      given: {name: 'testing', license: 'artistic'},
      expect: {name: 'testing', license: 'Artistic-2.0'},
    },
    {
      name: 'apache',
      given: {name: 'testing', license: 'apache'},
      expect: {name: 'testing', license: 'Apache-2.0'},
    },

    // Collapse dual-licenses to only their FOSS component
    {
      name: 'Dual MIT/StrongLoop',
      given: {
        name: 'testing',
        license: {name: 'Dual MIT/StrongLoop', url: 'https://'},
      },
      expect: {name: 'testing', license: 'MIT'},
    },
    {
      name: 'Dual Artistic/StrongLoop',
      given: {
        name: 'testing',
        license: {name: 'Dual Artistic/StrongLoop', url: 'https://'},
      },
      expect: {name: 'testing', license: 'Artistic-2.0'},
    },

  ];
  cases.forEach(function(test) {
    t.test(test.name, function(t) {
      tools.license.cli.out = t.comment;
      var original = test.given;
      fs.writeFileSync(SANDBOX_PKG, JSON.stringify(original), 'utf8');
      process.chdir(SANDBOX);
      return tools.license.cli().then(function() {
        var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
        t.strictEqual(updated.license, test.expect.license);
      });
    });
  });
  t.end();
});

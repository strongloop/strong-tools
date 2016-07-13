// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var test = require('tap').test;
var tools = require('../');

function exists(path) {
  if (fs.accessSync) {
    try { fs.accessSync(path); } catch (e) { return false; }
    return true;
  }
  return fs.existsSync(path);
}

var BLIP_SRC = fs.readFileSync(require.resolve('../lib/blip'), 'utf8')
  .split('\n')
  .filter(function(l) {
    return /^\/\/ /.test(l);
  }).join('\n');
var SANDBOX = path.resolve(__dirname, 'SANDBOX-blip');
var SANDBOX_BLIP = path.resolve(SANDBOX, '.sl-blip.js');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

var newVer = false;
tools.version.cli.out = function(output) {
  newVer = output;
};

test('setup', function(t) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');
  t.pass('sandbox created');
  t.ok(tools.version.set, 'version exports .set()');
  t.end();
});

test('without blip', function(t) {
  var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(!original.optionalDependencies,
       'sl-blip dependency updating when missing');
  tools.version.cli('set', '1.2.3', SANDBOX_PKG);
  var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(!updated.optionalDependencies,
       '-- sl-blip not added');
  t.end();
});

test('with blip', function(t) {
  var withBlip = {
    name: 'testing',
    optionalDependencies: {
      'sl-blip': '*',
    },
  };
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withBlip), 'utf8');
  var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(original.optionalDependencies,
       'sl-blip dependency updates when present');
  t.strictEqual(original.optionalDependencies['sl-blip'], '*',
                '-- initial version');
  t.ok(!('scripts' in original), 'no scripts set initially');
  t.ok(!exists(SANDBOX_BLIP), '-- no file at .sl-blip.js');

  newVer = false;
  tools.version.cli('set', '1.2.3', SANDBOX_PKG);
  t.strictEqual(newVer, 'testing@1.2.3',
                '-- prints name@version');

  var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(!('sl-blip' in updated.optionalDependencies), '-- sl-blip removed');
  t.strictEqual(updated.scripts.preinstall, 'node .sl-blip.js || exit 0',
                '-- injects sl-blip as a preinstall script');
  t.ok(exists(SANDBOX_BLIP), '-- .sl-blip.js was created');
  t.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), BLIP_SRC,
                '-- blip script content is correct');
  t.end();
});

test('with blip AND preinstall script', function(t) {
  var withBlipAndPreinstall = {
    name: 'testing',
    scripts: {
      preinstall: 'something other than blip',
    },
    optionalDependencies: {
      'sl-blip': '*',
    },
  };
  fs.writeFileSync(SANDBOX_BLIP, 'something else', 'utf8');
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withBlipAndPreinstall), 'utf8');
  var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(original.optionalDependencies,
        'sl-blip dependency updates when present');
  t.strictEqual(original.optionalDependencies['sl-blip'], '*',
                    '-- initial version');
  t.strictEqual(original.scripts.preinstall, 'something other than blip',
                     '-- initial preinstall script');
  t.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), 'something else',
                     '-- blip script content is garbage');
  newVer = false;
  tools.version.cli('set', '1.2.3', SANDBOX_PKG);
  t.strictEqual(newVer, 'testing@1.2.3',
                     '-- prints name@version');

  var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(!('sl-blip' in updated.optionalDependencies), '-- sl-blip removed');
  t.strictEqual(updated.scripts.preinstall, original.scripts.preinstall,
                     '-- original preinstall script preserved');
  t.strictEqual(updated.scripts.postinstall, 'node .sl-blip.js || exit 0',
                     '-- injects as postinstall script');
  t.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), BLIP_SRC,
                     '-- blip script content is replaced');
  t.end();
});

test('wth old blip install script', function(t) {
  var withOldBlipInstall = {
    name: 'testing',
    scripts: {
      install: 'node .sl-blip.js',
    },
  };
  fs.writeFileSync(SANDBOX_BLIP, 'something else', 'utf8');
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withOldBlipInstall), 'utf8');
  var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.ok(original.name,
        'sl-blip script in old form updates when present');
  t.strictEqual(original.scripts.install, 'node .sl-blip.js',
                     '-- initial install script');
  t.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), 'something else',
                     '-- blip script content is garbage');
  newVer = false;
  tools.version.cli('set', '1.1.2', SANDBOX_PKG);
  t.strictEqual(newVer, 'testing@1.1.2',
                     '-- prints name@version');

  var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
  t.strictEqual(updated.scripts.install, 'node .sl-blip.js || exit 0',
                     '-- updates existing install script');
  t.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), BLIP_SRC,
                     '-- blip script content is replaced');
  t.end();
});

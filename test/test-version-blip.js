// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
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

rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');

assert(tools.version.set, 'version exports .set()');

var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!original.optionalDependencies,
       'sl-blip dependency updating when missing');
tools.version.cli('set', '1.2.3', SANDBOX_PKG);
var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!original.optionalDependencies,
       '-- sl-blip not added');

var withBlip = {
  name: 'testing',
  optionalDependencies: {
    'sl-blip': '*',
  },
};
fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withBlip), 'utf8');
original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(original.optionalDependencies,
       'sl-blip dependency updates when present');
assert.strictEqual(original.optionalDependencies['sl-blip'], '*',
                   '-- initial version');
assert(!('scripts' in original), 'no scripts set initially');
assert(!exists(SANDBOX_BLIP), '-- no file at .sl-blip.js');

newVer = false;
tools.version.cli('set', '1.2.3', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.2.3',
                   '-- prints name@version');

updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!('sl-blip' in updated.optionalDependencies), '-- sl-blip removed');
assert.strictEqual(updated.scripts.preinstall, 'node .sl-blip.js || exit 0',
                   '-- injects sl-blip as a preinstall script');
assert(exists(SANDBOX_BLIP), '-- .sl-blip.js was created');
assert.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), BLIP_SRC,
                   '-- blip script content is correct');

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
original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(original.optionalDependencies,
      'sl-blip dependency updates when present');
assert.strictEqual(original.optionalDependencies['sl-blip'], '*',
                  '-- initial version');
assert.strictEqual(original.scripts.preinstall, 'something other than blip',
                   '-- initial preinstall script');
assert.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), 'something else',
                   '-- blip script content is garbage');
newVer = false;
tools.version.cli('set', '1.2.3', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.2.3',
                   '-- prints name@version');

updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!('sl-blip' in updated.optionalDependencies), '-- sl-blip removed');
assert.strictEqual(updated.scripts.preinstall, original.scripts.preinstall,
                   '-- original preinstall script preserved');
assert.strictEqual(updated.scripts.postinstall, 'node .sl-blip.js || exit 0',
                   '-- injects as postinstall script');
assert.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), BLIP_SRC,
                   '-- blip script content is replaced');

var withOldBlipInstall = {
  name: 'testing',
  scripts: {
    install: 'node .sl-blip.js',
  },
};
fs.writeFileSync(SANDBOX_BLIP, 'something else', 'utf8');
fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withOldBlipInstall), 'utf8');
original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(original.name,
      'sl-blip script in old form updates when present');
assert.strictEqual(original.scripts.install, 'node .sl-blip.js',
                   '-- initial install script');
assert.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), 'something else',
                   '-- blip script content is garbage');
newVer = false;
tools.version.cli('set', '1.1.2', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.1.2',
                   '-- prints name@version');

updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert.strictEqual(updated.scripts.install, 'node .sl-blip.js || exit 0',
                   '-- updates existing install script');
assert.strictEqual(fs.readFileSync(SANDBOX_BLIP, 'utf8'), BLIP_SRC,
                   '-- blip script content is replaced');

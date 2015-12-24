var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-blip');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

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

var newVer = false;
tools.version.cli.out = function(output) {
  newVer = output;
};
tools.version.cli('set', '1.2.3', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.2.3',
                   '-- prints name@version');

updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!('sl-blip' in updated.optionalDependencies), '-- sl-blip removed');
assert.strictEqual(updated.scripts.preinstall, 'node scripts/sl-blip.js',
                   '-- injects sl-blip as a preinstall script');

var withBlipAndPreinstall = {
  name: 'testing',
  scripts: {
    preinstall: 'something other than blip',
  },
  optionalDependencies: {
    'sl-blip': '*',
  },
};
fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withBlipAndPreinstall), 'utf8');
original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(original.optionalDependencies,
      'sl-blip dependency updates when present');
assert.strictEqual(original.optionalDependencies['sl-blip'], '*',
                  '-- initial version');
assert.strictEqual(original.scripts.preinstall, 'something other than blip',
                   '-- initial preinstall script');

newVer = false;
tools.version.cli('set', '1.2.3', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.2.3',
                   '-- prints name@version');

updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!('sl-blip' in updated.optionalDependencies), '-- sl-blip removed');
assert.strictEqual(updated.scripts.preinstall, original.scripts.preinstall,
                   '-- original preinstall script preserved');
assert.strictEqual(updated.scripts.postinstall, 'node .sl-blip.js',
                   '-- injects as postinstall script');

var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');

assert(tools.version, 'version is exported');

assert(tools.version.inc, 'version exports .inc()');
var incs = {
  '1.0.0': '1.0.1-0',
  '0.0.0': '0.0.1-0',
  '1.0.0-0': '1.0.0-1',
  '1.2.3-4': '1.2.3-5',
};
for (var i in incs) {
  assert.strictEqual(tools.version.inc(i).toString(),
                     incs[i],
                     '-- increments ' + i + ' to ' + incs[i]);
}

tools.version.GIT_COMMIT = 'aaaabbbbbccccccddddd';
tools.version.BUILD_NUMBER = '10';

assert(tools.version.cli, 'version exports a CLI');
tools.version.cli.out = function() {};
var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
tools.version.cli('inc', SANDBOX_PKG);
var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(original.version !== updated.version,
       '-- should change version in package');
assert.strictEqual(updated.version, '1.0.0-10.aaaabbb',
                   '-- should increment missing version to 1.0.0-1');

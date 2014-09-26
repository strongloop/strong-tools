var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

var SANDBOX = path.resolve(__dirname, 'SANDBOX');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');
var SANDBOX_CONTRIB = path.resolve(SANDBOX, 'CONTRIBUTING.md');
var SANDBOX_CONTRIB_SUGG = path.resolve(SANDBOX, 'CONTRIBUTING.md.suggested');

rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');

var cla = require('../').cla;
var output = [];
function logger() {
  output.push(arguments);
}

assert(cla, 'cla is exported');
assert(!fs.existsSync(SANDBOX_CONTRIB),
       'Starting with no CONTIRBUTING.md');
assert(!fs.existsSync(SANDBOX_CONTRIB_SUGG),
       'Starting with no CONTIRBUTING.md.suggested');

assert.doesNotThrow(cla.bind(null, SANDBOX_PKG, logger),
                    'Runs when only the package.json exists');
assert(fs.existsSync(SANDBOX_CONTRIB),
       '  A default CONTRIBUTING.md is created');
assert(!fs.existsSync(SANDBOX_CONTRIB_SUGG),
       '  A CONTRIBUTIONG.md.suggested is NOT created');

assert.doesNotThrow(cla.bind(null, SANDBOX_PKG, logger),
                    'Re-runs when a correct CONTRIBUTING.md exists');
assert(fs.existsSync(SANDBOX_CONTRIB),
       '  The original CONTRIBUTING.md still exists');
assert(!fs.existsSync(SANDBOX_CONTRIB_SUGG),
       '  A CONTRIBUTIONG.md.suggested is NOT created');

fs.writeFileSync(SANDBOX_CONTRIB, 'This is the stuff', 'utf8');
assert.doesNotThrow(cla.bind(null, SANDBOX_PKG, logger),
                    'Re-runs when an incorrect CONTRIBUTING.md exists');
assert(fs.existsSync(SANDBOX_CONTRIB),
       '  The original CONTRIBUTING.md still exists');
assert(fs.existsSync(SANDBOX_CONTRIB_SUGG),
       '  A CONTRIBUTIONG.md.suggested is created');

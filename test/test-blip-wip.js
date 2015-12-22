var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-blip');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');
var SANDBOX_SCRIPTS = path.resolve(SANDBOX, 'scripts');

rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');

assert(tools.version.set, 'version exports .set()');

var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!original.optionalDependencies,
       'sl-blip optional dependency missing');       
tools.version.cli('set', '1.2.3', SANDBOX_PKG);

var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert(!original.optionalDependencies,
       '-- sl-blip not added');



var withBlip = {
  name: 'testing',
  scripts:{
    'preinstall':'p.js',
    
    'postinstall':''
  },
  optionalDependencies: {
    'sl-blip': '*',
  }
};

fs.writeFileSync(SANDBOX_PKG, JSON.stringify(withBlip), 'utf8');

original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));

assert(original.optionalDependencies,
       'sl-blip dependency is present');

assert.strictEqual(!original.optionalDependencies['sl-blip'], false,
                   '-- sl-blip is removed from optionalDependencies');

var newVer = false;
tools.version.cli.out = function(output) {
  newVer = output;
};

tools.version.cli('set', '1.2.3', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.2.3',
                   '-- prints name@version');


// var scriptBlip = {
//   name: 'testing',
//   scripts: {
//     'preinstall': 'node scripts/sl-blip.js'
//   }
// };
// fs.writeFileSync(SANDBOX_PKG, JSON.stringify(scriptBlip), 'utf8');
// original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
// assert(original.scripts,
//        'sl-blip script updates when present');
// tools.version.cli('set', '1.2.3', SANDBOX_PKG);
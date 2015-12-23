var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var tools = require('../');

var SANDBOX = path.resolve(__dirname, 'SANDBOX-blip');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');
var SANDBOX_SCRIPTS = path.resolve(SANDBOX, 'scripts');
var BLIP = path.resolve(SANDBOX_SCRIPTS, 'sl-blip.js');
var original = '';
var updated = '';

assert(tools.version.set, 'version exports .set()');
setupSandbox({ name: 'testing' });
original = readJSON();

assert(!original.optionalDependencies && !original.scripts,
  'package has not opted for sl-blip');

tools.version.cli('set', '1.2.3', SANDBOX_PKG);
updated = readJSON();
assert(!updated.optionalDependencies && !updated.scripts,
  '-- sl-blip not added in optionalDependencies or scripts');

setupSandbox({
  name: 'testing',
  optionalDependencies: {
    'sl-blip': '*'
  }
});

original = readJSON();
assert(original.optionalDependencies['sl-blip'] && !original.scripts,
  'sl-blip is present in optionalDependencies, not in scripts');
tools.version.cli('set', '1.2.3', SANDBOX_PKG);

updated = readJSON();
assert.equal(updated.optionalDependencies['sl-blip'], undefined,
  '-- sl-blip removed from optionalDependencies')
assert.strictEqual(updated.scripts['preinstall'], 'node scripts/sl-blip.js',
  '-- sl-blip added to package.scripts')
assert(fs.readFileSync(BLIP), '-- sl-blip.js file added to pkg/scripts/ dir');

setupSandbox({
  name: 'testing',
  scripts: {
    'install': 'node scripts/sl-blip.js'
  }
});
original = readJSON();
assert(!original.optionalDependencies,
  'With missing optionalDependencies')
commonAssert();
setupSandbox({
  name: 'testing',
  optionalDependencies: {
    'sl-blip': '*'
  },
  scripts: {
    'install': 'node scripts/sl-blip.js'
  }
});
original = readJSON();
assert(original.optionalDependencies['sl-blip'], 'With sl-blip in optionalDependencies')
commonAssert();
updated = readJSON();
assert.equal(updated.optionalDependencies['sl-blip'], undefined,
  '-- sl-blip removed from optionalDependencies')

setupSandbox({
  name: 'testing',
  optionalDependencies: {
    'sl-blip': '*'
  },
  scripts: {
    'preinstall': 'node prei.js',
    'install': 'node script.js',
    'postinstall': 'bower'
  }
});
original = readJSON();
assert(original.optionalDependencies
  && original.scripts['preinstall']
  && original.scripts['install']
  && original.scripts['postinstall'],
  'Opted for blip in optionalDependencies, with preinstall, install, postinstall scripts present');
tools.version.cli('set', '1.2.3', SANDBOX_PKG);
updated = readJSON();
assert.equal(updated.optionalDependencies['sl-blip'], undefined,
  '-- sl-blip removed from optionalDependencies')
assert.strictEqual(updated.scripts['postinstall'], 'bower && node scripts/sl-blip.js',
  '-- sl-blip appended to postinstall script')
assert(fs.readFileSync(BLIP), '-- sl-blip.js file added to pkg/scripts/ dir');

var newVer = false;
tools.version.cli.out = function (output) {
  newVer = output;
}

tools.version.cli('set', '1.2.3', SANDBOX_PKG);
assert.strictEqual(newVer, 'testing@1.2.3',
  'prints name@version');
rimraf.sync(SANDBOX);

//helpers to make tests more human
function readJSON() {
  return JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
}

function setupSandbox(pkgConfig) {
  rimraf.sync(SANDBOX);
  fs.mkdirSync(SANDBOX);
  fs.writeFileSync(SANDBOX_PKG, JSON.stringify(pkgConfig), 'utf8');

}

function commonAssert() {
  fs.mkdirSync(SANDBOX_SCRIPTS);
  fs.writeFileSync(path.resolve(SANDBOX_SCRIPTS, 'sl-blip.js'), 'boom', 'utf-8');
  var blipLen = fs.readFileSync(BLIP, 'utf-8').length;

  assert.equal(original.scripts['install'], 'node scripts/sl-blip.js',
    ' -with sl-blip in scripts ')

  assert.equal(blipLen, 4,
    ' -and outdated sl-blip.js file');
  tools.version.cli('set', '1.2.3', SANDBOX_PKG);

  assert.notEqual(fs.readFileSync(BLIP, 'utf-8').length, blipLen,
    '-- updated sl-blip.js to the latest version');
}

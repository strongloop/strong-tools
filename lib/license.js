'use strict';

var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('strong-tools:fix-license');
var exec = require('child_process').execSync;
var fs = require('fs');
var json = require('json-file-plus');

var STRONGLOOP = fs.readFileSync(require.resolve('./STRONGLOOP.tpl'));
var DUAL_MIT = fs.readFileSync(require.resolve('./DUAL_MIT.tpl'));
var DUAL_ARTISTIC = fs.readFileSync(require.resolve('./DUAL_ARTISTIC.tpl'));

assert(exec, 'node 0.12+ is required by the license utility');

module.exports.cli = fixCli;

/*
TODO

Add logic based on package name:

- repos with the string 'example' in their package name are allowed to be
  MIT-ONLY: the package.license property should be `MIT`, and there should
  NOT be a LICENSE or LICENSE.md file

- repos that do NOT contain strong or loopback in them should not have their
  packages modified... the tool could skip them (or you can not run the tool
  on non-strongloop repos!)
*/

function fixCli(pkgPath) {
  pkgPath = pkgPath || 'package.json';
  debug(pkgPath);
  json(pkgPath, function(err, file) {
    assert.ifError(err);

    var name = file.data.name;
    var license = file.data.license;

    if (!license) {
      console.error('%s: no license property!', name);
      process.exit(1);
    }

    debug('license: %j', license);

    // License object
    switch (license.name) {
      case 'StrongLoop': // OBSOLETE
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        writeStrongloopLicense();
        return save();

      case 'Dual Artistic/StrongLoop': // OBSOLETE
      case 'Dual Artistic-2.0/StrongLoop': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        writeArtisticLicense(name);
        return save();

      case 'Dual MIT/StrongLoop': // OBSOLETE
        file.data.license = 'MIT';
        writeMitLicense(name);
        return save();
    }

    // License string
    switch (license) {
      case '(Artistic-2.0 OR LicenseRef-LICENSE.md)': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE.md': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE': // OBSOLETE
      case 'Artistic 2.0': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        writeArtisticLicense(name);
        return save();

      case 'LicenseRef-LICENSE.md': // OBSOLETE
      case 'LicenseRef-LICENSE': // OBSOLETE
      case 'SEE LICENSE IN LICENSE': // OBSOLETE
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        writeStrongloopLicense();
        return save();


        // The only current VALID license forms:

      case 'SEE LICENSE IN LICENSE.md': // STRONGLOOP ONLY
        writeStrongloopLicense();
        return ok();

      case 'Artistic-2.0': // ARTISTIC-2.0 or STRONGLOOP
        writeArtisticLicense(name);
        return ok();

      case 'MIT': // MIT or STRONGLOOP
        writeMitLicense(name);
        return ok();

      default:
        console.log('wrong %s: license unknown %j', name, license);
        process.exit(1);
    }

    function ok() {
      console.log('valid %s: %j', name, license);
      process.exit(0);
    }

    function save() {
      console.log('fixed %s: %j to %j', name, license, file.data.license);

      file.save(function(err) {
        assert.ifError(err);
        process.exit(0);
      });
    }
  });
}

function writeStrongloopLicense() {
  fs.writeFileSync('LICENSE.md', STRONGLOOP);
  exec('git add LICENSE.md');
  try {
    fs.statSync('LICENSE');
    exec('git rm -f LICENSE');
  } catch(_) {
    // ignore
  }
}

// Note - Loopback dual sl/mit license is different from the Nodeops dual
// sl/artistic license, it has a different name, and it has copies of license
// text as opposed to markdown references.
function writeMitLicense(pkgName) {
  writeTemplatedLicense('LICENSE', 'LICENSE.md', DUAL_MIT, pkgName);
}

function writeArtisticLicense(pkgName) {
  writeTemplatedLicense('LICENSE.md', 'LICENSE', DUAL_ARTISTIC, pkgName);
}

function writeTemplatedLicense(newName, oldName, text, pkgName) {
  assert(newName);
  assert(oldName);
  assert(text);
  assert(pkgName);
  var others = hasOthers() ? ' and other contributors' : '';
  var license = _.template(String(text))({
    name: pkgName,
    others: others,
  });
  fs.writeFileSync(newName, license);
  exec('git add ' + newName);
  try {
    fs.statSync(oldName);
    exec('git rm -f ' + oldName);
  } catch(_) {
    // ignore
  }
}

function hasOthers() {
  var old = readLicense();
  return old && /strongloop.*other.*contributors/i.test(old);
}

function readLicense() {
  return readFile('LICENSE') || readFile('LICENSE.md');
}

function readFile(name) {
  try {
    return fs.readFileSync(name);
  } catch(er) {
    return null;
  }
}

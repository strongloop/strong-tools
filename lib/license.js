'use strict';

var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('strong-tools:fix-license');
var exec = require('sync-exec');
var fs = require('fs');
var json = require('json-file-plus');
var path = require('path');

var STRONGLOOP = fs.readFileSync(require.resolve('./STRONGLOOP.tpl'));
var MIT = fs.readFileSync(require.resolve('./MIT.tpl'));
var DUAL_MIT = fs.readFileSync(require.resolve('./DUAL_MIT.tpl'));
var DUAL_ARTISTIC = fs.readFileSync(require.resolve('./DUAL_ARTISTIC.tpl'));
var ARTISTIC; // FIXME(sam) I'm not sure what it should look like


module.exports.cli = fixCli;

function fixCli(pkgPath) {
  pkgPath = pkgPath || 'package.json';
  debug(pkgPath);
  var setLicense = pkgPath.match(/^--(.*)/);
  if (setLicense) {
    pkgPath = 'package.json';
    setLicense = setLicense[1];
  }

  try {
    fs.statSync(pkgPath);
  } catch (er) {
    console.error('Failed to open %s: %s', path.resolve(pkgPath), er.message);
    process.exit(1);
  }

  json(pkgPath, rewrite);

  function rewrite(err, file) {
    assert.ifError(err, 'Failed to open ' + pkgPath + ': ' + pkgPath);

    var name = file.data.name;
    var license = file.data.license;
    var description = file.data.description;

    switch (setLicense) {
      case 'strongloop':
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        license = writeStrongloopLicense(name);
        return save();

      case 'artistic':
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(name, false);
        return save();

      case 'dual-artistic':
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(name, true);
        return save();

      case 'mit':
        file.data.license = 'MIT';
        license = writeMitLicense(name, false);
        return save();

      case 'dual-mit':
        file.data.license = 'MIT';
        license = writeMitLicense(name, true);
        return save();
    }

    if (!license) {
      console.error('%s: no license property!', name);
      process.exit(1);
    }

    debug('license: %j', license);

    // License object
    switch (license.name) {
      case 'StrongLoop': // OBSOLETE
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        license = writeStrongloopLicense(name);
        return save();

      case 'Dual Artistic/StrongLoop': // OBSOLETE
      case 'Dual Artistic-2.0/StrongLoop': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(name, true);
        return save();

      case 'Dual MIT/StrongLoop': // OBSOLETE
        file.data.license = 'MIT';
        license = writeMitLicense(name, true);
        return save();
    }

    // License string
    switch (license) {
      case '(Artistic-2.0 OR LicenseRef-LICENSE.md)': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE.md': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(name, true);
        return save();

      case 'Artistic 2.0': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(name);
        return save();

      case 'LicenseRef-LICENSE.md': // OBSOLETE
      case 'LicenseRef-LICENSE': // OBSOLETE
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        license = writeStrongloopLicense(name);
        return save();


        // The only current VALID license forms:

      case 'SEE LICENSE IN LICENSE.md': // STRONGLOOP ONLY
        license = writeStrongloopLicense(name);
        return ok();

      case 'Artistic-2.0': // ARTISTIC-2.0 or DUAL/ARTISTIC-2.0
        license = writeArtisticLicense(name);
        return ok();

      case 'MIT': // MIT or DUAL/MIT
        license = writeMitLicense(name);
        return ok();

      case 'SEE LICENSE IN LICENSE': // STRONGLOOP-ONLY variant used only by
        // strong-agent, which has some code derived from node-time, so it has
        // a license variant, if we see it, leave it alone for now. :-(
        if (name === 'strong-agent') {
          console.log('valid %s: StrongLoop + nodetime MIT (%s)',
                      name, description);
          process.exit(0);
        }
        // otherwise, drop-down to unknown, this isn't a valid form
        // eslint: no-fallthrough:0

      default:
        console.log('wrong %s: license unknown %j', name, license);
        process.exit(1);
    }

    function ok() {
      console.log('valid %s: %s (%s)', name, license, description);
      process.exit(0);
    }

    function save() {
      console.log('fixed %s: %j to %j', name, license, file.data.license);

      file.save(function(err) {
        assert.ifError(err);
        process.exit(0);
      });
    }
  }
}

function writeStrongloopLicense(pkgName) {
  assert(pkgName);
  writeTemplatedLicense('LICENSE.md', 'LICENSE', STRONGLOOP, pkgName);
  return 'StrongLoop';
}

// Note - Loopback dual sl/mit license is different from the Nodeops dual
// sl/artistic license, it has a different name, and it has copies of license
// text as opposed to markdown references.
function writeMitLicense(pkgName, dual) {
  dual = hasStrongLoop(dual);
  var tpl = dual ? DUAL_MIT : MIT;
  writeTemplatedLicense('LICENSE', 'LICENSE.md', tpl, pkgName);
  return dual ? 'StrongLoop or MIT' : 'MIT';
}

function writeArtisticLicense(pkgName, dual) {
  dual = hasStrongLoop(dual);
  var tpl = dual ? DUAL_ARTISTIC : ARTISTIC;
  assert(tpl, 'license form not yet defined');
  writeTemplatedLicense('LICENSE.md', 'LICENSE', tpl, pkgName);
  return dual ? 'StrongLoop or Artistic-2.0' : 'Artistic-2.0';
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
  } catch (_) {
    // ignore
  }
}

function hasOthers() {
  var old = readLicense();
  return /strongloop.*other.*contributors/i.test(old);
}

function hasStrongLoop(dual) {
  if (dual != null)
    return dual;
  var old = readLicense();
  return /strongloop subscription agreement/i.test(old);
}

function readLicense() {
  return readFile('LICENSE') || readFile('LICENSE.md');
}

function readFile(name) {
  try {
    return fs.readFileSync(name);
  } catch (er) {
    return '';
  }
}

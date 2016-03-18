// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');
var assert = require('assert');
var copyright = require('./copyright');
var debug = require('debug')('strong-tools:fix-license');
var exec = require('sync-exec');
var fs = require('fs');
var json = require('json-file-plus');
var path = require('path');

// default to current year, possibly overridden later
var years = (new Date()).getFullYear();

var CUSTOM = 'Unlicensed.';
if (process.env.SLT_LICENSE) {
  CUSTOM = fs.readFileSync(process.env.SLT_LICENSE);
}
var MIT = fs.readFileSync(require.resolve('./MIT.tpl'));
var ARTISTIC = fs.readFileSync(require.resolve('./ARTISTIC.tpl'));

exports.cli = fixCli;

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

  copyright.years('.').then(function(actualYears) {
    if (actualYears.length > 0) {
      years = actualYears.join(',');
    }
    json(pkgPath, rewrite);
  });

  function rewrite(err, file) {
    assert.ifError(err, 'Failed to open ' + pkgPath + ': ' + pkgPath);

    var name = file.data.name;
    var license = file.data.license;

    switch (setLicense) {
      case 'artistic':
      case 'dual-artistic': // deprecated
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(file.data);
        return save();

      case 'dual-mit': // deprecated
      case 'mit':
        file.data.license = 'MIT';
        license = writeMitLicense(file.data);
        return save();

      case 'custom':
      default:
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        license = writeCustomLicense(file.data);
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
        license = writeCustomLicense(file.data);
        return save();

      case 'Dual Artistic/StrongLoop': // OBSOLETE
      case 'Dual Artistic-2.0/StrongLoop': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(file.data);
        return save();

      case 'Dual MIT/StrongLoop': // OBSOLETE
        file.data.license = 'MIT';
        license = writeMitLicense(file.data);
        return save();
    }

    // License string
    switch (license) {
      case '(Artistic-2.0 OR LicenseRef-LICENSE.md)': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE.md': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE': // OBSOLETE
      case 'Artistic 2.0': // OBSOLETE
      case 'Artistic-2.0':
        file.data.license = 'Artistic-2.0';
        license = writeArtisticLicense(file.data);
        return save();

      case '(MIT OR LicenseRef-LICENSE.md)': // OBSOLETE
      case 'MIT OR LicenseRef-LICENSE.md': // OBSOLETE
      case 'MIT OR LicenseRef-LICENSE': // OBSOLETE
      case 'MIT':
        file.data.license = 'MIT';
        license = writeMitLicense(file.data);
        return save();

      // Not open source
      case 'LicenseRef-LICENSE.md': // OBSOLETE
      case 'LicenseRef-LICENSE': // OBSOLETE
      case 'SEE LICENSE IN LICENSE.md':
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        license = writeCustomLicense(file.data);
        return save();

      default:
        console.log('wrong %s: license unknown %j', name, license);
        process.exit(1);
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

function writeCustomLicense(pkg) {
  assert(pkg.name);
  writeTemplatedLicense('LICENSE.md', 'LICENSE', CUSTOM, pkg);
  return 'Custom';
}

// Note - Loopback license is different from the Nodeops artistic license,
// it has a different name, and it has copies of license text as opposed to
// markdown references.
function writeMitLicense(pkg) {
  writeTemplatedLicense('LICENSE', 'LICENSE.md', MIT, pkg);
  return 'MIT';
}

function writeArtisticLicense(pkg) {
  writeTemplatedLicense('LICENSE.md', 'LICENSE', ARTISTIC, pkg);
  return 'Artistic-2.0';
}

function writeTemplatedLicense(newName, oldName, text, pkg) {
  assert(newName);
  assert(oldName);
  assert(text);
  assert(pkg.name);
  var others = hasOthers() ? ' and other contributors' : '';
  var license = _.template(String(text))({
    name: pkg.name,
    owner: process.env.SLT_OWNER ||
          _.get(pkg, 'author.name', _.get(pkg, 'author', 'Author')),
    others: others,
    years: years,
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
  return /.*other.*contributors/i.test(old);
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

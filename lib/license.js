// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var assert = require('assert');
var copyright = require('./copyright');
var debug = require('debug')('strong-tools:fix-license');
var fs = require('fs');
var git = require('./git');
var json = require('json-file-plus');
var path = require('path');

// default to current year, possibly overridden later
var years = (new Date()).getFullYear();

var CUSTOM = 'Unlicensed.';
if (process.env.SLT_LICENSE) {
  CUSTOM = fs.readFileSync(process.env.SLT_LICENSE);
}
var MIT = fs.readFileSync(require.resolve('./MIT.tpl'));
var APACHE = fs.readFileSync(require.resolve('./APACHE.tpl'));
var ARTISTIC = fs.readFileSync(require.resolve('./ARTISTIC.tpl'));

fixCli.out = console.log;
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

  return copyright.years('.').then(function(actualYears) {
    if (actualYears.length > 0) {
      years = actualYears.join(',');
    }
    return json(pkgPath).catch(function(err) {
      assert.ifError(err, 'Failed to open ' + pkgPath + ': ' + pkgPath);
    }).then(rewrite);
  });

  function rewrite(file) {
    var name = file.data.name;
    var license = file.data.license;

    if (setLicense) {
      switch (setLicense) {
        case 'apache-2.0':
        case 'apache-2':
        case 'apache':
          file.data.license = 'Apache-2.0';
          return writeApacheLicense(file.data).then(save);

        case 'artistic':
        case 'dual-artistic': // deprecated
          file.data.license = 'Artistic-2.0';
          return writeArtisticLicense(file.data).then(save);

        case 'dual-mit': // deprecated
        case 'mit':
          file.data.license = 'MIT';
          return writeMitLicense(file.data).then(save);

        case 'custom':
        default:
          file.data.license = 'SEE LICENSE IN LICENSE.md';
          return writeCustomLicense(file.data).then(save);
      }
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
        return writeCustomLicense(file.data).then(save);

      case 'Dual Artistic/StrongLoop': // OBSOLETE
      case 'Dual Artistic-2.0/StrongLoop': // OBSOLETE
        file.data.license = 'Artistic-2.0';
        return writeArtisticLicense(file.data).then(save);

      case 'Dual MIT/StrongLoop': // OBSOLETE
        file.data.license = 'MIT';
        return writeMitLicense(file.data).then(save);
    }

    // License string
    switch (license) {
      case 'Apache-2.0':
      case 'Apache-2':
      case 'Apache':
      case 'apache':
        file.data.license = 'Apache-2.0';
        return writeApacheLicense(file.data).then(save);

      case '(Artistic-2.0 OR LicenseRef-LICENSE.md)': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE.md': // OBSOLETE
      case 'Artistic-2.0 OR LicenseRef-LICENSE': // OBSOLETE
      case 'Artistic 2.0': // OBSOLETE
      case 'Artistic-2.0':
        file.data.license = 'Artistic-2.0';
        return writeArtisticLicense(file.data).then(save);

      case '(MIT OR LicenseRef-LICENSE.md)': // OBSOLETE
      case 'MIT OR LicenseRef-LICENSE.md': // OBSOLETE
      case 'MIT OR LicenseRef-LICENSE': // OBSOLETE
      case 'MIT':
        file.data.license = 'MIT';
        return writeMitLicense(file.data).then(save);

      // Not open source
      case 'LicenseRef-LICENSE.md': // OBSOLETE
      case 'LicenseRef-LICENSE': // OBSOLETE
      case 'SEE LICENSE IN LICENSE.md':
        file.data.license = 'SEE LICENSE IN LICENSE.md';
        return writeCustomLicense(file.data).then(save);

      default:
        fixCli.out('wrong %s: license unknown %j', name, license);
        process.exit(1);
    }

    function save(license) {
      fixCli.out('fixed %s: %j to %j', name, license, file.data.license);
      return file.save();
    }
  }
}

function writeCustomLicense(pkg) {
  assert(pkg.name);
  return writeTemplatedLicense('LICENSE.md', 'LICENSE', CUSTOM, pkg)
    .return('Custom');
}

// Note - Loopback license is different from the Nodeops artistic license,
// it has a different name, and it has copies of license text as opposed to
// markdown references.
function writeMitLicense(pkg) {
  return writeTemplatedLicense('LICENSE', 'LICENSE.md', MIT, pkg).return('MIT');
}

function writeArtisticLicense(pkg) {
  return writeTemplatedLicense('LICENSE.md', 'LICENSE', ARTISTIC, pkg)
    .return('Artistic-2.0');
}

function writeApacheLicense(pkg) {
  return writeTemplatedLicense('LICENSE', 'LICENSE.md', APACHE, pkg)
    .return('Apache-2.0');
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
  return Promise.join(
    git('add', newName).catch(_.noop),
    git('rm', '-f', oldName).catch(_.noop),
    _.noop);
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

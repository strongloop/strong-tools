// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fmt = require('util').format;
var Project = require('./project');
var semver = require('semver');
var validSPDX = require('spdx-expression-validate');

module.exports = lint;
module.exports.cli = lintCli;

var fields = [
  'name',
  'version',
  'description',
  'main',
  'repository',
  'keywords',
  'author',
  'license',
  'bugs',
  'homepage',
];

function lintCli(pkgPath) {
  var pkg = new Project(pkgPath || './');
  var results = lint(pkg.rawPkgJSON);

  results.forEach(function log(fault) {
    console.log(fault);
  });

  process.exit(results.length);
}

function lint(json) {
  var results = [];
  checkMissing(json, record);
  checkVersion(json, record);
  checkRepository(json, record);
  checkLicense(json, record);
  // TODO: check for default: "echo \"Error: no test specified\" && exit 1"
  return results;

  function record(msg) {
    results.push(msg);
  }
}

function checkMissing(json, report) {
  fields.forEach(function(v) {
    if (!(v in json)) {
      report(fmt('Field "%s" is missing', v));
    }
  });
}

function checkVersion(json, report) {
  if ('version' in json) {
    var v = semver.parse(json.version);
    if (!v) {
      report(fmt('Version "%s" is invalid', json.version));
    } else if (!semver.gte(json.version, '1.0.0-0')) {
      // the only versions below 1.0.0 allowed are pre-releases of 1.0.0
      report(fmt('Version "%s" is lower than 1.0.0', json.version));
    }
  }
}

function checkLicense(json, report) {
  var lic = json.license;
  if ('license' in json && !validSPDX(lic)) {
    report(fmt('License not valid SPDX expression: %j', json.license));
  }
}

function checkRepository(json, report) {
  if ('repository' in json) {
    if ((typeof json.repository === 'string') ||
        (json.repository instanceof String)) {
      report(fmt('Repository "%s" is a string, not an object',
                 json.repository));
    } else if (typeof json.repository === 'object') {
      if (!('type' in json.repository)) {
        report('Repository is missing "type" property');
      } else {
        // TODO: validate format
      }
      if (!('url' in json.repository)) {
        report('Repository is missing "url" property');
      } else {
        // TODO: validate format
      }
    } else {
      report(fmt('Repository property is malformed: %j', json.repository));
    }
  }
}

'use strict';

var _ = require('lodash');
var git = require('./git');

var COPYRIGHT = [
  'Licensed Materials - Property of IBM',
  'IBM StrongLoop Software',
  'Copyright IBM Corp. <%= years %>. All Rights Reserved.',
].join('\n');
var RESTRICTED = [
  'US Government Users Restricted Rights - Use, duplication or disclosure',
  'restricted by GSA ADP Schedule Contract with IBM Corp.',
].join('\n');
var LICENSE = [
  'Licensed under <%= name %> available <%= ref %>',
].join('\n');
var COMMERCIAL = _.template([COPYRIGHT, RESTRICTED].join('\n'));
var OSS = _.template([COPYRIGHT, LICENSE].join('\n'));

exports.years = copyYears;
exports.header = copyHeader;

function copyYears(path) {
  path = path || '.';
  var dates = git('log --pretty=%%ai --all -- %s', path);
  return dates.then(function(dates) {
    var years = _.map(dates, getYear);
    return _.uniq(years).sort();
  });
}

// assumes ISO-8601 (or similar) format
function getYear(str) {
  return str.slice(0, 4);
}

function copyHeader(path, lic) {
  var years = copyYears(path);
  var params = expandLicense(lic);
  return years.then(function(years) {
    params.years = years.join(',');
    return params.template(params);
  });
}

function expandLicense(name) {
  if (/artistic/i.test(name)) {
    return {
      template: OSS,
      name: 'Artistic License 2.0',
      ref: 'in LICENSE.md',
    };
  }
  if (/^mit$/i.test(name)) {
    return {
      template: OSS,
      name: 'MIT License',
      ref: 'at http://some-url/',
    };
  }
  return {
    template: COMMERCIAL,
    name: 'IBM License',
    ref: 'from IBM',
  };
}

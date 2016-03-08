'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var git = require('./git');
var readFile = Promise.promisify(require('fs').readFile);
var writeFile = Promise.promisify(require('fs').writeFile);

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
exports.ensure = ensureHeader;

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

function formattedHeader(path, lic) {
  // TODO: detect file type and format header appropriately
  return copyHeader(path, lic).then(jsCommented);
}

function jsCommented(text) {
  return text.split('\n').map(jsCommentLine).join('\n') + '\n';
}

function jsCommentLine(line) {
  return '// ' + line;
}

function ensureHeader(path, lic) {
  var expected = formattedHeader(path, lic);
  var current = readFile(path, 'utf8');
  return Promise.join(path, expected, current, ensureHeaderWrite);
}

function ensureHeaderWrite(path, header, content) {
  if (content.indexOf(header) < 0) {
    content = header + '\n' + content;
    return writeFile(path, content, 'utf8').return(content);
  }
  return content;
}

'use strict';

var Project = require('./project');
var Promise = require('bluebird');
var _ = require('lodash');
var git = require('./git');
var paths = require('./paths');
var readFile = Promise.promisify(require('fs').readFile);
var writeFile = Promise.promisify(require('fs').writeFile);

// Components of the copyright header.
var COPYRIGHT = [
  'Licensed Materials - Property of IBM',
  'IBM StrongLoop Software',
  'Copyright IBM Corp. <%= years %>. All Rights Reserved.',
];
var RESTRICTED = [
  'US Government Users Restricted Rights - Use, duplication or disclosure',
  'restricted by GSA ADP Schedule Contract with IBM Corp.',
];
var LICENSE = [
  'Licensed under <%= name %> available <%= ref %>',
];

// Compiled templates for generating copyright headers
var COMMERCIAL = _.template(COPYRIGHT.concat(RESTRICTED).join('\n'));
var OSS = _.template(COPYRIGHT.concat(LICENSE).join('\n'));

// Patterns for matching previously generated copyright headers
var BLANK = /^\s*$/;
var ANY = COPYRIGHT.concat(RESTRICTED).concat(LICENSE).map(function(l) {
  return new RegExp(l.replace(/<%[^>]+%>/g, '.*'));
});

exports.years = copyYears;
exports.header = copyHeader;
exports.ensure = ensureHeader;
exports.fix = fixHeaders;
exports.cli = copyCli;

function copyCli(files) {
  var pkg = new Project('./package.json');
  var lic = pkg.license();
  console.error('copyright (%s)', lic, arguments);
  if (files) {
    files = paths.jsFiles(_.toArray(arguments));
  } else {
    files = git('ls-files').then(paths.jsFiles);
  }
  return files.tap(function(files) {
    console.log('processing %j', files);
  }).each(function(path) {
    return ensureHeader(path, lic).then(function() {
      console.log('touched: %s', path);
    });
  });
}

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
  if (/^artistic/i.test(name)) {
    return {
      template: OSS,
      name: 'Artistic License 2.0',
      ref: 'at https://opensource.org/licenses/Artistic-2.0',
    };
  }
  if (/^mit$/i.test(name)) {
    return {
      template: OSS,
      name: 'MIT License',
      ref: 'at https://opensource.org/licenses/MIT',
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
  return text.split('\n').map(jsCommentLine);
}

function jsCommentLine(line) {
  return '// ' + line;
}

function ensureHeader(path, lic) {
  var expected = formattedHeader(path, lic);
  var current = readFile(path, 'utf8');
  var updated = Promise.join(path, expected, current, combineHeaderWithContent);
  return updated.then(function(content) {
    return writeFile(path, content, 'utf8').return(content);
  });
}

function combineHeaderWithContent(path, header, content) {
  var lineEnding = /\r\n/mg.test(content) ? '\r\n' : '\n';
  var preamble = [];
  content = content.split(lineEnding);
  if (/^#!/.test(content[0])) {
    preamble.push(content.shift());
  }
  // replace any existing copyright header lines and collapse blank lines down
  // to just one.
  while (headerOrBlankLine(content[0])) {
    content.shift();
  }
  return [].concat(preamble, header, '', content).join(lineEnding);
}

function fixHeaders(patterns, lic) {
  var files = paths.jsFiles(patterns);
  return files.map(function(path) {
    return ensureHeader(path, lic).return(path);
  });
}

function headerOrBlankLine(line) {
  return BLANK.test(line) || ANY.some(function(pat) {
    return pat.test(line);
  });
}

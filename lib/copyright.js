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
  'Copyright <%= owner %> <%= years %>. All Rights Reserved.',
  'Node module: <%= name %>',
];
var LICENSE = [
  'This file is licensed under the <%= license %>.',
  'License text available <%= ref %>',
];
var CUSTOM_LICENSE = [];
if (process.env.SLT_COPYRIGHT) {
  CUSTOM_LICENSE = require(process.env.SLT_COPYRIGHT);
}

// Compiled templates for generating copyright headers
var UNLICENSED = _.template(COPYRIGHT.join('\n'));
var LICENSED = _.template(COPYRIGHT.concat(LICENSE).join('\n'));
var CUSTOM = UNLICENSED;
if (CUSTOM_LICENSE.length) {
  CUSTOM = _.template(COPYRIGHT.concat(CUSTOM_LICENSE).join('\n'));
}

// Patterns for matching previously generated copyright headers
var BLANK = /^\s*$/;
var ANY = COPYRIGHT.concat(LICENSE, CUSTOM_LICENSE).map(function(l) {
  return new RegExp(l.replace(/<%[^>]+%>/g, '.*'));
});

exports.years = copyYears;
exports.header = copyHeader;
exports.ensure = ensureHeader;
exports.fix = fixHeaders;
exports.cli = copyCli;

function copyCli(files) {
  var pkg = new Project('./package.json');
  console.error('copyright (%s)', pkg.license(), arguments);
  if (files) {
    files = paths.jsFiles(_.toArray(arguments));
  } else {
    files = git('ls-files').then(paths.jsFiles);
  }
  return files.tap(function(files) {
    console.log('processing %j', files);
  }).each(function(path) {
    return ensureHeader(path, pkg).then(function() {
      console.log('touched: %s', path);
    });
  });
}

function copyYears(path) {
  path = path || '.';
  var dates = git('log --pretty=%%ai --all -- %s', path);
  return dates.then(function(dates) {
    if (_.isEmpty(dates)) {
      // if the given path doesn't have any git history, assume it is new
      dates = [(new Date()).toJSON()];
    } else {
      dates = [_.first(dates), _.last(dates)];
    }
    var years = _.map(dates, getYear);
    return _.uniq(years).sort();
  });
}

// assumes ISO-8601 (or similar) format
function getYear(str) {
  return str.slice(0, 4);
}

function copyHeader(path, pkg) {
  var years = copyYears(path);
  var params = expandLicense(pkg);
  return years.then(function(years) {
    params.years = years.join(',');
    _.defaults(params, {
      owner: process.env.SLT_OWNER || pkg.get('author.name', 'Owner'),
      name: pkg.get('name'),
      license: pkg.get('license'),
    });
    return params.template(params);
  });
}

function expandLicense(pkg) {
  var name = _.result(pkg, 'license', pkg);
  if (/^artistic/i.test(name)) {
    return {
      template: LICENSED,
      license: 'Artistic License 2.0',
      ref: 'at https://opensource.org/licenses/Artistic-2.0',
    };
  }
  if (/^mit$/i.test(name)) {
    return {
      template: LICENSED,
      license: 'MIT License',
      ref: 'at https://opensource.org/licenses/MIT',
    };
  }
  return {
    template: CUSTOM,
    license: name,
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

function ensureHeader(path, pkg) {
  var expected = formattedHeader(path, pkg);
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

function fixHeaders(patterns, pkg) {
  var files = paths.jsFiles(patterns);
  return files.map(function(path) {
    return ensureHeader(path, pkg).return(path);
  });
}

function headerOrBlankLine(line) {
  return BLANK.test(line) || ANY.some(function(pat) {
    return pat.test(line);
  });
}

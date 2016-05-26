// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var _ = require('lodash');
var fmt = require('util').format;
var normalizeLicense = require('normalize-license-data');
var Project = require('./project');
var https = require('https');

module.exports = exports = {
  cli: cli,
  simpleCommand: simpleCommand,
  get: getCommand,
  name: simpleCommand('name'),
  version: simpleCommand('version'),
  released: releasedCommand,
  repo: simpleCommand('ghSlug'),
  license: licenseCommand,
};
exports.cli.out = console.log;

var commands = {
  name: exports.name,
  get: exports.get,
  released: exports.released,
  version: exports.version,
  repo: exports.repo,
  license: exports.license,
  help: helpCommand,
};

function cli() {
  var cmd = _.head(arguments);
  var args = _.tail(arguments);
  if (cmd in commands) {
    return commands[cmd].apply(null, args);
  } else {
    console.error('Unknown command: %s', cmd);
    usage('slt info', console.log);
  }
}

function getCommand(pkgPath, attr) {
  pkgPath = pkgPath || './';
  var project = new Project(pkgPath);
  cli.out(project.get(attr));
}

function simpleCommand(attr) {
  return commandFn;
  function commandFn(pkgPath) {
    pkgPath = pkgPath || './';
    var project = new Project(pkgPath);
    if (typeof project[attr] === 'function')
      cli.out(project[attr]());
    else
      cli.out(project[attr]);
  }
}

function releasedCommand(pkgPath) {
  pkgPath = pkgPath || './';
  var project = new Project(pkgPath);
  var url = fmt('https://registry.npmjs.org/%s', project.name());
  https.get(url, function(res) {
    var body = '';
    res.on('data', function(d) {
      body += d;
    }).on('end', function() {
      try {
        body = JSON.parse(body);
        cli.out(body['dist-tags'].latest);
      } catch (e) {
        console.error('could not parse response:', e);
      }
    });
  });
}

function licenseCommand(pkgPath) {
  pkgPath = pkgPath || './';
  var project = new Project(pkgPath);
  var lic = normalizeLicense(project.normalizedPkgJSON.license);
  cli.out(lic);
}

function helpCommand() {
  usage('slt info', console.log);
}

function usage($0, p) {
  p('Usage: %s <CMD> [ARGS]', $0);
  p('');
  p('Commands:');
  p('  name      Print package name');
  p('  get       Print arbitrary package.json values');
  p('  version   Print package version');
  p('  license   Print normalized package license');
  p('  released  Print latest version on npmjs.org');
  p('  repo      Print repo URL');
  p('  help      Display this usage');
  p('');
}

var _ = require('lodash');
var fmt = require('util').format;
var normalizeLicense = require('normalize-license-data');
var Project = require('./project');
var request = require('request');

module.exports = exports = {
  cli: cli,
  simpleCommand: simpleCommand,
  name: simpleCommand('name'),
  version: simpleCommand('version'),
  released: releasedCommand,
  repo: simpleCommand('ghSlug'),
  license: licenseCommand,
};
exports.cli.out = console.log;

var commands = {
  name: exports.name,
  released: exports.released,
  version: exports.version,
  repo: exports.repo,
  license: exports.license,
  help: helpCommand,
};

function cli() {
  var cmd = _.first(arguments);
  var args = _.rest(arguments);
  if (cmd in commands) {
    return commands[cmd].apply(null, args);
  } else {
    console.error('Unknown command: %s', cmd);
    usage('slt info', console.log);
  }
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
  var req = {
    url: fmt('https://registry.npmjs.org/%s', project.name()),
    json: true,
  };
  request(req, function(e, r, pkg) {
    cli.out(pkg['dist-tags'].latest);
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
  p('  version   Print package version');
  p('  license   Print normalized package license');
  p('  released  Print latest version on npmjs.org');
  p('  repo      Print repo URL');
  p('  help      Display this usage');
  p('');
}

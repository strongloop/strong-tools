var _ = require('lodash');
var Project = require('./project');

module.exports = exports = {
  cli: cli,
  simpleCommand: simpleCommand,
  name: simpleCommand('name'),
  version: simpleCommand('version'),
  repo: simpleCommand('ghSlug'),
};
exports.cli.out = console.log;

var commands = {
  name: exports.name,
  version: exports.version,
  repo: exports.repo,
  help: helpCommand,
};

function cli() {
  var cmd = _.first(arguments);
  var args = _.rest(arguments);
  if (cmd in commands) {
    return commands[cmd].apply(null, args);
  } else {
    console.error('Unknown command: %s', cmd);
    usage('slt version', console.log);
  }
}

function simpleCommand(attr) {
  return function(pkgPath) {
    pkgPath = pkgPath || './';
    var project = new Project(pkgPath);
    if (typeof project[attr] === 'function')
      cli.out(project[attr]());
    else
      cli.out(project[attr]);
  }
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
  p('  repo      Print repo URL');
  p('  help      Display this usage');
  p('');
}

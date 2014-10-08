var Project = require('./project');
var semver = require('semver');
var _ = require('lodash');

cli.out = console.log;

module.exports = {
  cli: cli,
  inc: inc,
}

var commands = {
  inc: incCommand,
};

function cli() {
  var cmd = _.first(arguments);
  var args = _.rest(arguments);
  if (cmd in commands) {
    return commands[cmd].apply(null, args);
  } else {
    console.error('Unknown command: %s', cmd);
  }
}

function incCommand(versions) {
  versions = _.flatten(arguments);
  if (versions.length === 0)
    versions = ['./'];

  versions.forEach(function(v) {
    var project = semver.valid(v) ? null : new Project(v);
    v = project ? project.version() : v;
    var next = inc(v);
    if (project) {
      cli.out('Incrementing version in %s from %s to %s',
              project.packageJSONPath, project.version(), next);
      project.version(next);
      project.persist();
    } else {
      cli.out('%s => %s', v, next);
    }
  });
}

var BUILD_NUMBER = process.env.BUILD_NUMBER|0;
var GIT_COMMIT = (process.env.GIT_COMMIT || '').trim().slice(0,7);

function inc(v) {
  // if v is a SemVer instance, make a new one so we don't mutate it.
  var v = semver(v.toString());
  v.inc('prerelease');
  if (BUILD_NUMBER > v.prerelease[0])
    v.prerelease = [ BUILD_NUMBER ];
  if (GIT_COMMIT !== '')
    v.prerelease = [ v.prerelease[0], GIT_COMMIT ];
  v.format();
  return v;
}

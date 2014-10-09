var Project = require('./project');
var semver = require('semver');
var _ = require('lodash');

cli.out = console.log;

module.exports = exports = {
  BUILD_NUMBER: process.env.BUILD_NUMBER,
  GIT_COMMIT: process.env.GIT_COMMIT,
  cli: cli,
  inc: inc,
};


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
    var next = inc(v, exports.BUILD_NUMBER, exports.GIT_COMMIT);
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

function inc(v, buildNumber, gitCommit) {
  // if v is a SemVer instance, make a new one so we don't mutate it.
  var v = semver(v.toString());
  v.inc('prerelease');
  buildNumber = buildNumber|0;
  gitCommit = (gitCommit || '').trim().slice(0, 7);
  if (buildNumber > v.prerelease[0])
    v.prerelease = [ buildNumber ];
  if (gitCommit !== '')
    v.prerelease = [ v.prerelease[0], gitCommit ];
  v.format();
  return v;
}

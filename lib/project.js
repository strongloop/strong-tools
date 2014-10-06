var path = require('path');

var git = require('gift');
var normalizePackageData = require('normalize-package-data');

module.exports = Project;

Project.prototype = {
  name: Project$name,
  ghSlug: Project$ghSlug,
  gather: Project$gather,
};

function Project(pkgPath, cb) {
  if (!(this instanceof Project))
    return new Project(pkgPath, cb);

  if (/package\.json$/.test(pkgPath)) {
    this.pkgJSONPath = path.resolve(pkgPath);
    this.rootPath = path.dirname(this.pkgJSONPath);
  } else {
    this.rootPath = path.resolve(pkgPath);
    this.pkgJSONPath = path.resolve(this.rootPath, 'package.json');
  }

  try {
    this.rawPkgJSON = require(this.pkgJSONPath);
  } catch (e) {
    this.rawPkgJSON = {};
  }

  this.normalizedPkgJSON = normalize(this.rawPkgJSON);

  this.git = git(this.rootPath);
  if (cb)
    this.gather(cb);
}

function Project$gather(cb) {
  var project = this;
  if (this.git) {
    this.git.remotes(function(err, remotes) {
      if (err) return cb(err);
      project.remotes = remotes;
      project.git.config(function(err, config) {
        project.git_config = config;
        cb(err, project);
      });
    });
  } else {
    setImmediate(cb, null, this);
  }
}

function Project$name() {
  if (this.normalizedPkgJSON && this.normalizedPkgJSON.name)
    return this.normalizedPkgJSON.name;
  if (this.rawPkgJSON && this.rawPkgJSON.name)
    return this.rawPkgJSON.name;
  if (this.rootPath)
    return path.basename(this.rootPath);
}

function Project$ghSlug() {
  // TODO(rmg): extract from repository URL with git-remote fallback
  var url = this.git_config && this.git_config.items['remote.origin.url'];
  if (url) {
    var parts = /^git@github.com:([^/]+)\/([^/]+)\.git$/.exec(url);
    if (parts && parts[1] && parts[2])
      return [parts[1], parts[2]].join('/');
  }
  return 'strongloop/' + this.name();
}

function Project$persist() {
  JSON.stringify(pkg, null, 2) + '\n'
}

function Project$toJSON() {
  return JSON.stringify(pkg, null, 2) + '\n'
}

function Project$raw() {
  this.raw = this.raw || require(this.jsonPath());
  return this.raw;
}

function Project$normalized() {
  this.normalized = this.normalized || normalize(this.rawJSON());
  return this.normalized;
}

function normalize(raw, warn, strict) {
  var copy = JSON.parse(JSON.stringify(raw));
  normalizePackageData(copy, warn, strict);
  return copy;
}

function normalizedJSON(pkg) {
  return JSON.stringify(pkg, null, 2) + '\n';
}

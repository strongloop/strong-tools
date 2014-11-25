var fs = require('fs');
var git = require('gift');
var normalizePackageData = require('normalize-package-data');
var path = require('path');

module.exports = Project;

Project.prototype = {
  name: Project$name,
  ghSlug: Project$ghSlug,
  gather: Project$gather,
  version: Project$version,
  persist: Project$persist,
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
    this.rawPkgJSON = JSON.parse(fs.readFileSync(this.pkgJSONPath, 'utf8'));
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

function Project$version(v) {
  if (v)
    return this.rawPkgJSON.version = v.toString();
  else
    return this.normalizedPkgJSON.version || '1.0.0-0';
}

function Project$persist() {
  var newJSON = JSON.stringify(this.rawPkgJSON, null, 2) + '\n';
  fs.writeFileSync(this.pkgJSONPath, newJSON);
}

function normalize(raw, warn, strict) {
  var copy = JSON.parse(JSON.stringify(raw));
  normalizePackageData(copy, warn, strict);
  return copy;
}

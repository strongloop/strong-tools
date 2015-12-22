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
  nameVer: Project$nameVer,
  persist: Project$persist,
  optionalDep: Project$optionalDep,
  scripts: Project$scripts
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

  this.bowerJSONPath = path.resolve(this.rootPath, 'bower.json');

  //test for bower.json existence
  try {
    this.rawBowerJSON = JSON.parse(fs.readFileSync(this.bowerJSONPath, 'utf8'));
  } catch(e) {
    this.rawBowerJSON = null;
  }

  try {
    this.rawPkgJSON = JSON.parse(fs.readFileSync(this.pkgJSONPath, 'utf8'));
  } catch (e) {
    console.error('Could not read package:', e);
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
  if (v) {
    v = this.rawPkgJSON.version = v.toString();

    if (this.rawBowerJSON) {
      this.rawBowerJSON.version = v;
    }

    this.normalizedPkgJSON = normalize(this.rawPkgJSON);
    return v;
  } else {
    return this.normalizedPkgJSON.version || '1.0.0-0';
  }
}

function Project$nameVer() {
  return this.name() + '@' + this.version();
}

function Project$persist() {
  var newJSON = JSON.stringify(this.rawPkgJSON, null, 2) + '\n';
  fs.writeFileSync(this.pkgJSONPath, newJSON);

  //write bower json if necessary
  if (this.rawBowerJSON) {
    var newBowerJSON = JSON.stringify(this.rawBowerJSON, null, 2) + '\n';
    fs.writeFileSync(this.bowerJSONPath, newBowerJSON);
  }
}

function normalize(raw, warn, strict) {
  var copy = JSON.parse(JSON.stringify(raw));
  normalizePackageData(copy, warn, strict);
  return copy;
}

function Project$optionalDep(name, ver) {
  if (arguments.length == 1) {
    return this.rawPkgJSON.optionalDependencies &&
            this.rawPkgJSON.optionalDependencies[name];
  } else {
    if (ver) {
      this.rawPkgJSON.optionalDependencies = this.rawPkgJSON.optionalDependencies || {};
      this.rawPkgJSON.optionalDependencies[name] = ver;
    } else {
      if ('optionalDependencies' in this.rawPkgJSON)
        delete this.rawPkgJSON.optionalDependencies[name];
    }
    this.normalizedPkgJSON = normalize(this.rawPkgJSON);
  }
}

function Project$scripts(key, value){
  if(arguments.length === 1){
    return this.rawPkgJSON.scripts && 
            this.rawPkgJSON.scripts[key]
   } else {
     if(value){
       this.rawPkgJSON.scripts = this.rawPkgJSON.scripts || {};
       this.rawPkgJSON.scripts[key] = value;
     } else{
       if('scripts' in this.rawPkgJSON){
         delete this.rawPkgJSON.scripts[key];
       }
     }
   }
 }

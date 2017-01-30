// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');
var fs = require('fs');
var git = require('gift');
var normalizePackageData = require('normalize-package-data');
var path = require('path');

module.exports = Project;

Project.prototype = {
  name: Project$name,
  license: Project$license,
  ghSlug: Project$ghSlug,
  gather: Project$gather,
  version: Project$version,
  nameVer: Project$nameVer,
  persist: Project$persist,
  optionalDep: getterSetterFor('optionalDependencies'),
  script: getterSetterFor('scripts'),
  get: Project$get,
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

  // test for bower.json existence
  try {
    this.rawBowerJSON = JSON.parse(fs.readFileSync(this.bowerJSONPath, 'utf8'));
  } catch (e) {
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

function Project$license() {
  if (this.normalizedPkgJSON && this.normalizedPkgJSON.license)
    return this.normalizedPkgJSON.license;
  if (this.rawPkgJSON && this.rawPkgJSON.license)
    return this.rawPkgJSON.license;
  return 'SEE LICENSE.md';
}

function Project$get(key, dflt) {
  switch (key) {
    case 'name':
      dflt = this.rootPath ? path.basename(this.rootPath) : dflt;
      break;
    case 'license':
      dflt = dflt || 'SEE LICENSE.md';
      break;
  }
  return _.get(this.normalizedPkgJSON, key,
            _.get(this.rawPkgJSON, key, dflt));
}

var GH_SSH = /^(?:git\+ssh:\/\/)?git@github.com[:\/]([^/]+)\/([^/]+?)(\.git)?$/;
var GH_HTTPS = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/;

function Project$ghSlug() {
  var url = this.git_config && this.git_config.items['remote.origin.url'];
  url = url || _.get(this, 'normalizedPkgJSON.repository.url');
  if (url) {
    var parts = GH_SSH.exec(url);
    if (parts && parts[1] && parts[2])
      return [parts[1], parts[2]].join('/');
    parts = GH_HTTPS.exec(url);
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

  // write bower json if necessary
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

function getterSetterFor(path) {
  return getSetPath;

  function getSetPath(name, value) {
    if (arguments.length === 1) {
      return _.get(this.rawPkgJSON, [path, name]);
    }
    if (value) {
      _.set(this.rawPkgJSON, [path, name], value);
    } else {
      _.unset(this.rawPkgJSON, [path, name]);
    }
    this.normalizedPkgJSON = normalize(this.rawPkgJSON);
  }
}

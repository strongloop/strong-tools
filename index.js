// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var wrapped = require('./lib/wrapped');

module.exports = {
  lint: require('./lib/lint'),
  cla: require('./lib/cla'),
  Project: require('./lib/project'),
  info: require('./lib/info'),
  license: require('./lib/license'),
  version: require('./lib/version'),
  semver: wrapped('semver/bin/semver'),
  copyright: require('./lib/copyright'),
  shrinkwrap: require('./lib/shrinkwrap'),
};

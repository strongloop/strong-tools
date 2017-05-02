// Copyright IBM Corp. 2016,2017. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var glob = Promise.promisify(require('glob'));

exports.jsFiles = jsFiles;

function jsFiles(paths) {
  paths = [].concat(paths);
  var globs = paths.map(function(p) {
    if (/\/$/.test(p)) {
      p += '**/*.{js,ts}';
    } else if (!/[^*]\.(js|ts)$/.test(p)) {
      p += '/**/*.{js,ts}';
    }
    return glob(p, {nodir: true, follow: false});
  });
  return Promise.all(globs).then(_.flatten).then(function(paths) {
    return _.filter(paths, /\.(js|ts)$/);
  });
}

'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var glob = Promise.promisify(require('glob'));

exports.jsFiles = jsFiles;

function jsFiles(paths) {
  paths = [].concat(paths);
  var globs = paths.map(function(p) {
    if (/\/$/.test(p)) {
      p += '**/*.js';
    } else if (!/[^*]\.js$/.test(p)) {
      p += '/**/*.js';
    }
    return glob(p, {nodir: true, follow: false});
  });
  return Promise.all(globs).then(_.flatten).then(function(paths) {
    return _.filter(paths, /\.js$/);
  });
}

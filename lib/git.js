// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var cp = require('child_process');
var fmt = require('util').format;

module.exports = git;

function git(cmdAndArgs) {
  var cmd = 'git ' + fmt.apply(null, arguments);
  git.cache = git.cache || Object.create(null);
  if (cmd in git.cache) {
    return Promise.resolve(git.cache[cmd]);
  }
  return new Promise(function(resolve, reject) {
    cp.exec(cmd, function(err, stdout, stderr) {
      stdout = _(stdout || '').split(/[\r\n]+/g).map(_.trim).select().value();
      if (err) {
        reject(err);
      } else {
        git.cache[cmd] = stdout;
        resolve(stdout);
      }
    });
  });
}

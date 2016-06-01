// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('strong-tools:fix-license');
var json = require('json-file-plus');
var path = require('path');

updateShrinkwrap.out = console.log;
exports.cli = updateShrinkwrap;

function updateShrinkwrap(shrinkwrap) {
  shrinkwrap = path.resolve(shrinkwrap || 'npm-shrinkwrap.json');
  debug(shrinkwrap);

  return json(shrinkwrap).catch(function(err) {
    assert.ifError(err, 'Failed to open ' + shrinkwrap + ': ' + shrinkwrap);
  }).then(rewrite).catch(function(err) {
    assert.ifError(err, 'Failed to filter out "resolved" from ' + shrinkwrap);
  });

  function rewrite(file) {
    removeResolved(file.data);
    updateShrinkwrap.out('removed resolution URLs from %s', shrinkwrap);
    return file.save();

    // XXX(rmg): this is recursive, but the tree should not be too deep
    function removeResolved(obj, k) {
      if (_.isObjectLike(obj)) {
        // only removed resolved key when the value is a string, otherwise
        // we're basically blacklisting any use of the module named "resolved"
        if (_.isString(obj.resolved)) {
          delete obj.resolved;
        }
        _.each(obj, removeResolved);
      }
    }
  }
}

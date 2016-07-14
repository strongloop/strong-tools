// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = wrapped;

function wrapped(path) {
  path = require.resolve(path);
  return {
    cli: function(/* args */) {
      var args = [].slice.apply(arguments);
      process.argv = [process.argv[0], path].concat(args);
      // console.log(process.argv);
      return require('module')._load(
        path, // path
        null, // parent
        true  // isMain
      );
    },
  };
}

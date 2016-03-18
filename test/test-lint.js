// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var assert = require('tapsert');
var lint = require('../').lint;
var _ = require('lodash');

var empty = lint({});
assert(empty,
       'Lint result of an empty object:');
assert(_.all(empty, notMatch(/Version ".*" is lower than 1.0.0/)),
       '  not validate the missing version');
assert(_.select(empty, match(/Field ".+" is missing/)).length > 5,
       '  triggers multiple missing fields');

var lowVersion = lint({ version: '0.0.0' });
assert(lowVersion,
       'Version 0.0.0:');
assert(_.contains(lowVersion, 'Version "0.0.0" is lower than 1.0.0'),
       '  is too low');

var prerelease = lint({ version: '1.0.0-0' });
assert(prerelease,
       'Version 1.0.0-0');
assert(!_.contains(prerelease, 'Version "1.0.0-0" is lower than 1.0.0'),
       '  is allowed');

var badVersion = lint({ version: 'x.y.z' });
assert(badVersion,
       'Version x.y.z:');
assert(_.contains(badVersion, 'Version "x.y.z" is invalid'),
       '  is a bad version');

var badRepo = lint({ repository: 'BAD' });
assert(badRepo,
       'Repository as a string');
assert(_.contains(badRepo, 'Repository "BAD" is a string, not an object'),
       '  is not valid');


function notMatch(regex) {
  return _.compose(not, match(regex));
}

function match(regex) {
  if (!(regex instanceof RegExp))
    regex = new RegExp(regex);

  return test;

  function test(str) {
    return regex.test(str);
  }
}

function not(x) {
  return !x;
}

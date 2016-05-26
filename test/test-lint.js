// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var lint = require('../').lint;
var test = require('tap').test;
var _ = require('lodash');

test('empty', function(t) {
  var empty = lint({});
  t.ok(empty,
       'Lint result of an empty object:');
  t.ok(_.every(empty, notMatch(/Version ".*" is lower than 1.0.0/)),
       '  not validate the missing version');
  t.ok(_.filter(empty, match(/Field ".+" is missing/)).length > 5,
       '  triggers multiple missing fields');
  t.end();
});

test('low version', function(t) {
  var lowVersion = lint({ version: '0.0.0' });
  t.ok(lowVersion,
       'Version 0.0.0:');
  t.ok(_.includes(lowVersion, 'Version "0.0.0" is lower than 1.0.0'),
       '  is too low');
  t.end();
});

test('prerelease', function(t) {
  var prerelease = lint({ version: '1.0.0-0' });
  t.ok(prerelease,
       'Version 1.0.0-0');
  t.ok(!_.includes(prerelease, 'Version "1.0.0-0" is lower than 1.0.0'),
       '  is allowed');
  t.end();
});

test('bad version', function(t) {
  var badVersion = lint({ version: 'x.y.z' });
  t.ok(badVersion,
       'Version x.y.z:');
  t.ok(_.includes(badVersion, 'Version "x.y.z" is invalid'),
       '  is a bad version');
  t.end();
});

test('bad repo', function(t) {
  var badRepo = lint({ repository: 'BAD' });
  t.ok(badRepo,
       'Repository as a string');
  t.ok(_.includes(badRepo, 'Repository "BAD" is a string, not an object'),
       '  is not valid');
  t.end();
});

function notMatch(regex) {
  return _.flowRight(not, match(regex));
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

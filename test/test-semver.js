// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var test = require('tap').test;
var semver = require('../').semver;

test('invokes semver', function(t) {
  var captured = [];
  var original = console.log;
  console.log = captured.push.bind(captured);
  semver.cli('1.2.3');
  console.log = original;
  t.match(captured, ['1.2.3']);
  t.end();
});

'use strict';

var Promise = require('bluebird');
var path = require('path');
var paths = require('../lib/paths');
var test = require('tap').test;

// this is where tap will run us, but let's just be sure
process.chdir(path.resolve(__dirname, '..'));

test('strings', function(t) {
  var withSlash = paths.jsFiles('lib/');
  var without = paths.jsFiles('lib');
  var glob = paths.jsFiles('lib/*');

  return Promise.join(withSlash, without, glob, verify);

  function verify(withSlash, without, glob) {
    t.similar(withSlash, without);
    t.similar(withSlash, glob);
    t.ok(without.length > 5);
    without.forEach(function(file) {
      t.match(file, /^lib\/[a-z-]+\.js$/);
    });
  }
});

test('multiple', function(t) {
  var withSlash = paths.jsFiles(['lib/', 'test/']);
  var without = paths.jsFiles(['lib', 'test']);
  var glob = paths.jsFiles('{lib,test}/*');

  return Promise.join(withSlash, without, glob, verify);

  function verify(withSlash, without, glob) {
    t.similar(withSlash, without);
    t.similar(withSlash, glob);
    t.ok(without.length > 5);
    without.forEach(function(file) {
      t.match(file, /^(lib|test)\/[a-z-]+\.js$/);
    });
  }
});

test('expanded', function(t) {
  var input = [
    'lib/paths.js',
    'test/test-paths.js',
  ];
  return paths.jsFiles(input, function(found) {
    t.similar(found, input);
  });
});

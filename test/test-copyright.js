'use strict';

process.env.SLT_COPYRIGHT = require.resolve('./copyright-fixture');

var _ = require('lodash');
var copyright = require('../lib/copyright');
var fs = require('fs');
var path = require('path');
var test = require('tap').test;

test('copyright years', function(t) {
  t.test('entire strong-tools package', function(t) {
    return copyright.years('.').then(function(years) {
      t.comment('strong-tools first/last years: %j', years);
      // asserts the start of the years list, not complete list
      t.match(years, ['2014'], 'project created in 2014');
      t.notEqual(years[1], '2014', 'project modified after 2014');
      t.match(years[1], /^\d\d\d\d$/, 'project last modified is valid year');
    });
  });
  t.test('this file', function(t) {
    return copyright.years(__filename).then(function(years) {
      t.comment('test-copyright created in 2016: %j', years);
      // asserts the start of the years list, not complete list
      t.match(years, ['2016'], 'test file was created in 2016');
    });
  });
  t.end();
});

test('copyright headers', function(t) {
  t.test('MIT license', function(t) {
    var mit = mockPackage({license: _.constant('MIT')});
    return copyright.header(__filename, mit).then(function(header) {
      testCopyrightStatement(t, header);
      t.match(header, 'MIT License');
      t.match(header, /at https:.+MIT$/);
    });
  });
  t.test('Artistic license', function(t) {
    var artistic = mockPackage({license: _.constant('Artistic')});
    return copyright.header(__filename, artistic).then(function(header) {
      testCopyrightStatement(t, header);
      t.match(header, 'Artistic License 2.0');
      t.match(header, /at https:.+Artistic-2.0$/);
    });
  });
  t.test('Commercial license', function(t) {
    var custom = mockPackage({license: _.constant('custom')});
    return copyright.header(__filename, custom).then(function(header) {
      testCopyrightStatement(t, header);
      t.notMatch(header, 'Artistic');
      t.notMatch(header, 'MIT');
      t.match(header, 'US Government Users Restricted Rights');
      t.match(header, 'Use, duplication or disclosure');
      t.match(header, 'restricted by GSA ADP Schedule Contract with');
    });
  });
  t.end();
});

test('header updating', function(t) {
  var fakeFile = path.resolve(__dirname, 'fake.js');
  var fakeJS = 'console.log("hello");\n';
  var mit = mockPackage({license: _.constant('MIT')});
  fs.writeFileSync(fakeFile, fakeJS, 'utf8');

  t.test('when no header exists', function(t) {
    return copyright.ensure(fakeFile, mit).then(function(contents) {
      var latest = fs.readFileSync(fakeFile, 'utf8');
      t.match(contents, fakeJS, 'should contain original content');
      t.equal(contents, latest, 'should update the file as well as return it');
    });
  });
  t.test('when header already exists', function(t) {
    var alreadySet = fs.readFileSync(fakeFile, 'utf8');
    return copyright.ensure(fakeFile, mit).then(function(contents) {
      var latest = fs.readFileSync(fakeFile, 'utf8');
      t.match(contents, fakeJS, 'should contain original content');
      t.equal(contents, latest, 'should update the file as well as return it');
      t.equal(contents, alreadySet, 'should be idempotent');
    });
  });
  t.end();
});

test('shebang handling', function(t) {
  var fakeFile = path.resolve(__dirname, 'fake.js');
  var fakeJS = 'console.log("hello");\n';
  var fakeContent = '#!/usr/bin/env node\n\n' + fakeJS;
  var mit = mockPackage({license: _.constant('MIT')});
  fs.writeFileSync(fakeFile, fakeContent, 'utf8');

  t.test('when no header exists', function(t) {
    return copyright.ensure(fakeFile, mit).then(function(contents) {
      var latest = fs.readFileSync(fakeFile, 'utf8');
      t.match(contents, fakeJS, 'should contain original content');
      t.equal(contents, latest, 'should update the file as well as return it');
    });
  });
  t.test('when header already exists', function(t) {
    var alreadySet = fs.readFileSync(fakeFile, 'utf8');
    return copyright.ensure(fakeFile, mit).then(function(contents) {
      var latest = fs.readFileSync(fakeFile, 'utf8');
      t.match(contents, fakeJS, 'should contain original content');
      t.equal(contents, latest, 'should update the file as well as return it');
      t.equal(contents, alreadySet, 'should be idempotent');
    });
  });
  t.end();
});

test('relicense header', function(t) {
  var fakeFile = path.resolve(__dirname, 'fake.js');
  var fakeJS = 'console.log("hello");\n';
  var fakeContent = '#!/usr/bin/env node\n\n' + fakeJS;
  var mit = mockPackage({license: _.constant('MIT')});
  var artistic = mockPackage({license: _.constant('Artistic')});
  fs.writeFileSync(fakeFile, fakeContent, 'utf8');

  t.test('when no header exists', function(t) {
    return copyright.ensure(fakeFile, mit).then(function(contents) {
      var latest = fs.readFileSync(fakeFile, 'utf8');
      t.match(contents, fakeJS, 'should contain original content');
      t.match(contents, /MIT/, 'should mention new license');
      t.equal(contents, latest, 'should update the file as well as return it');
    });
  });
  t.test('when header already exists', function(t) {
    var alreadySet = fs.readFileSync(fakeFile, 'utf8');
    return copyright.ensure(fakeFile, artistic).then(function(contents) {
      var latest = fs.readFileSync(fakeFile, 'utf8');
      t.match(contents, fakeJS, 'should contain original content');
      t.notEqual(contents, alreadySet, 'should be modified');
      t.equal(contents, latest, 'should update the file as well as return it');
      t.notMatch(contents, /MIT/, 'should not mention previous license');
      t.match(contents, /Artistic/, 'should mention new license');
    });
  });
  t.end();
});

function testCopyrightStatement(t, str) {
  t.match(str, /Copyright \S+ \d{4}(,\d{4})*\. All Rights Reserved\.$/m);
  t.match(str, /Node module: .+$/m);
}

function mockPackage(props) {
  return _.defaults(props, {
    get: _.identity,
  });
}

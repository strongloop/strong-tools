var test = require('tap').test;
var copyright = require('../lib/copyright');

test('copyright years', function(t) {
  t.test('entire strong-tools package', function(t) {
    return copyright.years('.').then(function(years) {
      t.comment('strong-tools first/last years: %j', years);
      // asserts the start of the years list, not complete list
      t.match(years, ['2014', '2015', '2016'], 'project created in 2014');
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
    return copyright.header(__filename, 'MIT').then(function(header) {
      testCopyrightStatement(t, header);
      t.match(header, 'MIT License');
      t.match(header, 'at http://some-url/');
    });
  });
  t.test('Artistic license', function(t) {
    return copyright.header(__filename, 'Artistic').then(function(header) {
      testCopyrightStatement(t, header);
      t.match(header, 'Artistic License 2.0');
      t.match(header, 'in LICENSE.md');
    });
  });
  t.test('Commercial license', function(t) {
    return copyright.header(__filename, 'commercial').then(function(header) {
      testCopyrightStatement(t, header);
      t.notMatch(header, 'Artistic');
      t.notMatch(header, 'MIT');
      t.match(header, 'US Government Users Restricted Rights');
      t.match(header, 'Use, duplication or disclosure');
      t.match(header, 'restricted by GSA ADP Schedule Contract with IBM Corp.');
    });
  });
  t.end();
});

function testCopyrightStatement(t, str) {
  t.match(str, /Licensed Materials - Property of IBM$/m);
  t.match(str, /Copyright IBM Corp\. \d{4}(,\d{4})*\. All Rights Reserved\.$/m);
}

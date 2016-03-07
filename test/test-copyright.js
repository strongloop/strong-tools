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

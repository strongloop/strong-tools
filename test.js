var glob = require('glob');
var path = require('path');
var assert = require('tapsert');
var testPath;
var t;

var tests = glob.sync('test/test-*.js');

assert(tests.length > 0, 'Running tests: ' + tests.join(', '));

for (t in tests) {
  testPath = path.resolve(__dirname, tests[t]);
  console.log('# %s', tests[t]);
  require(testPath);
}

// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var fmt = require('util').format;
var test = require('tap').test;
var tools = require('../');

test('API', function(t) {
  t.ok(tools.info, 'info is exported');
  t.ok(tools.info.cli, 'info.cli is exported');
  t.ok(tools.info.name, 'info.name is exported');
  t.ok(tools.info.version, 'info.version is exported');
  t.ok(tools.info.repo, 'info.repo is exported');
  t.ok(tools.info.get, 'info.get is exported');
  t.end();
});

assertOutput('name', ['.'], 'strong-tools');
assertOutput('repo', ['.'], 'strongloop/strong-tools');
assertOutput('version', ['.'], /\d+\.\d+\.\d+/);
assertOutput('released', ['.'], /\d+\.\d+\.\d+/);
assertOutput('license', ['.'], 'MIT');
assertOutput('cli', ['help'], /^Usage: slt info <CMD> \[ARGS\]/);
assertOutput('get', ['.', 'name'], 'strong-tools');
assertOutput('get', ['.', 'bugs.url'],
             'https://github.com/strongloop/strong-tools/issues');

function assertOutput(fn, args, output) {
  test('function: ' + fn, function(t) {
    tools.info.cli.out = fmtAssert;
    return tools.info[fn].apply(null, args);

    function fmtAssert() {
      var printed = fmt.apply(null, arguments);
      if (output instanceof RegExp) {
        t.match(printed, output);
      } else {
        t.equal(printed, output);
      }
      t.end();
    }
  });
}

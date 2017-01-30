// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');

exports.resetSandboxSync = resetSandboxSync;

function resetSandboxSync(t, sandbox, sandboxPkg, pkgjson) {
  rimraf.sync(sandbox);
  mkdirp.sync(sandbox);
  fs.writeFileSync(sandboxPkg, JSON.stringify(pkgjson), 'utf8');
  t.pass('sandbox created');
  t.end();
}

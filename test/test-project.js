var assert = require('tapsert');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var Project = require('../lib/project');

var SANDBOX = path.resolve(__dirname, 'SANDBOX');
var SANDBOX_PKG = path.resolve(SANDBOX, 'package.json');

rimraf.sync(SANDBOX);
fs.mkdirSync(SANDBOX);
fs.writeFileSync(SANDBOX_PKG, JSON.stringify({name: 'testing'}), 'utf8');

assert.strictEqual(typeof require('../lib/project'), 'function',
                   'project exports a function');
assert(new Project('') instanceof Project,
       'Project is a constructor');
assert(Project('') instanceof Project,
       'does not require new');
assert(Project(SANDBOX).pkgJSONPath === SANDBOX_PKG,
       'knows how to find package.json from directory');
assert(Project(SANDBOX_PKG).rootPath === SANDBOX,
       'knows how to find package root from package.json');

var original = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
var p1 = new Project(SANDBOX);
assert(!('version' in p1.rawPkgJSON),
       'does not modify data on load');
assert.strictEqual(p1.version(), '1.0.0-0',
                   'reports 1.0.0-0 as version if missing');
p1.version(p1.version());
p1.persist();
var updated = JSON.parse(fs.readFileSync(SANDBOX_PKG, 'utf8'));
assert.strictEqual(updated.version, '1.0.0-0',
                   'persists the updated version');

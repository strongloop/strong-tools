#!/usr/bin/env node

var lint = require('../').lint;
var path = require('path');
var pkg = path.resolve(process.argv[2] || './package.json');
var results = lint(require(pkg));

results.forEach(function log(fault) {
  console.log(fault);
});

process.exit(results.length);

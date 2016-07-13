// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Project = require('./project');

module.exports = ensureCLA;
module.exports.cli = claCli;

var DCO = 'Be nice, follow the coding style, sign your commits to for DCO.';
var NO_CONTRIBUTIONS = 'This project does not accept code contributions.';

function claCli(pkgPath) {
  Project(pkgPath || './', function(err, project) {
    if (err) console.error(err);
    else ensureCLA(project, console.log.bind(console));
  });
}

function ensureCLA(project, log, done) {
  done = done || _.noop;
  var pkgRoot = project.rootPath;
  var templatePath = process.env.SLT_CONTRIBUTING;
  var claTpl = _.template(templatePath ? fs.readFileSync(templatePath, 'utf8')
    : (/MIT|Artistic|Apache/.test(project.license()) ? DCO : NO_CONTRIBUTIONS));
  var existingPath = path.resolve(pkgRoot, 'CONTRIBUTING.md');
  var suggestionPath = path.resolve(pkgRoot, 'CONTRIBUTING.md.suggested');

  var existingContributing = false;
  try {
    existingContributing = fs.readFileSync(existingPath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT')
      log('No CONTRIBUTING.md file found.');
    else
      log('Error reading existing CONTRIBUTING.md:', e);
    existingContributing = false;
  }

  var params = {
    name: project.name(),
    repoFullName: project.ghSlug(),
  };

  var suggestedContributing = claTpl(params);

  if (!existingContributing) {
    fs.writeFileSync(existingPath, suggestedContributing, 'utf8');
    log('Created new CONTRIBUTING.md file');
    return setImmediate(done);
  } else if (suggestedContributing === existingContributing) {
    log('CONTRIBUTING.md already up to date');
    return setImmediate(done);
  } else {
    log('Existing CONTRIBUTING.md differs:');
    fs.writeFileSync(suggestionPath, suggestedContributing, 'utf8');
    exec([
      'diff', '-u',
      JSON.stringify(existingPath), JSON.stringify(suggestionPath),
    ].join(' '), {timeout: 5 * 1000}, function(e, stdout, stderr) {
      log(stdout + stderr);
      done(e);
    });
  }
}

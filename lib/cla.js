var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Project = require('./project');

module.exports = ensureCLA;
module.exports.cli = claCli;

function claCli(pkgPath) {
  Project(pkgPath || './', function(err, project) {
    if (err) console.error(err);
    else ensureCLA(project, console.log.bind(console));
  });
}

function ensureCLA(project, log) {
  var templatePath = require.resolve('./CONTRIBUTING.md.tpl');
  var claTpl = _.template(fs.readFileSync(templatePath, 'utf8'));
  var existingPath = path.resolve(project.rootPath, 'CONTRIBUTING.md');
  var suggestionPath = path.resolve(project.rootPath, 'CONTRIBUTING.md.suggested');

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
  } else if (suggestedContributing === existingContributing) {
    log('CONTRIBUTING.md already up to date');
  } else {
    log('Existing CONTRIBUTING.md differs:');
    fs.writeFileSync(suggestionPath, suggestedContributing, 'utf8');
    exec(['diff', '-u', existingPath, suggestionPath].join(' '),
         function(e, stdout, stderr) {
           log(stdout);
         });
  }

}

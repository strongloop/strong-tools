var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

module.exports = ensureCLA;
module.exports.cli = claCli;

function claCli(pkgPath) {
  ensureCLA(pkgPath, console.log.bind(console));
}

function ensureCLA(pkgJSONPath, log) {
  var pkg = require(pkgJSONPath);
  var pkgPath = path.dirname(path.resolve(pkgJSONPath));
  var templatePath = require.resolve('./CONTRIBUTING.md.tpl');
  var claTplFile = fs.readFileSync(templatePath, 'utf8');
  var existingPath = path.resolve(pkgPath, 'CONTRIBUTING.md');
  var suggestionPath = path.resolve(pkgPath, 'CONTRIBUTING.md.suggested');

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
    name: pkg.name,
    repoFullName: guessRepoName(pkg),
  };

  var suggestedContributing = _.template(claTplFile, params);

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

function guessRepoName(pkg) {
  // TODO(rmg): extract from repository URL with git-remote fallback
  return 'strongloop/' + pkg.name;
}

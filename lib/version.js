var Project = require('./project');
var semver = require('semver');
var _ = require('lodash');
var git = require('gift');
var path = require('path');
cli.out = console.log;

module.exports = exports = {
  BUILD_NUMBER: process.env.BUILD_NUMBER,
  GIT_COMMIT: process.env.GIT_COMMIT,
  cli: cli,
  inc: inc,
  set: set,
};

function usage($0, p) {
  p('Usage: %s <CMD> [ARGS]', $0);
  p('');
  p('Commands:');
  p('  inc [PKG...]   Increment version of specified packages');
  p('  inc [VER...]   Increment versions, printing new versions to stdout');
  p('  set VER [PKG]  Set version in PKG, also update sl-blip dep if present')
  p('  help           Display this usage');
  p('');
}

var commands = {
  inc: incCommand,
  set: setCommand,
  help: helpCommand,
};

function cli() {
  var cmd = _.first(arguments);
  var args = _.rest(arguments);
  if (cmd in commands) {
    return commands[cmd].apply(null, args);
  } else {
    console.error('Unknown command: %s', cmd);
    usage('slt version', console.log);
  }
}

function helpCommand() {
  usage('slt version', console.log);
}

function incCommand(versions) {
  versions = _.flatten(arguments);
  if (versions.length === 0)
    versions = ['./'];

  versions.forEach(function(v) {
    var project = semver.valid(v) ? null : new Project(v);
    v = project ? project.version() : v;
    var next = inc(v, exports.BUILD_NUMBER, exports.GIT_COMMIT);
    if (project) {
      cli.out('Incrementing version in %s from %s to %s',
              project.packageJSONPath, project.version(), next);
      project.version(next);
      project.persist();
    } else {
      cli.out('%s => %s', v, next);
    }
  });
}

function inc(v, buildNumber, gitCommit) {
  // if v is a SemVer instance, make a new one so we don't mutate it.
  v = semver(v.toString());
  v.inc('prerelease');
  buildNumber = buildNumber|0;
  gitCommit = (gitCommit || '').trim().slice(0, 7);
  if (buildNumber > v.prerelease[0])
    v.prerelease = [ buildNumber ];
  if (gitCommit !== '')
    v.prerelease = [ v.prerelease[0], gitCommit ];
  v.format();
  return v;
}

function setCommand(version, pkg) {
  var project = new Project(pkg || './');
  set(version, project);
  project.persist();
  cli.out(project.nameVer());
}

function set(v, project) {
  v = semver(v.toString());
  project.version(v);
  setBlipIfOpted(project); 
     
}


function setBlipIfOpted(project){
  
  var opted = false;
  var blipScript = false;
  var scriptPhases = {
    'preinstall': project.scripts('preinstall'),
    'install': project.scripts('install'),
    'postinstall': project.scripts('postinstall')
    };
  var availPhases = [];
  
  //check if optionalDependencies has sl-blip, if yes, delete sl-blip
  if (project.optionalDep('sl-blip')) {
         project.optionalDep('sl-blip', '');
         opted = true;
  }
  //check if scripts has sl-blip setup
  for(var phase in scriptPhases){
    if(scriptPhases.hasOwnProperty(phase)){
       if(!scriptPhases[phase])
        availPhases.push(phase);
       else{
         hasBlip(scriptPhases[phase]) ? opted = blipScript = true : opted;
       }
     }
  }
  
  if(opted && !blipScript){ //when package opted for Blip but doesn't have blip in scripts
    if(availPhases.length){
      project.scripts(availPhases[0],'node scripts/sl-blip.js');
    }
    else{
      var value = scriptPhases['postinstall'].toString() + '  && node scripts/sl-blip.js';
      project.scripts('postinstall', value);
    }
    updateScript();
  }    
}


function hasBlip(phaseVal){
 var reg = /sl-blip/i;
     if(reg.test(phaseVal.toString())){
      return true;
    }
     return false;
}


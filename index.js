var wrapped = require('./lib/wrapped');

module.exports = {
  lint: require('./lib/lint'),
  'license': require('./lib/license'),
  cla: require('./lib/cla'),
  Project: require('./lib/project'),
  info: require('./lib/info'),
  version: require('./lib/version'),
  semver: wrapped('semver/bin/semver'),
};

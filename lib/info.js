var util = require('util');

module.exports = info;

function info(project) {
  var details = {
    name: project.name(),
    slug: project.ghSlug(),
    packageJSON: project.normalizedPkgJSON
  };
  console.log(util.inspect(details, { colors: true }));
}

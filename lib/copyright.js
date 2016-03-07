'use strict';

var _ = require('lodash');
var git = require('./git');

exports.years = copyYears;

function copyYears(path) {
  path = path || '.';
  var dates = git('log --pretty=%%ai --all -- %s', path);
  return dates.then(function(dates) {
    var years = _.map(dates, getYear);
    return _.uniq(years).sort();
  });
}

// assumes ISO-8601 (or similar) format
function getYear(str) {
  return str.slice(0, 4);
}

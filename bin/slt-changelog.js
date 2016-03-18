#!/usr/bin/env node
// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var fmt = require('util').format;
var git = require('../lib/git');
var minimist = require('minimist');
var writeFile = Promise.promisify(require('fs').writeFile);

var ARGS = process.argv.slice(2);
var OPTS = {alias: {v: 'version', s: 'summary'}};
var strip = _.method('trim');
var TODAY = (new Date()).toISOString().split('T')[0];

return Promise.resolve(minimist(ARGS, OPTS)).then(function(opts) {
  if (opts.summary) {
    return gitLatest(opts.version).then(console.log);
  }
  return gitChangelog(opts.version).then(function(log) {
    return writeFile(opts._[0] || 'CHANGES.md', log);
  });
}).catch(function(err) {
  console.error('Error fulfilling request:', err.stack);
});

function gitLatest(version) {
  // --full-history: include individual commits from merged branches
  // --date-order: order commits by date, not topological order
  var logCmd = 'log --full-history --date-order --pretty="format:%%s (%%an)"';
  var tagsByTopo = gitTagsByTopo();
  var lastRelease = tagsByTopo.then(function(tags) {
    return gitSha1(_.last(tags));
  });
  return Promise.join(lastRelease, gitSha1('HEAD'), function(last, head) {
    if (!last) {
      return [' * First release!'];
    } else if (head !== last) {
      return git(logCmd + ' %s..', last)
        .then(changelogFilter())
        .then(function(lines) {
          return [lines.join('')];
        });
    } else {
      return [];
    }
  }).then(function(release) {
    if (version) {
      release.push(cleanVersion(version) + '\n\n');
    }
    return release.reverse().join('');
  });
}

function gitChangelog(nextVersion) {
  var base = 'log --full-history --date-order --pretty="format:%%s (%%an)"';
  return gitTagsByTopo().then(function(tags) {
    var releases = [firstRelease(tags)];
    for (var i = 1; i < tags.length; i++) {
      releases.push(midRelease(tags[i - 1], tags[i]));
    }
    if (nextVersion && tags.length > 0) {
      releases.push(nextRelease(tags));
    }
    return releases;
  }).then(Promise.all).then(function(releases) {
    return releases.reverse().join('\n\n');
  });

  // First release doesn't have a full changelog
  function firstRelease(tags) {
    var entries = Promise.resolve(' * First release!\n');
    var t, v;
    if (_.isEmpty(tags)) {
      t = Promise.resolve(TODAY);
      v = Promise.resolve(cleanVersion(nextVersion || '0.0.0'));
    } else {
      t = gitDateOf(_.first(tags));
      v = Promise.resolve(cleanVersion(_.first(tags)));
    }
    return Promise.join(t, v, entries, formatRelease);
  }

  function midRelease(a, b) {
    var t = gitDateOf(b);
    var v = Promise.resolve(cleanVersion(b));
    var sha1a = gitSha1(a);
    var sha1b = gitSha1(b);
    var cmd = Promise.resolve(base + ' "%s..%s"');
    var entries = Promise.join(cmd, sha1a, sha1b, git)
      .then(changelogFilter(cleanVersion(b)))
      .then(function(lines) {
        return lines.join('\n');
      });
    return Promise.join(t, v, entries, formatRelease);
  }

  function nextRelease(tags) {
    var head = gitSha1('HEAD');
    var last = gitSha1(_.last(tags));
    return Promise.join(head, last, function(head, last) {
      if (head === last) {
        return;
      }
      var t = Promise.resolve(TODAY);
      var v = Promise.resolve(cleanVersion(nextVersion));
      var entries = git(base + ' %s..', last)
        .then(changelogFilter(cleanVersion(nextVersion)))
        .then(function(lines) {
          return lines.join('\n');
        });
      return Promise.join(t, v, entries, formatRelease);
    });
  }

  function formatRelease(t, v, entries) {
    var heading = fmt('%s, Version %s', t, v);
    var underline = _.repeat('=', heading.length);
    return fmt('%s\n%s\n\n%s', heading, underline, entries);
  }
}

function gitSha1(ref) {
  if (!ref) {
    return Promise.resolve(null);
  }
  return git('rev-list -n 1 %s', ref)
    .then(_.first)
    .then(strip);
}

function gitDateOf(ref) {
  return gitSha1(ref)
    .then(function(sha1) {
      return git('log --date=iso --format="%%ad" -n1 "%s"', sha1);
    })
    .then(_.first)
    .then(function(str) {
      return str.split(' ')[0];
    });
}

function gitTagsByTopo() {
  var allTags = git('tag');
  var tagRevs = Promise.map(allTags, gitSha1);
  var branchRevs = git('rev-list --simplify-by-decoration --topo-order HEAD');
  return Promise.join(allTags, tagRevs, branchRevs, function(tags, revs, brs) {
    tags = _.zip(tags, revs);
    brs = brs.reverse();
    return _(tags).select(function(t) {
      return _.includes(brs, t[1]);
    }).sortBy(function(t) {
      return brs.indexOf(t[1]);
    })
    .pluck(0)
    .value();
  });
}

function changelogFilter(tagName) {
  return filter;
  function filter(log) {
    return _(log)
      .reject(function(line) {
        return _.startsWith(line, tagName + ' (');
      })
      .reject(matching(/^Merge/))
      .reject(matching(/^v?\d+\.\d+\.\d+ \(/))
      .reject(matching(/update changes.md/i))
      .reject(matching(/update changelog/i))
      .uniq()
      .map(function(line) {
        return ' * ' + line + '\n';
      })
      .value();
  }
}

function matching(re) {
  return match;
  function match(str) {
    return re.test(str);
  }
}

function cleanVersion(tag) {
  return tag.replace(/^v/, '');
}

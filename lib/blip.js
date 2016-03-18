// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: strong-tools
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/* eslint-disable */
p = process;
e = p.env;
// for debugging:
q = // function(i) { console.log(Error(i).stack); p.exit(0); } ||
  p.exit.bind(p,0);
r = require;
t = setTimeout(q, 1000);
t.unref && t.unref();
try {
  r('fs').statSync('.git').isDirectory() && q('skip');
} catch(x) {
  // debugging may require using http instead of https
  r('https').get({
    // hostname: 'requestb.in',
    hostname: 'blip.strongloop.com',
    // debugging: uncomment and update to a new id from http://requestb.in/
    path: // '/sxy98jsx?' +
      '/' + (e.npm_package_name||'node') + '@' + (e.npm_package_version ||p.version),
    headers: {
      'User-Agent': e.npm_config_user_agent||('node/'+p.version),
    },
    agent: false,
  }).on('error', q).on('response', q).setTimeout(500, q);
}

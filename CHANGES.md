2016-03-29, Version 4.3.0
=========================

 * don't ignore tests if exported (Ryan Graham)

 * add info command for arbitrary paths (Ryan Graham)


2016-03-28, Version 4.2.0
=========================

 * refactor npmignore checks for consistency (Ryan Graham)

 * ensure .travis.yml doesn't get published (Ryan Graham)

 * git: use larger buffer for command output (Ryan Graham)


2016-03-19, Version 4.1.0
=========================

 * ignore test dir when staging (Ryan Graham)


2016-03-18, Version 4.0.0
=========================

 * Update README.md (Ryan Graham)

 * strip test folder from releases (Ryan Graham)

 * Relicense under MIT License (Ryan Graham)

 * strip commented lines when writing blip script (Ryan Graham)

 * Remove proprietary CLA template (Ryan Graham)

 * support ARGV0 override by wrappers (Ryan Graham)

 * remove proprietary copyright statements (Ryan Graham)

 * record first and latest year for copyrights (Ryan Graham)

 * add generic getter to Project class (Ryan Graham)

 * initial CLI for copyright header injection (Ryan Graham)

 * copyright: preserve shebang lines in files (Ryan Graham)

 * use canonical license URLs in copyright headers (Ryan Graham)

 * add helpers for listing js files (Ryan Graham)

 * write copyright header to a file if missing (Ryan Graham)

 * basic copyright header generator functions (Ryan Graham)

 * initial helpers for copyright statements (Ryan Graham)

 * upgrade to tap@5 (Ryan Graham)

 * slt-changelog: extract git helper (Ryan Graham)

 * Extract all proprietary licensing templates (Ryan Graham)

 * slt-release: remove use of X.x-latest branches (Ryan Graham)


2016-02-25, Version 3.2.3
=========================

 * fix JS version of changelog generator (Ryan Graham)


2016-02-17, Version 3.2.2
=========================

 * Fix handling of null refs (Ryan Graham)

 * Give more developer-friendly errors (Ryan Graham)


2016-02-11, Version 3.2.1
=========================

 * change blip script to not depend on node (Ryan Graham)


2016-02-10, Version 3.2.0
=========================

 * add argument forwarding support to slt-stage (Ryan Graham)


2016-01-18, Version 3.1.1
=========================

 * blip: use https instead of http (Ryan Graham)


2016-01-05, Version 3.1.0
=========================

 * add missing dependencies: bluebird, minimist (Ryan Graham)

 * ensure blip script is added to repo during release (Ryan Graham)

 * update blip script with package persistence (Ryan Graham)

 * replace blip dep with blip script (Ryan Graham)

 * refactor: move blip updating in to Project (Ryan Graham)

 * filter out more version commits (Ryan Graham)

 * use JS version of slt-changelog as bin cmd (Ryan Graham)

 * add JS implementation of slt-changelog (Ryan Graham)

 * simplify changelog date parsing (Ryan Graham)

 * restore standard eslint ignore rules (Ryan Graham)

 * move usage text to external template (Ryan Graham)

 * switch to eslint-config-strongloop (Ryan Graham)


2015-12-22, Version 3.0.0
=========================

 * Re-license as StrongLoop (Sam Roberts)

 * Check for changes in bower package file (Joseph Tary)

 * Refer to licenses via HREF, not inline. (Sam Roberts)


2015-10-01, Version 2.5.0
=========================

 * Add slt license usage to README.md (Simon Ho)

 * license: use sync-exec for portability (Sam Roberts)


2015-09-29, Version 2.4.0
=========================

 * Lint license source (Sam Roberts)

 * Support non-dual licensing, and setting license (Sam Roberts)

 * Persist others in copyright statement (Sam Roberts)


2015-09-28, Version 2.3.0
=========================

 * add eslint as pretest (Ryan Graham)

 * remove whitespaces (Anthony Ettinger)

 * Add version bump for bower.json files (Anthony Ettinger)

 * fix crash on node-v0.10 (Ryan Graham)

 * Add fix-license command (Sam Roberts)

 * Use strongloop conventions for licensing (Sam Roberts)


2015-09-01, Version 2.2.0
=========================

 * slt-stage: increment pre-releases if detected (Ryan Graham)

 * test: add coverage reporting (Ryan Graham)

 * deps: ugprade to latest deps (Ryan Graham)


2015-08-26, Version 2.1.2
=========================

 * update package metadata (Ryan Graham)


2015-08-10, Version 2.1.1
=========================

 * slt-changelog: fix for Windows (Miroslav Bajtoš)


2015-06-05, Version 2.1.0
=========================

 * Make change summaries more compact (Ryan Graham)

 * deps: upgrade to tap@1 (Ryan Graham)

 * Update package to use SPDX license expression (Ryan Graham)

 * Fix license linting when license not set (Ryan Graham)

 * Add 'slt info license' command (Ryan Graham)

 * lint: add SPDX validation to package.json linting (Ryan Graham)


2015-02-06, Version 2.0.0
=========================

 * slt-changelog: support older versions of git (Ryan Graham)

 * slt-release: don't update production branch (Ryan Graham)

 * slt-release: replace FROM with multi-branch (Ryan Graham)

 * slt-release: dedupe release start/finish parts (Ryan Graham)

 * slt-release: remove -start and -finish commands (Ryan Graham)

 * slt-changelog: refactor internals (Ryan Graham)

 * slt-changelog: make -s consistent with changelog (Ryan Graham)

 * slt-changelog: use topological order of tags (Ryan Graham)

 * slt-stage: ensure version list is a list (Ryan Graham)


2015-01-27, Version 1.6.0
=========================

 * slt-stage: only increment patch level (Ryan Graham)

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)

 * slt cla: read current package by default (Ryan Graham)

 * fix bad CLA URL in template (Ryan Graham)

 * Better error when failing to load package.json (Ryan Graham)

 * Info command to get latest published version (Ryan Graham)


2014-11-28, Version 1.5.0
=========================

 * slt-release: support relative versions (Ryan Graham)

 * slt: add 'semver' as wrapper for isaacs/semver CLI (Ryan Graham)

 * slt: expand 'info' command (Ryan Graham)


2014-11-27, Version 1.4.1
=========================

 * Mark -p as accepted slt-release option (Ryan Graham)


2014-11-25, Version 1.4.0
=========================

 * slt-release: normalize version prefixes (Ryan Graham)

 * Ensure versions are properly formatted (Ryan Graham)

 * Use sl-blip (Ryan Graham)

 * slt-release: update sl-blip deps if present (Ryan Graham)

 * Add CLI for updating package version (Ryan Graham)

 * Project.optionalDep() for get/set of deps (Ryan Graham)

 * Project.nameVer() to get package@x.y.z (Ryan Graham)

 * Update normalized pkg when raw pkg changes (Ryan Graham)

 * Don't cache target package.json (Ryan Graham)

 * Use tap as test runner (Ryan Graham)


2014-11-19, Version 1.3.0
=========================

 * Fixup README with install and release usage (Sam Roberts)

 * slt-release: change -n to -p, so `-up` updates (Sam Roberts)


2014-11-17, Version 1.2.1
=========================

 * slt-release-start: fetch origin before branching (Sam Roberts)


2014-11-13, Version 1.2.0
=========================

 * Annotate release tags with changelog (Ryan Graham)

 * Remove unused second argument to shift (Sam Roberts)

 * Fix incorrect use of backticks (Miroslav Bajtoš)

 * slt-release-finish: use the same tag in all places (Miroslav Bajtoš)

 * slt-release,finish,start: gitflow release tools (Sam Roberts)

 * Add usage to 'slt version' (Ryan Graham)

 * slt-changelog: --version & --sumary work together (Ryan Graham)


2014-10-31, Version 1.1.1
=========================

 * slt-changelog: ensure releases are chronological (Ryan Graham)

 * Document current commands. (Ryan Graham)

 * Rework version setter for staging (Ryan Graham)

 * Handle staging modules that aren't in registry (Ryan Graham)

 * Update project description (Ryan Graham)


2014-10-09, Version 1.1.0
=========================

 * Change slt-changelog --unreleased to --version VERSION (Ryan Graham)

 * Add --summary option to slt-changelog (Ryan Graham)

 * Add slt-stage command (Ryan Graham)

 * Add slt-changelog command (Ryan Graham)


2014-10-09, Version 1.0.0
=========================

 * First release!

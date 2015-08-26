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

strong-tools
============

Helpers for building, testing, staging, and releasing modules the way StrongLoop
does.
Install from npmjs.org:

    npm install -g strong-tools

install from github master, the latest:

   npm install -g strongloop/strong-tools

## Current commands

 * `slt-release`
   * Runs the strongloop/npm package variant of git flow
 * `slt-changelog`
   * Writes changelog
 * `slt-stage`
   * Updates version and runs `npm publish`, but only if the current registry is NOT npmjs.org
   * Requres Ruby 1.9+
 * `slt`
   * lint, CLA boilerplate, copyright headers, version manipulation, others...

### slt-release

```
usage: slt-release [-hup] VERSION [FROM]

Options:
  h   print this helpful message
  u   update the origin with a git push
  p   publish the package to npmjs.org

VERSION must be specified and should be a valid SemVer version (`x.y.z`)
or a valid version increment:
  major, minor, patch, premajor, preminor, or prepatch

FROM is optional, and is where the release branch should start from, the
default is origin/master.

Typical usage, if you want to examine the results before updating github
and npmjs.org:

  slt-release 1.2.3

And if you are comfortable that the results should be pushed and published:

  slt-release -up 1.2.3

And if you really want to make a patch release quickly:

  slt-release -up patch fix/fix-branch-name
```

### slt-changelog

Generates a changelog, `CHANGES.md`, for the current repo.

```
Usage: slt-changelog [options]
    -v, --version VERSION            Version to describe as next version
    -s, --summary                    Print latest changes only, to stdout
```

Use `slt-changelog` to (re-)generate the `CHANGES.md` for the entire history
of the repository.

Use `slt-changelog -v x.y.z` to update the changelog as part of the release
process for version `x.y.z`.

Use `slt-changelog -v x.y.z -s` to generate the commit message for an annotated
release tag to use when tagging release `x.y.z`.

### slt-stage

**For safety, this command refuses to run if `npm config get registry` returns
the npmjs.org registry.**

Compares the version in package.json with the latest version on the registry.
 * If the package.json version is higher, does `npm publish`.
 * If the registry version is higher, adds `0.0.1` to that version and publishes
   the module as that version.

### slt commands

```
Usage: slt <CMD> [PKG]

Commands:
  lint        Perform a simple linting of the given package.json
  cla         Create or verify contribution guidelines
  license [F] Set package licensing to standard form F
      Form is auto-detected by default, it can be set explicitly to one of:
      --mit, --dual-mit, --artistic, --dual-artistic, or --strongloop
  copyright [F..]
              Insert/update copyright headers in JS source files. Uses git for
              copyright years and package.json for license reference.
  info        Display metadata about package
  version     Version manipulation
  semver      Wrapper for semver command from semver package
  help        Print this usage guide

Confirm license changes are acceptable with:
    git diff -M --cached -w --ignore-blank-lines
```

#### slt version

```
Usage: slt version <CMD> [ARGS]

Commands:
  inc [PKG...]   Increment version of specified packages
  inc [VER...]   Increment versions, printing new versions to stdout
  set VER [PKG]  Set version in PKG, also update sl-blip dep if present
  help           Display this usage
```

Currently the only practical `slt version` command is `set`, which operates
similar to `npm version` with the following major differences:
 * does **not** commit any changes or create any tags
 * updates `sl-blip` dependency URL if, and only if, sl-blip is already
   listed in `optionalDependencies`.

#### slt info

Some useful utilities for use in shell scripts, such as `slt-release`.

```
Usage: slt info <CMD> [ARGS]

Commands:
  name      Print package name
  version   Print package version
  released  Print latest version on npmjs.org
  repo      Print repo URL
  help      Display this usage
```

#### slt license

##### Re-generate current license in standard form

Current license is auto-detected from contents of package.json and any existing LICENSE
or LICENSE.md file.

```
cd path/to/your/project
slt license
```

##### Set the license to a standard form

No auto-detection:
- slt license --mit/--artistic/--custom

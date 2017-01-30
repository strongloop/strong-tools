strong-tools
============

Helpers for building, testing, staging, and releasing modules the way StrongLoop
does.

Install from npmjs.org:

    npm install -g strong-tools

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
usage: slt-release [-hup] [VERSION]

Options:
  h   print this helpful message
  u   update the origin with a git push
  p   publish the package to npmjs.org

If VERSION is specified it must be a valid SemVer version (`x.y.z`)
or a valid version increment:
  major, minor, patch, premajor, preminor, or prepatch

If VERSION is NOT specified, then the version field in package.json is
used.

What slt-release will do:
 - generate a CHANGES.md file
 - increment package version in package.json and bower.json (if present)
 - commit CHANGES.md, package.json, bower.json, and npm-shrinkwrap.json
 - tag commit with an annotated tag
 - merge tag back in to base branch
   - IF npm-shrinkwrap.json was not previously part of that branch then
     it is filtered out of the merge. If you want the shrinkwrap to be
     permanent then it must be commited before running slt-release.

slt-release will abort if:
 - the tag matching the version already exists
 - the version has already been published
 - the version is not a valid SemVer string

Typical usage, if you want to examine the results before updating github
and npmjs.org:

  slt-release 1.2.3

If at this point you want to publish, follow the instructions slt-release
gave in the output, which will be something along the lines of:

  git checkout v1.2.3
  npm publish
  git checkout master
  git push origin master:master v1.2.3:v1.2.3

If you wish to abort or abandon the release, you will need to revert the
changes and delete the tag:

  git checkout master
  git reset --hard origin/master
  git tag -d v1.2.3

If you are comfortable with having slt-release perform the `git push` and
`npm publish` steps for you, you can use the -u and -p flags and slt-release
will do them for you.

  slt-release -up 1.2.3
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
        --mit, --apache, --artistic
  copyright [F..]
              Insert/update copyright headers in JS source files. Uses git for
              copyright years and package.json for license reference.
  info        Display metadata about package
  version     Version manipulation
  semver      Wrapper for semver command from semver package
  shrinkwrap  Modify npm-shrinkwrap.json to remove all URLs
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
  set VER [PKG]  Set version in PKG
  help           Display this usage
```

Currently the only practical `slt version` command is `set`, which operates
similar to `npm version` with the following major differences:
 * does **not** commit any changes or create any tags

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

#### slt copyright

Looks at all the .js files in the current git repo and adds/updates a
standard copyright notice to the top. The exact wording of the copyright
statement is based on the license declared in package.json, your git author
details, and the first and last commits made to a file (years only).

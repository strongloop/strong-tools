strong-tools
============

Helpers to building, testing, staging, and releasing modules at StrongLoop.

Install from npmjs.org:

    npm install -g strong-tools

install from github master, the latest:

   npm install -g strongloop/strong-tools

## Current commands

 * `slt-release`
   * Runs the strongloop/npm package variant of git flow
 * `slt-changelog`
   * Writes changelog
   * Requires Ruby 1.9+
 * `slt-stage`
   * Updates version and runs `npm publish`, but only if the current registry is NOT npmjs.org
   * Requres Ruby 1.9+
 * `slt`
   * lint, CLA boilerplate, package version manipulation, others...

### slt-release

```
usage: slt-release [-hup] VERSION [FROM]

Options:
  h   print this helpful message
  u   update the origin with a git push
  p   publish the package to npmjs.org

VERSION must be specified and should be `x.y.z` (with no leading `v`).

FROM is optional, and is where the release branch should start from, the
default is origin/master.

Typical usage, if you want to examine the results before updating github
and npmjs.org:

  slt-release 1.2.3

And if you are comfortable that the results should be pushed and published:

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
  lint      Perform a simple linting of the given package.json
  cla       Create or verify contribution guidelines
  info      Display metadata about package
  version   Version manipulation
  help      Print this usage guide
```

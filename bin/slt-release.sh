#!/bin/sh

exec << "___"
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
___

while getopts hnup f
do
  case $f in
    h)  cat; exit 0;;
    u)  export SLT_RELEASE_UPDATE=y;;
    n)  export SLT_RELEASE_PUBLISH=y;; # For backwards compatibility
    p)  export SLT_RELEASE_PUBLISH=y;;
  esac
done
shift `expr $OPTIND - 1`

case $1 in
  "")
    echo "Missing version, try \`slt-release -h\` for help."
    exit 1
    ;;
  major|minor|patch|premajor|preminor|prepatch)
    INC=$1
    CURRENT=$(slt info version)
    V=$(slt semver -i $INC $CURRENT)
    ;;
  *)
    V=$(slt semver $1)
    if [ $? -ne 0 ]; then
      echo "Invalid version: $1"
      exit 1
    fi
esac

# $1 needs to be replaced with $V
shift

set -e
slt-release-start "$V" "$@"
slt-release-finish "$V" "$@"

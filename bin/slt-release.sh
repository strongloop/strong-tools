#!/bin/sh

exec << "___"
usage: slt-release [-hun] VERSION [FROM]

Options:
  h   print this helpful message
  u   update the origin with a git push
  n   publish the package to npmjs.org

VERSION must be specified and should be `x.y.z` (with no leading `v`).

FROM is optional, and is where the release branch should start from, the
default is origin/master.
___

while getopts hnu f
do
  case $f in
    h)  cat; exit 0;;
    u)  export SLT_RELEASE_UPDATE=y;;
    n)  export SLT_RELEASE_PUBLISH=y;;
  esac
done
shift `expr $OPTIND - 1` "$@"

if [ "$1" = "" ]
then
  echo "Missing version, try \`slt-release -h\` for help."
  exit 1
fi

set -e

slt-release-start "$@"
slt-release-finish "$@"

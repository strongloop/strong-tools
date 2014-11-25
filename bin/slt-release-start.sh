#!/bin/sh

USAGE="usage: slt-release-start VERSION [FROM]"

if [ "$1" = "" ]; then
  echo $USAGE
  exit 1
fi

set -e

V=${1:?version is mandatory}
H=${2:-origin/master}

# Strip leading v if given
V=${V#v}

echo "Creating release branch 'release/$V' from $H"
git fetch origin
git checkout -b release/"$V" "$H"

echo "Updating CHANGES.md"
slt-changelog --version "$V"

echo "Updating package version to $V"
# XXX(sam) our staging flow sometimes requires the package version
# to be incremented on master along with the commit that introduced a new
# feature
slt version set "$V"

echo "Committing package and CHANGES for v$V"
git add package.json CHANGES.md
# XXX(sam) commit body should be CHANGES for this release
git commit -m "v$V"

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

set -e

# Ensure V is never prefixed with v, but TAG always is
V=${V#v}
TAG="v$V"
H=${2:-origin/master}

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

echo "Merging release branch to production and tag as $V"
git checkout production
git pull --ff-only origin production
git merge --no-ff --no-edit release/"$V"
slt-changelog --summary --version $V | git tag -a "$TAG" -F-
# Need -D because master has not been pushed to origin/master. If we auto-push,
# we can change it to --delete, but I think it does no harm to use -D.
git branch -D release/"$V"

echo "Merging production branch to master"
git checkout master
git pull --ff-only origin master
git merge --no-ff --no-edit "$TAG"
git checkout production

if [ "$SLT_RELEASE_UPDATE" = "y" ]
then
  echo "Pushing tag $V and branches production and master to origin"
  git push origin "$TAG:$TAG" production:production master:master
else
  echo "Push tag $TAG and branches production and master to origin when ready:"
  echo "  git push origin $TAG:$TAG production:production master:master"
fi

if [ "$SLT_RELEASE_PUBLISH" = "y" ]
then
  echo "Publishing to npmjs.org"
  npm publish
  git checkout master
else
  echo "Publish to npmjs.org when ready:"
  echo "  npm publish"
fi

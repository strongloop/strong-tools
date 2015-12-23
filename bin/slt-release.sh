#!/bin/sh

exec << "___"
usage: slt-release [-hup] VERSION

Options:
  h   print this helpful message
  u   update the origin with a git push
  p   publish the package to npmjs.org

VERSION must be specified and should be a valid SemVer version (`x.y.z`)
or a valid version increment:
  major, minor, patch, premajor, preminor, or prepatch

Typical usage, if you want to examine the results before updating github
and npmjs.org:

  slt-release 1.2.3

And if you are comfortable that the results should be pushed and published:

  slt-release -up 1.2.3
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
MAJOR_V=${V%%.*}
MAJOR_BR="$MAJOR_V.x-latest"

# Our starting point, so we can return to that branch when we are done
# If HEAD is also what we are releasing, we merge it back in.
if BASE=$(git symbolic-ref --short -q HEAD)
then
  echo "Releasing $BASE as $V (tagged as $TAG, updating $MAJOR_BR)..."
else
  echo "Detached HEAD detected. You must be on a branch to cut a release"
  exit 1
fi

echo "Creating release branch 'release/$V' from $BASE"
git fetch origin
git checkout -b release/"$V" "$BASE"

echo "Updating CHANGES.md"
slt-changelog --version "$V"

echo "Updating package version to $V"
slt version set "$V"
git add $(git ls-files ../scripts/sl-blip.js)

echo "Committing package and CHANGES for v$V"
git add $(git ls-files bower.json) package.json CHANGES.md
slt-changelog --summary --version $V | git commit -F-
slt-changelog --summary --version $V | git tag -a "$TAG" -F-

echo "Checking out starting branch"
git checkout "$BASE"

echo "Updating $BASE.."
# --ff: Prefer fast-forward merge, but fallback to real merge if necessary.
# NOTE: Use release/X here instead of the tag because you can't actually do a
# fast-forward merge to an annotated tag because it is actually a discrete
# object and not merely a ref to a commit!
git merge --ff --no-edit release/"$V"

# Need -D because master has not been pushed to origin/master. If we auto-push,
# we can change it to --delete, but I think it does no harm to use -D.
git branch -D release/"$V"

# Create or replace a major-version tracking branch (1.x, 2.x, etc.)
git branch -f "$MAJOR_BR" "$TAG"

if [ "$SLT_RELEASE_UPDATE" = "y" ]
then
  echo "Pushing tag $TAG and branches $MAJOR_BR and $BASE to origin"
  # XXX(rmg) Note the +prefix on the major tracking branch is necessary because
  # it is a convenience ref, not a real "branch"
  git push origin $TAG:$TAG $BASE:$BASE +$MAJOR_BR:$MAJOR_BR
else
  echo "Push tag $TAG and branches $MAJOR_BR and $BASE to origin"
  echo "NOTE: the +prefix is necessary on +$MAJOR_BR:$MAJOR_BR"
  echo "  git push origin $TAG:$TAG $BASE:$BASE +$MAJOR_BR:$MAJOR_BR"
fi

if [ "$SLT_RELEASE_PUBLISH" = "y" ]
then
  echo "Publishing to $(npm config get registry)"
  git checkout "$TAG"
  npm publish
  git checkout "$BASE"
else
  echo "Publish to npmjs.com when ready:"
  echo "  git checkout $TAG && npm publish"
fi

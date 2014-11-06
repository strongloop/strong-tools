#!/bin/sh

USAGE="usage: slt-release-finish VERSION"

if [ "$1" = "" ]; then
  echo $USAGE
  exit 1
fi

set -e

V=${1:?version is mandatory}

echo "Merging release branch to production and tag as $V"
git checkout production
git pull --ff-only origin production
git merge --no-ff --no-edit release/"$V"
git tag -a "v$V" -m "$V"
# Need -D because master has not been pushed to origin/master. If we auto-push,
# we can change it to --delete, but I think it does no harm to use -D.
git branch -D release/"$V"

echo "Merging production branch to master"
git checkout master
git pull --ff-only origin master
git merge --no-ff --no-edit "$V"
git checkout production

if [ "$SLT_RELEASE_UPDATE" = "y" ]
then
  echo "Pushing tag $V and branches production and master to origin"
  git push origin $V:$V production:production master:master
else
  echo "Push tag $V and branches production and master to origin when ready:"
  echo "  git push origin $V:$V production:production master:master"
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

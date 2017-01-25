#!/bin/sh

exec << "___"
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
shift $((OPTIND - 1))

case $1 in
  "")
    V=$(slt info version)
    ;;
  major|minor|patch|premajor|preminor|prepatch)
    INC=$1
    CURRENT=$(slt info version)
    V=$(slt semver -i $INC $CURRENT)
    ;;
  *)
    V=$1
    ;;
esac

# Ensure V is never prefixed with v, but TAG always is
V=${V#v}
TAG="v$V"
MAJOR_V=${V%%.*}
NAME=$(slt info name)

if [ -z "$V" ]; then
  echo "Missing version, try \`slt-release -h\` for help."
  exit 1
elif ! slt semver $V; then
  echo "Invalid version given: $V"
  exit 1
elif git show-ref --tags --quiet $TAG; then
  echo "Tag already exists: $TAG"
  exit 1
elif [ "$(npm info $NAME@$V .version)" = "$V" ]; then
  echo "$NAME@$V already published (but not tagged in git)"
  exit 1
fi

set -e

# Our starting point, so we can return to that branch when we are done
# If HEAD is also what we are releasing, we merge it back in.
if BASE=$(git symbolic-ref --short -q HEAD)
then
  echo "Releasing $BASE as $V (tagged as $TAG)..."
else
  echo "Detached HEAD detected. You must be on a branch to cut a release"
  exit 1
fi

echo "Creating temporary local release branch 'release/$V' from $BASE"
git fetch origin
git checkout -b release/"$V" "$BASE"

echo "Updating CHANGES.md"
slt-changelog --version "$V"

echo "Updating package version to $V"
slt version set "$V"

echo "Committing package and CHANGES for v$V"
if [ -e .sl-blip.js ]; then
  git add .sl-blip.js
fi
TO_ADD="$(git ls-files bower.json) package.json CHANGES.md"
TO_REMOVE=""
if [ -e npm-shrinkwrap.json ]; then
  if ! git cat-file -e "$BASE":npm-shrinkwrap.json; then
    TO_REMOVE="npm-shrinkwrap.json"
  fi
  TO_ADD="$TO_ADD npm-shrinkwrap.json"
fi

git add $TO_ADD
slt-changelog --summary --version $V | git commit -F-
slt-changelog --summary --version $V | git tag -a "$TAG" -F-

echo "Updating $BASE.."
# if we committed a file as part of the release, but it wasn't previously
# being tracked, like an npm-shrinkwrap.json, then we want to do some git
# dark magic to remove it as part of the merge back in to the base branch
if [ -n "$TO_REMOVE" ]; then
  echo "Composing merge commit..."
  # 1. stage a commit as though we're just removing the files we want to
  # to filter out.
  echo "Filtering out: $TO_REMOVE"
  git rm $TO_REMOVE
  # 2. Now we need to do what "git commit" and "git merge" both do under
  # the hood, but don't actually expose: build our own bespoke commit!
  # 2a. create a tree object from INDEX (git commit does this normally)
  echo "Building tree.."
  TREE=$(git write-tree --missing-ok)
  # 2b. create a commit object from the tree object, with both our base
  # and our release branches as parent commits. This is what git merge
  # does, except the only access it gives to the tree it uses is if you
  # have merge conflicts that needed to be resolved.
  echo "Building commit.."
  SHA1=$(git commit-tree -p $BASE -p release/"$V" -m "Merge $V release" $TREE)
  # 2c. now we have a lovely git commit floating around. Quick, catch it
  # and slap a ref on it before it gets garbage collected! (not actually
  # a concern, but it makes for a better story).
  # git merge and git commit both normally do this for us, but we have to
  # do it ourselves since we are sort of re-implementing them.
  echo "Updating $BASE ref"
  git update-ref refs/heads/$BASE $SHA1
  # 3. Now check out out the base branch - that's right, we merged our
  # release branch into the base branch without even checking out the
  # base branch. Didn't you notice? Cool, right?
  echo "Checking out starting branch"
  git checkout "$BASE"
else
  echo "Checking out starting branch"
  git checkout "$BASE"
  # --ff: Prefer fast-forward merge, but fallback to real merge if necessary.
  # NOTE: Use release/X here instead of the tag because you can't actually do a
  # fast-forward merge to an annotated tag because it is actually a discrete
  # object and not merely a ref to a commit!
  git merge --ff --no-edit release/"$V"
fi

# Need -D because master has not been pushed to origin/master. If we auto-push,
# we can change it to --delete, but I think it does no harm to use -D.
git branch -D release/"$V"

if [ "$SLT_RELEASE_UPDATE" = "y" ]
then
  echo "Pushing tag $TAG and branch $BASE to origin"
  git push origin $TAG:$TAG $BASE:$BASE
else
  echo "Push tag $TAG and branch $BASE to origin"
  echo "  git push origin $TAG:$TAG $BASE:$BASE"
fi

if [ "$SLT_RELEASE_PUBLISH" = "y" ]
then
  echo "Publishing to $(npm config get registry)"
  git checkout "$TAG"
  # npm uses .gitignore if there is no .npmignore, so we'll use that as
  # our starting point if there isn't already a .npmigore file
  if test -f ".gitignore" -a ! -f ".npmignore"; then
    cp .gitignore .npmignore
  fi
  if test "$(slt info get . publishConfig.export-tests)" != "true"; then
    # ignore the entire test tree
    if ! grep -q "^test$" .npmignore; then
      echo "  ignoring the entire test/ directory"
      echo "test" >> .npmignore
    fi
  fi
  if ! grep -q "^\.travis\.yml$" .npmignore; then
    echo "  ignoring .travis.yml"
    echo ".travis.yml" >> .npmignore
  fi

  npm publish
  git checkout "$BASE"
  echo "You can revert .npmignore changes now (if there were any)."
else
  echo "Publish to npmjs.com when ready:"
  echo "  git checkout $TAG && npm publish"
fi

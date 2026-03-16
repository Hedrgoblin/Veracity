#!/bin/bash
set -e

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo ""
  echo "You have uncommitted changes:"
  echo ""
  git status --short
  echo ""
  read -p "Commit these changes before deploying? (y/n): " ANSWER

  if [ "$ANSWER" = "y" ] || [ "$ANSWER" = "Y" ]; then
    read -p "Commit message: " MSG
    git add -A
    git commit -m "$MSG

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    git push origin main
    echo ""
    echo "Changes committed and pushed to GitHub."
  else
    echo ""
    echo "Deploying without committing local changes."
    echo "(Your changes will be in the deployed build but not saved to GitHub source.)"
    echo ""
  fi
fi

echo "Building..."
npm run build

echo "Deploying to GitHub Pages..."
git checkout --orphan gh-pages-temp
git rm -rf .
cp -r dist/. .
rm -rf dist
git add -A
git commit -m 'Deploy to GitHub Pages'
git push origin gh-pages-temp:gh-pages --force
git checkout main
git branch -D gh-pages-temp

echo ""
echo "Done! Live at https://hedrgoblin.github.io/Veracity/"

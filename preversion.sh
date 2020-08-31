git checkout release
git checkout master .
git restore --staged .gitignore
git checkout .gitignore
npm run build
git add .

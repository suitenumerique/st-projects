#!/bin/bash

set -o errexit    # always exit on error
set -o pipefail   # don't ignore exit codes when piping output
shopt -s dotglob

echo "-----> Running post-frontend script"

# Move the build frontend files to the backend
rm -rf server/public/
mv client/build server/public

# Move the build index.html to the backend
cp server/public/index.html server/views/index.ejs

# Cleanup
rm -rf client charts config docker-* Docker* package* *.md

mv server/* ./

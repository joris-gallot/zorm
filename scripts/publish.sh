#!/bin/sh

project=$1

if [ -z "$project" ]; then
  echo "Usage: $0 <package-name>"
  echo "Available packages: core, vue"
  exit 1
fi

if [ "$project" != "core" ] && [ "$project" != "vue" ]; then
  echo "Invalid package name. Available packages: core, vue"
  exit 1
fi

pnpm "build:$project"

cp LICENSE packages/$project/
if [ "$project" = "core" ]; then
  cp README.md packages/$project/
fi

cd packages/$project

echo "Publishing $project package to npm..."
pnpm publish --access public --no-git-checks

rm LICENSE
if [ "$project" = "core" ]; then
  rm README.md
fi

echo "✅ Done!"

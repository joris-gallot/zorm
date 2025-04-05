#!/bin/sh

if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN is not set"
  exit 1
fi

pnpm build

cp README.md LICENSE packages/core/

cd packages/core

echo "Publishing to npm..."
pnpm publish --no-git-checks

rm README.md LICENSE

echo "✅ Done!"

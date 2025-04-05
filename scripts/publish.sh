#!/bin/sh

pnpm build

cp README.md LICENSE packages/core/

cd packages/core

echo "Publishing to npm..."
pnpm publish --no-git-checks

rm README.md LICENSE

echo "✅ Done!"

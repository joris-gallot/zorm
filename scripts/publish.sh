#!/bin/sh

pnpm build

cp README.md LICENSE packages/core/

cd packages/core

echo "Publishing to npm..."
npm publish

rm README.md LICENSE

echo "✅ Done!"

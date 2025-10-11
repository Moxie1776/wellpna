#!/bin/bash
# Usage: source scripts/set-db-env.sh
export DATABASE_URL="$(npx tsx scripts/print-db-url.ts | grep '^postgres' | tr -d '\n' | xargs)"
export JWT_SECRET="$(npx tsx scripts/print-jwt-secret.ts | grep -E '^[0-9a-f]{64}$' | tr -d '\n' | xargs)"
echo "DATABASE_URL and JWT_SECRET set for this shell session."

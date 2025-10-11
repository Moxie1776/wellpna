#!/usr/bin/env tsx
// scripts/print-jwt-secret.ts
import secretManager from '../src/utils/secret'

async function main() {
  try {
    const jwtSecret = await secretManager.getJwtSecret()
    console.log(jwtSecret)
  } catch (error) {
    console.error('Error fetching JWT secret:', error)
    process.exit(1)
  }
}

main()

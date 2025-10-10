#!/usr/bin/env node

// Script to set DATABASE_URL from AWS secrets for Prisma operations
// Run this before prisma generate/migrate commands

import { config } from 'dotenv'

import secretManager from '../src/utils/secret.js'

config()

async function setupDatabaseUrl() {
  try {
    console.log('Fetching database URL from AWS secrets...')
    const dbUrl = await secretManager.getDatabaseUrl()
    process.env.DATABASE_URL = dbUrl
    console.log('✅ DATABASE_URL set successfully')
    console.log(`Database: ${dbUrl.split('@')[1]?.split('/')[0]}`)
  } catch (error) {
    console.error('❌ Failed to set DATABASE_URL:', error.message)
    process.exit(1)
  }
}

setupDatabaseUrl()

import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import logger from '../utils/logger'

// Ensure we import the schema and call printSchema from the same runtime instance
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { printSchema } = require('graphql')

// Import schema after graphql resolved
import { schema } from '.'

const out = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../generated/schema.graphql',
)
writeFileSync(out, printSchema(schema))
logger.info('Wrote schema to ' + out)

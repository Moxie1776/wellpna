import { writeFileSync } from 'fs'
import { printSchema } from 'graphql'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import logger from '../utils/logger'
// Import schema after graphql resolved
import { schema } from '.'

const out = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../generated/schema.graphql',
)
writeFileSync(out, printSchema(schema))
logger.info('Wrote schema to ' + out)

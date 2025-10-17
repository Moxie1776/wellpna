// Import all types
import '../graphql/types/User'
import '../graphql/types/UserRole'
import '../graphql/types/Auth'
import '../graphql/types/Operator'
import '../graphql/types/OperatorEnum'
import '../graphql/types/OperatorUser'
import '../graphql/types/Well'
import '../graphql/types/Casing'
import '../graphql/types/CasingEnum'
import '../graphql/types/Geology'
import '../graphql/types/Location'
import '../graphql/types/MechanicalIsolation'
import '../graphql/types/Perforation'
import '../graphql/types/PlugSchedule'
import '../graphql/types/Rods'
import '../graphql/types/Tubing'
import '../graphql/types/WellInfo'
// Import all queries
import '../graphql/queries/user'
import '../graphql/queries/auth'
// Import all mutations
import '../graphql/mutations/auth'

// Export the schema
import { builder } from '../builder'
import { writeFileSync } from 'fs'
import { printSchema } from 'graphql'

export const schema = builder.toSchema({})

// Export schema as SDL for frontend codegen
const schemaSDL = printSchema(schema)
writeFileSync('./src/generated/schema.graphql', schemaSDL)
console.log('Schema exported to ./src/generated/schema.graphql')

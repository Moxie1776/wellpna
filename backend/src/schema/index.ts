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
import '../graphql/mutations/operator'

// Export the schema (ESM-friendly)
import { builder } from '../builder'

// Export Pothos schema only. Codegen (writing SDL) is performed by a separate
// build script to avoid side-effects during module import in tests.
export const schema = builder.toSchema({})

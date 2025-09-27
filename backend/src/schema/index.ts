// Import all types
import '../graphql/types/User';
import '../graphql/types/UserRole';
import '../graphql/types/Auth';

// Import all queries
import '../graphql/queries/user';

// Import all mutations
import '../graphql/mutations/auth';

// Export the schema
import { builder } from '../builder';
export const schema = builder.toSchema({});

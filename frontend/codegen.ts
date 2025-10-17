import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../backend/src/generated/schema.graphql',
  documents: ['src/graphql/**/*.ts'],
  generates: {
    'src/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config

import { cacheExchange, createClient, errorExchange, fetchExchange } from 'urql'

import logger from './logger'

// Use Vite env variables (import.meta.env.VITE_*).
const graphQLEndpoint = String(
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? 'https://3.17.67.172/graphql',
)

if (!graphQLEndpoint) {
  logger.warn('VITE_GRAPHQL_ENDPOINT is not defined in import.meta.env')
}

const client = createClient({
  url: graphQLEndpoint,
  exchanges: [
    cacheExchange,
    errorExchange({
      onError: (error) => {
        logger.error('GraphQL Error:', error)
      },
    }),
    fetchExchange,
  ],
  fetchOptions: () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : undefined
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  },
})
export default client

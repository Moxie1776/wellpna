import { config } from 'dotenv'
import { cacheExchange, createClient, fetchExchange } from 'urql'
import logger from './logger'
config()

// Use Vite's built-in environment variable handling
const graphQLEndpoint = process.env.VITE_GRAPHQL_ENDPOINT + ''

logger.debug(`GraphQL Endpoint: ${graphQLEndpoint}`)
logger.debug(`Import Meta:${import.meta.env.VITE_GRAPHQL_ENDPOINT}`)

const client = createClient({
  url: graphQLEndpoint,
  exchanges: [cacheExchange, fetchExchange],
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

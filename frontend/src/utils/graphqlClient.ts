import { cacheExchange, createClient, fetchExchange } from 'urql'

// Only use process.env for environment variables in shared code
function getGraphQLEndpoint() {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.VITE_GRAPHQL_ENDPOINT
  ) {
    return process.env.VITE_GRAPHQL_ENDPOINT
  }
  return 'http://localhost:4000/graphql'
}

const client = createClient({
  url: getGraphQLEndpoint(),
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

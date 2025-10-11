import { cacheExchange, createClient, fetchExchange } from 'urql'

// Use Vite's built-in environment variable handling
const graphQLEndpoint =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

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

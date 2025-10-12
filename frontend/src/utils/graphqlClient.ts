import { cacheExchange, createClient, fetchExchange } from 'urql'

// Use Vite's env directly. import.meta.env.meta is incorrect — use import.meta.env.VITE_*.
const graphQLEndpoint = String(import.meta.env.VITE_GRAPHQL_ENDPOINT ?? '')

if (!graphQLEndpoint) {
  // Helpful runtime hint when env isn't provided
  // eslint-disable-next-line no-console
  console.warn('VITE_GRAPHQL_ENDPOINT is not defined in import.meta.env')
}

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

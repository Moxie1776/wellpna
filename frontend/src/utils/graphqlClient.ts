import { cacheExchange, createClient, fetchExchange } from 'urql'

const client = createClient({
  url: process.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = localStorage.getItem('token')
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  },
})

export default client

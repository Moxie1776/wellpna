import { cacheExchange, createClient, fetchExchange } from 'urql'

// __VITE_GRAPHQL_ENDPOINT__ is injected at build time via `vite.config.ts` define.
// Fallback order:
// 1. build-time global __VITE_GRAPHQL_ENDPOINT__
// 2. Vite's import.meta.env (when available)
// 3. process.env for Jest/tests or Node environments
declare const __VITE_GRAPHQL_ENDPOINT__: string | undefined
const graphQLEndpoint =
  (typeof __VITE_GRAPHQL_ENDPOINT__ !== 'undefined' &&
    String(__VITE_GRAPHQL_ENDPOINT__)) ||
  (typeof process !== 'undefined' &&
    (process.env as any).VITE_GRAPHQL_ENDPOINT) ||
  ''

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

import { cleanup } from '@testing-library/react'

// Global teardown for frontend tests
export default async function teardown() {
  // Clean up any testing library side effects
  cleanup()

  // Clean up localStorage and sessionStorage
  localStorage.clear()
  sessionStorage.clear()

  // Clean up any global test state if needed
  // Add any other cleanup logic here as tests grow
}

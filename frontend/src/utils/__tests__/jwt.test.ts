import { decodeToken, isTokenExpired, isValidJWTFormat } from '../jwt'

// Helper function to create a valid JWT token for testing
function createTestJWT(payload: object, exp?: number): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const fullPayload = { ...payload, ...(exp && { exp }) }

  const encodeBase64Url = (obj: object): string => {
    const json = JSON.stringify(obj)
    return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  const headerEncoded = encodeBase64Url(header)
  const payloadEncoded = encodeBase64Url(fullPayload)
  const signature = 'dummy_signature' // Not validated in our decode function

  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

describe('JWT Utils', () => {
  describe('decodeToken', () => {
    it('should decode a valid JWT token', () => {
      const payload = { userId: 123, email: 'test@example.com' }
      const token = createTestJWT(payload)
      const decoded = decodeToken(token)

      expect(decoded).toEqual(payload)
    })

    it('should return null for token with invalid number of parts', () => {
      const invalidToken = 'header.payload'
      const decoded = decodeToken(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should return null for token with invalid base64 in payload', () => {
      const invalidToken = 'header.invalid_base64.signature'
      const decoded = decodeToken(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should return null for token with malformed JSON in payload', () => {
      // Create token with invalid JSON
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
      const payload = btoa('{invalid json')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
      const invalidToken = `${header}.${payload}.signature`

      const decoded = decodeToken(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should return null for empty token', () => {
      const decoded = decodeToken('')

      expect(decoded).toBeNull()
    })

    it('should handle tokens with padding in base64', () => {
      const payload = { test: 'value' }
      const token = createTestJWT(payload)
      const decoded = decodeToken(token)

      expect(decoded).toEqual(payload)
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for valid token with future expiration', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const token = createTestJWT({}, futureExp)
      const isExpired = isTokenExpired(token)

      expect(isExpired).toBe(false)
    })

    it('should return true for token with past expiration', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      const token = createTestJWT({}, pastExp)
      const isExpired = isTokenExpired(token)

      expect(isExpired).toBe(true)
    })

    it('should return true for token without exp claim', () => {
      const token = createTestJWT({ userId: 123 })
      const isExpired = isTokenExpired(token)

      expect(isExpired).toBe(true)
    })

    it('should return true for invalid token', () => {
      const invalidToken = 'invalid.token'
      const isExpired = isTokenExpired(invalidToken)

      expect(isExpired).toBe(true)
    })

    it('should return true for token with non-numeric exp', () => {
      const payload = { exp: 'not-a-number' }
      const token = createTestJWT(payload)
      const isExpired = isTokenExpired(token)

      expect(isExpired).toBe(true)
    })

    it('should return false for token with exp at current time', () => {
      const currentExp = Math.floor(Date.now() / 1000)
      const token = createTestJWT({}, currentExp)
      const isExpired = isTokenExpired(token)

      expect(isExpired).toBe(false) // exp == currentTime, not expired
    })
  })

  describe('isValidJWTFormat', () => {
    it('should return true for valid JWT format', () => {
      const token = createTestJWT({ test: 'value' })
      const isValid = isValidJWTFormat(token)

      expect(isValid).toBe(true)
    })

    it('should return false for non-string input', () => {
      // @ts-expect-error Testing invalid input
      const isValid = isValidJWTFormat(123)

      expect(isValid).toBe(false)
    })

    it('should return false for empty string', () => {
      const isValid = isValidJWTFormat('')

      expect(isValid).toBe(false)
    })

    it('should return false for token with wrong number of parts', () => {
      const invalidToken = 'header.payload'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with too many parts', () => {
      const invalidToken = 'header.payload.signature.extra'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with invalid characters in header', () => {
      const invalidToken = 'header@invalid.payload.signature'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with invalid characters in payload', () => {
      const invalidToken = 'header.payload@invalid.signature'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with invalid characters in signature', () => {
      const invalidToken = 'header.payload.signature@invalid'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with empty header', () => {
      const invalidToken = '.payload.signature'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with empty payload', () => {
      const invalidToken = 'header..signature'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return false for token with empty signature', () => {
      const invalidToken = 'header.payload.'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })

    it('should return true for token with valid special characters in base64url', () => {
      const token = 'a-b_c.d-e_f.g-h_i'
      const isValid = isValidJWTFormat(token)

      expect(isValid).toBe(true)
    })

    it('should return false for token with spaces', () => {
      const invalidToken = 'header payload.signature'
      const isValid = isValidJWTFormat(invalidToken)

      expect(isValid).toBe(false)
    })
  })
})

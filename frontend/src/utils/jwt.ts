/**
 * Decoded JWT token payload interface
 */
interface DecodedToken {
  [key: string]: any
  exp?: number
  iat?: number
}

/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token string
 * @returns The decoded payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    // Convert base64url to base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    )
    const decoded = atob(paddedBase64)

    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token string
 * @returns true if expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token)
  if (!decoded || typeof decoded.exp !== 'number') {
    return true
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Validates the basic structure of a JWT token
 * @param token - The JWT token string
 * @returns true if valid format, false otherwise
 */
export function isValidJWTFormat(token: string): boolean {
  if (typeof token !== 'string' || token.length === 0) {
    return false
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  // Check if each part is valid base64url (contains only A-Z, a-z, 0-9, -, _)
  const base64urlRegex = /^[A-Za-z0-9-_]+$/
  return parts.every((part) => base64urlRegex.test(part) && part.length > 0)
}

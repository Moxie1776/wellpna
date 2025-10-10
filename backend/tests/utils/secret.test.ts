import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals'
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import secretManager from '../../src/utils/secret'

// Mock the AWS SDK
jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  GetSecretValueCommand: jest.fn(),
}))

const mockSecretsManagerClient = SecretsManagerClient as jest.MockedClass<
  typeof SecretsManagerClient
>
const mockGetSecretValueCommand = GetSecretValueCommand as jest.MockedClass<
  typeof GetSecretValueCommand
>

describe('SecretsManager', () => {
  let mockClient: any

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Setup mock client
    mockClient = {
      send: jest.fn(),
    }
    mockSecretsManagerClient.mockImplementation(() => mockClient)
  })

  afterEach(() => {
    // Clear cache between tests
    secretManager.clearCache()
  })

  describe('getDatabaseCredentials', () => {
    it('should retrieve database credentials from AWS Secrets Manager', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockCredentials),
      })

      const result = await secretManager.getDatabaseCredentials()

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.any(GetSecretValueCommand),
      )
      expect(result).toEqual(mockCredentials)
    })

    it('should use cached credentials on subsequent calls', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockCredentials),
      })

      // First call
      await secretManager.getDatabaseCredentials()
      // Second call should use cache
      await secretManager.getDatabaseCredentials()

      // Should only call AWS once due to caching
      expect(mockClient.send).toHaveBeenCalledTimes(1)
    })

    it('should throw error when AWS call fails', async () => {
      const errorMessage = 'Access denied'
      mockClient.send.mockRejectedValue(new Error(errorMessage))

      await expect(secretManager.getDatabaseCredentials()).rejects.toThrow(
        errorMessage,
      )
    })
  })

  describe('getDatabaseUrl', () => {
    it('should construct database URL from credentials', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockCredentials),
      })

      const result = await secretManager.getDatabaseUrl()

      expect(result).toBe(
        'postgresql://testuser:testpass@localhost:5432/testdb?sslmode=require',
      )
    })

    it('should use cached credentials for URL construction', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockCredentials),
      })

      // First call to cache credentials
      await secretManager.getDatabaseCredentials()
      // Second call should use cache
      await secretManager.getDatabaseUrl()

      // Should only call AWS once
      expect(mockClient.send).toHaveBeenCalledTimes(1)
    })
  })

  describe('getJwtSecret', () => {
    it('should retrieve JWT secret from AWS Secrets Manager', async () => {
      const mockJwtData = {
        jwt_secret: 'supersecretkey',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockJwtData),
      })

      const result = await secretManager.getJwtSecret()

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.any(GetSecretValueCommand),
      )
      expect(result).toBe('supersecretkey')
    })

    it('should use cached JWT secret on subsequent calls', async () => {
      const mockJwtData = {
        jwt_secret: 'supersecretkey',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockJwtData),
      })

      // First call
      await secretManager.getJwtSecret()
      // Second call should use cache
      await secretManager.getJwtSecret()

      // Should only call AWS once due to caching
      expect(mockClient.send).toHaveBeenCalledTimes(1)
    })

    it('should throw error when JWT secret retrieval fails', async () => {
      const errorMessage = 'Secret not found'
      mockClient.send.mockRejectedValue(new Error(errorMessage))

      await expect(secretManager.getJwtSecret()).rejects.toThrow(errorMessage)
    })
  })

  describe('caching behavior', () => {
    it('should cache different secrets separately', async () => {
      const mockDbCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      const mockJwtData = {
        jwt_secret: 'supersecretkey',
      }

      mockClient.send
        .mockResolvedValueOnce({
          SecretString: JSON.stringify(mockDbCredentials),
        })
        .mockResolvedValueOnce({
          SecretString: JSON.stringify(mockJwtData),
        })

      // Call both functions
      await secretManager.getDatabaseCredentials()
      await secretManager.getJwtSecret()

      // Should call AWS twice for different secrets
      expect(mockClient.send).toHaveBeenCalledTimes(2)
    })

    it('should respect cache timeout', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockCredentials),
      })

      // First call
      await secretManager.getDatabaseCredentials()

      // Manually expire cache by setting old timestamp
      const secretsManagerInstance = secretManager as any
      const cacheKey =
        'arn:aws:secretsmanager:us-east-2:747034604465:secret:rds!db-06382c2b-73e0-4519-9a20-2a08d9246126-QCDfwn'
      secretsManagerInstance.cache.set(cacheKey, {
        data: mockCredentials,
        timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago (past timeout)
      })

      // Second call should fetch again
      await secretManager.getDatabaseCredentials()

      // Should call AWS twice
      expect(mockClient.send).toHaveBeenCalledTimes(2)
    })
  })

  describe('clearCache', () => {
    it('should clear all cached secrets', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpass',
        host: 'localhost',
        port: 5432,
        dbname: 'testdb',
      }

      mockClient.send.mockResolvedValue({
        SecretString: JSON.stringify(mockCredentials),
      })

      // Cache the secret
      await secretManager.getDatabaseCredentials()
      expect(mockClient.send).toHaveBeenCalledTimes(1)

      // Clear cache
      secretManager.clearCache()

      // Next call should fetch again
      await secretManager.getDatabaseCredentials()
      expect(mockClient.send).toHaveBeenCalledTimes(2)
    })
  })
})

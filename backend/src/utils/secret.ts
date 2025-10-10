interface DatabaseCredentials {
  username: string
  password: string
  host: string
  port: number
  dbname: string
}

interface JwtSecretData {
  jwt_secret: string
}

import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager'

class SecretsManager {
  private secretsManager: SecretsManagerClient
  private cache: Map<string, { data: any; timestamp: number }>
  private cacheTimeout: number

  constructor() {
    this.secretsManager = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-2',
    })
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  async getSecret(secretName: string): Promise<any> {
    const cached = this.cache.get(secretName)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      console.log(`Fetching secret: ${secretName}`)
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      })
      const result = await this.secretsManager.send(command)

      const secretData = JSON.parse(result.SecretString!)

      this.cache.set(secretName, {
        data: secretData,
        timestamp: Date.now(),
      })

      return secretData
    } catch (error) {
      console.error('Error retrieving secret:', error)
      throw error
    }
  }

  async getDatabaseCredentials(): Promise<DatabaseCredentials> {
    // Use the RDS-managed secret ARN
    return await this.getSecret(
      'arn:aws:secretsmanager:us-east-2:747034604465:secret:wellpna/database/app-credentials-t2medS',
    )
  }

  async getDatabaseUrl(): Promise<string> {
    const dbCredentials = await this.getDatabaseCredentials()
    const encodedPassword = encodeURIComponent(dbCredentials.password)
    return `postgresql://${dbCredentials.username}:${encodedPassword}@${
      dbCredentials.host
    }:${dbCredentials.port}/${dbCredentials.dbname}?schema=public`
  }

  async getJwtSecret(): Promise<string> {
    const jwtData: JwtSecretData = await this.getSecret(
      'arn:aws:secretsmanager:us-east-2:747034604465:secret:' +
        'wellpna/jwt/secret-RERkFY',
    )
    return jwtData.jwt_secret
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export default new SecretsManager()

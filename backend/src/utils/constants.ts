import secretManager from './secret'

let jwtSecret: string | null = null

export const getJwtSecret = async (): Promise<string> => {
  if (!jwtSecret) {
    jwtSecret = await secretManager.getJwtSecret()
  }
  return jwtSecret
}

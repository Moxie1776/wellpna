import secretManager from '../src/utils/secret'

async function printDatabaseUrl() {
  const url = await secretManager.getDatabaseUrl()
  console.log(url)
}

printDatabaseUrl()

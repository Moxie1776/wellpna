import { spawn } from 'child_process'
import { createServer } from 'net'

const checkPortInUse = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const testServer = createServer()
      .once('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          resolve(true) // Port is in use
        } else {
          resolve(false)
        }
      })
      .once('listening', () => {
        testServer.close()
        resolve(false) // Port is free
      })
      .listen(port)
  })
}

export default async function globalSetup() {
  // Set test environment variables
  process.env.VITE_GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql'
  process.env.NODE_ENV = 'debug'

  // Check if server is already running on port 4000
  const portInUse = await checkPortInUse(4000)

  if (!portInUse) {
    // Start the backend server using npm test from backend directory
    // This will run the backend tests which start the server
    const backendProcess = spawn('npm', ['test', '--', '--run'], {
      cwd: '../../backend',
      stdio: 'inherit',
      detached: true
    })

    // Store the process so we can kill it later
    ;(global as any).__backendProcess = backendProcess

    // Wait for server to be ready
    let attempts = 0
    while (attempts < 30) { // Wait up to 30 seconds
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (await checkPortInUse(4000)) {
        console.log('Backend server is ready on port 4000')
        break
      }
      attempts++
    }

    if (attempts >= 30) {
      throw new Error('Backend server failed to start within 30 seconds')
    }
  } else {
    console.log('Using existing server running on port 4000')
  }

  // Return teardown function
  return async () => {
    const backendProcess = (global as any).__backendProcess
    if (backendProcess) {
      try {
        process.kill(-backendProcess.pid, 'SIGTERM')
        console.log('Backend process terminated')
      } catch (err) {
        console.error('Error terminating backend process:', err)
      }
    }
  }
}

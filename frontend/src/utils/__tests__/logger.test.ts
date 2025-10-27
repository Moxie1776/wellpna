import { describe, expect, it } from 'vitest'

import logger from '../../utils/logger'

describe('Logger', () => {
  it('logs error messages', () => {
    // Test that logger functions can be called without throwing errors
    expect(() => logger.error('Test error message')).not.toThrow()
  })

  it('logs info messages', () => {
    // Test that logger functions can be called without throwing errors
    expect(() => logger.info('Test info message')).not.toThrow()
  })

  it('logs warn messages', () => {
    // Test that logger functions can be called without throwing errors
    expect(() => logger.warn('Test warn message')).not.toThrow()
  })
})

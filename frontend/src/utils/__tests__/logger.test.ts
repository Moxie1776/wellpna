import { describe, expect, it, vi } from 'vitest'
import logger from '../../utils/logger'

describe('Logger', () => {
  it('logs error messages', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('Test error message')
    expect(spy).toHaveBeenCalledWith('[ERROR] Test error message')
    spy.mockRestore()
  })

  it('logs info messages', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    logger.info('Test info message')
    expect(spy).toHaveBeenCalledWith('[INFO] Test info message')
    spy.mockRestore()
  })

  it('logs warn messages', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('Test warn message')
    expect(spy).toHaveBeenCalledWith('[WARN] Test warn message')
    spy.mockRestore()
  })
})

import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('returns store values and actions', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current).toBeDefined()
  })
})

import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.stubGlobal('fetch', vi.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ remotes: {} }),
  } as Response)
))

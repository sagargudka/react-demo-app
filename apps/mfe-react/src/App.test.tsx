import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { vi } from 'vitest'

describe('React Remote Component', () => {
  test('renders initial no message state', () => {
    render(<App />)
    expect(screen.getByText(/No message received yet/)).toBeInTheDocument()
  })

  test('dispatches update-state event on button click', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    render(<App />)
    const button = screen.getByRole('button', { name: /Update Host Zustand State/i })
    await userEvent.click(button)
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'remote:update-state',
        detail: 'Updated by React Remote!'
      })
    )
  })
})

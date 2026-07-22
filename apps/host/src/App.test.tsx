import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App Component', () => {
  test('renders initial message from store', () => {
    render(<App />)
    expect(screen.getByText('Hello From Main App')).toBeInTheDocument()
  })

  test('updates message on button click', async () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /set message/i })
    await userEvent.click(button)
    expect(screen.getByText('Updated by Host App!')).toBeInTheDocument()
  })
})

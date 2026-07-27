import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const mockSystemDesignData = [
  {
    id: "sys-uber-master",
    category: "High-Level & Low-Level System Design",
    question: "System Design: Uber / Lyft (Real-Time Driver Tracking, Geo-Sharding & Surge Engine)",
    snippet: "ASCII Horseshoe Whiteboard Architecture",
    answer: "Phase 0: Problem Alignment & Business Context"
  }
]

describe('System Design Cards Grid Integration Test', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('system-design.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSystemDesignData)
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      } as Response)
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('navigates to System Design tab and renders Topic Cards Grid, then opens Fullscreen Modal on click', async () => {
    render(<App />)
    
    // Click System Design tab
    const sysDesignBtn = screen.getByRole('button', { name: /system design/i })
    await userEvent.click(sysDesignBtn)

    // Verify card is rendered in Grid View
    await waitFor(() => {
      expect(screen.getByText(/System Design: Uber \/ Lyft/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/Inspect Architecture ➔/i)).toBeInTheDocument()

    // Click card to open Fullscreen Modal Solution
    const card = screen.getByText(/System Design: Uber \/ Lyft/i)
    await userEvent.click(card)

    // Verify Fullscreen Modal opens with Back button and sub-tabs
    expect(screen.getByText(/← Back to Topic Cards/i)).toBeInTheDocument()
    expect(screen.getByText(/💎 HD Step-by-Step System Topology & Dataflow/i)).toBeInTheDocument()
    expect(screen.getByText(/GUIDED ARCHITECTURE DATAFLOW/i)).toBeInTheDocument()
  })
})

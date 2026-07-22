import { create } from 'zustand'

interface AppState {
  message: string
  updateMessage: (newMessage: string, syncOnly?: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  message: 'Hello From Main App',
  updateMessage: (newMessage, syncOnly = false) => {
    set({ message: newMessage })
    if (!syncOnly) {
      // Dispatch custom event to notify micro-frontends
      window.dispatchEvent(
        new CustomEvent('host:state-change', { detail: newMessage })
      )
    }
  },
}))

// Add listeners to sync state updates from remotes back into Zustand
if (typeof window !== 'undefined') {
  window.addEventListener('remote:update-state', (e: Event) => {
    const customEvent = e as CustomEvent
    useAppStore.getState().updateMessage(customEvent.detail || '', true)
  })

  // Respond to remotes requesting the initial state when they load
  window.addEventListener('remote:request-initial-state', () => {
    window.dispatchEvent(
      new CustomEvent('host:state-change', { detail: useAppStore.getState().message })
    )
  })
}

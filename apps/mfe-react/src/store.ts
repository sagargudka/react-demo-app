import { create } from 'zustand'

interface AppState {
  message: string
  updateMessage: (newMessage: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  message: 'Hello From Main App',
  updateMessage: (newMessage) => set({ message: newMessage }),
}))

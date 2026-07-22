import { useState, useEffect } from 'react'
import pkg from '../package.json'

function App() {
  const [hostMessage, setHostMessage] = useState('No message received yet')
  const [localData, setLocalData] = useState(localStorage.getItem('shared-local-data') || '')
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    // Listen for custom event from host
    const handleHostState = (e: Event) => {
      const customEvent = e as CustomEvent
      setHostMessage(customEvent.detail || '')
    }
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      setLocalData(localStorage.getItem('shared-local-data') || '')
    }

    const handleRouteSync = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('host:state-change', handleHostState)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('popstate', handleRouteSync)
    window.addEventListener('shell:navigate', handleRouteSync)
    
    // Request initial state from host
    window.dispatchEvent(new CustomEvent('remote:request-initial-state'))

    return () => {
      window.removeEventListener('host:state-change', handleHostState)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('popstate', handleRouteSync)
      window.removeEventListener('shell:navigate', handleRouteSync)
    }
  }, [])

  const updateHostZustand = () => {
    window.dispatchEvent(
      new CustomEvent('remote:update-state', { detail: 'Updated by React Remote!' })
    )
  }

  const updateLocalStorage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    localStorage.setItem('shared-local-data', val)
    setLocalData(val)
    window.dispatchEvent(new Event('storage'))
  }

  const navigateTo = (path: string) => {
    window.dispatchEvent(new CustomEvent('shell:navigate', { detail: path }))
  }

  return (
    <div style={{ border: '2px dashed #aa3bff', padding: '15px', borderRadius: '8px', margin: '15px 0' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#aa3bff' }}>React Remote Micro-Frontend</h3>
      <p><strong>Zustand Message (from Event):</strong> {hostMessage}</p>
      <button onClick={updateHostZustand}>
        Update Host Zustand State
      </button>
      
      <div style={{ marginTop: '15px' }}>
        <label><strong>Shared LocalStorage Data:</strong> </label>
        <input 
          type="text" 
          value={localData} 
          onChange={updateLocalStorage}
          placeholder="Type here to sync..."
          style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', color: '#000', marginLeft: '5px' }}
        />
      </div>

      {/* Internal Routing Simulation */}
      <div style={{ marginTop: '15px', background: 'rgba(170, 59, 255, 0.05)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(170, 59, 255, 0.2)' }}>
        <strong>MFE Internal Route:</strong>
        {currentPath === '/react-remote/subpage' ? (
          <div style={{ marginTop: '5px' }}>
            <p style={{ margin: '0 0 10px 0' }}>You are rendering the <em>React Remote Subpage</em>!</p>
            <button onClick={() => navigateTo('/react-remote')}>Back to Remote Home</button>
          </div>
        ) : (
          <div style={{ marginTop: '5px' }}>
            <p style={{ margin: '0 0 10px 0' }}>You are rendering the <em>React Remote Home</em>.</p>
            <button onClick={() => navigateTo('/react-remote/subpage')}>Go to Subpage</button>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: '15px' }}>
        v{pkg.version}
      </div>
    </div>
  )
}

export default App

import { useState, useEffect, useRef, useCallback } from 'react'

// --- Custom Hooks used in challenges ---

// Challenge 2: usePrevious hook
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

// Challenge 3: useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

// Challenge 6: useToggle hook
function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = () => setValue((v) => !v)
  return [value, toggle]
}

// Challenge 7: useClickOutside hook
function useClickOutside(ref: React.RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      callback()
    }
    document.addEventListener('mousedown', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [ref, callback])
}

// Challenge 9: useLocalStorage hook
function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// Challenge 10: useWindowSize hook
interface WindowSize {
  width: number
  height: number
}
function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

// Challenge 11: useTimeout hook
function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}

// Challenge 13: useArray hook
function useArray<T>(initialValue: T[]) {
  const [value, setValue] = useState<T[]>(initialValue)
  return {
    value,
    setValue,
    push: useCallback((item: T) => setValue(v => [...v, item]), []),
    filter: useCallback((callback: (value: T, index: number, array: T[]) => boolean) => setValue(v => v.filter(callback)), []),
    clear: useCallback(() => setValue([]), [])
  }
}

// Challenge 15: useEventListener hook
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window & typeof globalThis = window
) {
  const savedHandler = useRef(handler)
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: WindowEventMap[K]) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)
    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

// Challenge 16: useHover hook
function useHover<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const [value, setValue] = useState(false)
  const ref = useRef<T>(null)

  const handleMouseOver = () => setValue(true)
  const handleMouseOut = () => setValue(false)

  useEffect(() => {
    const node = ref.current
    if (node) {
      node.addEventListener('mouseenter', handleMouseOver)
      node.addEventListener('mouseleave', handleMouseOut)
      return () => {
        node.removeEventListener('mouseenter', handleMouseOver)
        node.removeEventListener('mouseleave', handleMouseOut)
      }
    }
  }, [ref.current])

  return [ref, value]
}

// Challenge 18: useIsMounted hook
function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])
  return useCallback(() => isMountedRef.current, [])
}

// Challenge 19: useThrottle hook
function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => clearTimeout(handler)
  }, [value, limit])

  return throttledValue
}

export default function F2FChallenges() {
  const [activeChallenge, setActiveChallenge] = useState<number>(1)
  const [mobileDetailActive, setMobileDetailActive] = useState(false)

  // --- States for Playgrounds ---
  // Challenge 1: Interval States
  const [buggyCount, setBuggyCount] = useState(0)
  const [fixedCount, setFixedCount] = useState(0)

  useEffect(() => {
    const intervalBug = setInterval(() => {
      setBuggyCount(buggyCount + 1)
    }, 1000)

    const intervalFixed = setInterval(() => {
      setFixedCount((c) => c + 1)
    }, 1000)

    return () => {
      clearInterval(intervalBug)
      clearInterval(intervalFixed)
    }
  }, [])

  // Challenge 2: usePrevious States
  const [tempText, setTempText] = useState('')
  const prevText = usePrevious(tempText)

  // Challenge 3: Debounce States
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [apiLogs, setApiLogs] = useState<string[]>([])

  useEffect(() => {
    if (debouncedSearch) {
      setApiLogs((prev) => [`[${new Date().toLocaleTimeString()}] Fetch API triggered for: "${debouncedSearch}"`, ...prev.slice(0, 4)])
    }
  }, [debouncedSearch])

  // Challenge 4: Derived State Render Counter
  const [filterQuery, setFilterQuery] = useState('')
  const [renderCountEffect, setRenderCountEffect] = useState(0)
  const [renderCountDerived, setRenderCountDerived] = useState(0)
  const [effectFiltered, setEffectFiltered] = useState<string[]>([])
  
  const itemsList = ['Apple', 'Banana', 'Cherry', 'Dates', 'Elderberry']

  useEffect(() => {
    setEffectFiltered(itemsList.filter(item => item.toLowerCase().includes(filterQuery.toLowerCase())))
    setRenderCountEffect(c => c + 1)
  }, [filterQuery])

  const derivedFiltered = itemsList.filter(item => item.toLowerCase().includes(filterQuery.toLowerCase()))

  // Challenge 5: Keys Swap States
  const [isBusiness, setIsBusiness] = useState(false)

  // Challenge 6: Toggle States
  const [isToggled, toggleValue] = useToggle(false)

  // Challenge 7: Click Outside States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  // Challenge 8: Race Condition States
  const [userId, setUserId] = useState<number | null>(null)
  const [profileBuggy, setProfileBuggy] = useState<string>('No User Loaded')
  const [profileFixed, setProfileFixed] = useState<string>('No User Loaded')


  const mockFetchUser = (id: number): Promise<string> => {
    const delays: Record<number, number> = { 1: 2000, 2: 500 }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Profile Data for User ID: ${id} (Resolved at ${new Date().toLocaleTimeString()})`)
      }, delays[id] || 1000)
    })
  }

  useEffect(() => {
    if (userId === null) return
    mockFetchUser(userId).then(data => {
      setProfileBuggy(data)
    })
  }, [userId])

  useEffect(() => {
    if (userId === null) return
    let active = true


    mockFetchUser(userId).then(data => {
      if (active) {
        setProfileFixed(data)
      }
    })

    return () => {
      active = false
    }
  }, [userId])

  // Challenge 9: LocalStorage States
  const [savedText, setSavedText] = useLocalStorage('f2f-saved-text', '')

  // Challenge 10: Window Size State
  const windowSize = useWindowSize()

  // Challenge 11: useTimeout States
  const [timeoutVisible, setTimeoutVisible] = useState(false)
  const [timeoutDelay, setTimeoutDelay] = useState<number | null>(null)
  useTimeout(() => {
    setTimeoutVisible(true)
    setTimeoutDelay(null)
  }, timeoutDelay)

  // Challenge 12: useFetch States
  const [fetchData, setFetchData] = useState<any>(null)
  const [fetchLoading, setFetchLoading] = useState(false)
  const handleFetch = () => {
    setFetchLoading(true)
    setTimeout(() => {
      setFetchData({ id: 101, name: 'Sagar Gudka', role: 'Principal Engineer' })
      setFetchLoading(false)
    }, 1000)
  }

  // Challenge 13: useArray States
  const listItems = useArray<string>(['Alpha', 'Beta'])

  // Challenge 14: Debounce Callback States
  const [cbLogs, setCbLogs] = useState<string[]>([])
  const [rawClicks, setRawClicks] = useState(0)
  
  // Custom debounced function simulation
  const timerRef = useRef<any>(null)
  const handleDebouncedClick = () => {
    setRawClicks(c => c + 1)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setCbLogs(prev => [`Fired API action! (Clicks raw: ${rawClicks + 1})`, ...prev.slice(0, 3)])
    }, 600)
  }

  // Challenge 15: useEventListener States
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('None')
  useEventListener('keydown', (e) => {
    setLastKeyPressed(e.key)
  })

  // Challenge 16: useHover States
  const [hoverRef, isHovered] = useHover<HTMLDivElement>()

  // Challenge 17: useForm States
  const [formData, setFormData] = useState({ username: '', email: '' })
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Challenge 18: useIsMounted States
  const isMounted = useIsMounted()
  const [mountStatus, setMountStatus] = useState('Idle')
  const handleMountTest = () => {
    setMountStatus('Testing mount in 2s...')
    setTimeout(() => {
      if (isMounted()) {
        setMountStatus('Resolved safely! Component is mounted.')
      }
    }, 2000)
  }

  // Challenge 19: useThrottle States
  const [throttleInput, setThrottleInput] = useState(50)
  const throttledVal = useThrottle(throttleInput, 1000)

  // Challenge 20: useLockBodyScroll States
  const [scrollLocked, setScrollLocked] = useState(false)
  useEffect(() => {
    if (scrollLocked) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [scrollLocked])

  return (
    <div className="f2f-split-grid">
      
      {/* Left List of Challenges */}
      <div 
        className={mobileDetailActive ? 'hide-on-mobile' : ''} 
        style={{ background: '#131217', border: '1px solid #2e2c35', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}
      >
        <h3 style={{ color: '#aa3bff', margin: '5px 10px 15px 10px' }}>F2F Coding Tasks</h3>
        {[
          { id: 1, title: '1. Stale Closure Interval', desc: 'useEffect closure bug' },
          { id: 2, title: '2. Custom usePrevious Hook', desc: 'useRef render timing' },
          { id: 3, title: '3. Debounced Search Input', desc: 'Timer garbage collection' },
          { id: 4, title: '4. Derived State vs Effects', desc: 'Optimizing renders' },
          { id: 5, title: '5. Key Prop State Swap', desc: 'DOM element reuse bug' },
          { id: 6, title: '6. Custom useToggle Hook', desc: 'Simple state toggler' },
          { id: 7, title: '7. Custom useClickOutside', desc: 'Ref interaction listener' },
          { id: 8, title: '8. Async Race Conditions', desc: 'Cleanups for dynamic fetches' },
          { id: 9, title: '9. Custom useLocalStorage', desc: 'Sync state with Storage' },
          { id: 10, title: '10. Custom useWindowSize', desc: 'Listen to resize events' },
          { id: 11, title: '11. Custom useTimeout Hook', desc: 'Manage delayed tasks' },
          { id: 12, title: '12. Custom useFetch Hook', desc: 'HTTP request hook state' },
          { id: 13, title: '13. Custom useArray Hook', desc: 'Wrap push/filter utilities' },
          { id: 14, title: '14. Debounced Callback', desc: 'Throttle trigger actions' },
          { id: 15, title: '15. Custom useEventListener', desc: 'Attach event cleanups' },
          { id: 16, title: '16. Custom useHover Hook', desc: 'Track cursor interaction' },
          { id: 17, title: '17. Custom useForm Handler', desc: 'Manage input structures' },
          { id: 18, title: '18. Custom useIsMounted', desc: 'Safely execute async state' },
          { id: 19, title: '19. Custom useThrottle Hook', desc: 'Cap update rates' },
          { id: 20, title: '20. useLockBodyScroll', desc: 'Manage DOM body overflows' }
        ].map((task) => (
          <div 
            key={task.id}
            onClick={() => {
              setActiveChallenge(task.id)
              setMobileDetailActive(true)
            }}
            style={{
              padding: '12px',
              background: activeChallenge === task.id ? 'rgba(170, 59, 255, 0.15)' : '#1c1b22',
              border: activeChallenge === task.id ? '1px solid #aa3bff' : '1px solid #2e2c35',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff' }}>{task.title}</div>
            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>{task.desc}</div>
          </div>
        ))}
      </div>

      {/* Right Side Details/Playground */}
      <div 
        className={!mobileDetailActive ? 'hide-on-mobile' : ''} 
        style={{ background: '#1c1b22', border: '1px solid #2e2c35', borderRadius: '8px', padding: '25px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column' }}
      >
        {/* Mobile Back Button */}
        <button 
          className="show-only-on-mobile"
          onClick={() => setMobileDetailActive(false)}
          style={{
            alignSelf: 'flex-start',
            marginBottom: '15px',
            background: '#333',
            border: 'none',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Challenges
        </button>
        
        {activeChallenge === 1 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 1: Stale Closure Interval</h2>
            <p><strong>The Challenge:</strong> Implement a count updater using <code>setInterval</code> inside a <code>useEffect</code> that increments correctly without memory leaks or stale captures.</p>
            
            <div style={{ display: 'flex', gap: '20px', background: '#131217', padding: '15px', borderRadius: '8px', margin: '15px 0', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: 'red', margin: '0 0 8px 0' }}>Buggy implementation</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{buggyCount}</div>
                <p style={{ fontSize: '0.8rem', color: '#888', margin: '5px 0 0 0' }}>(Stuck at 1 due to closure capture)</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h4 style={{ color: '#42b983', margin: '0 0 8px 0' }}>Fixed implementation</h4>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{fixedCount}</div>
                <p style={{ fontSize: '0.8rem', color: '#888', margin: '5px 0 0 0' }}>(Functional update state sync)</p>
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 2 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 2: Custom usePrevious Hook</h2>
            <p><strong>The Challenge:</strong> Write a custom hook that returns the value of a state or prop from the <em>previous</em> render cycle.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <label>Type here: </label>
              <input 
                type="text" 
                value={tempText} 
                onChange={(e) => setTempText(e.target.value)} 
                placeholder="Type dynamic text..."
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#1f1f1f', color: '#fff', marginLeft: '10px' }}
              />
              <div style={{ marginTop: '15px' }}>
                <p><strong>Current State:</strong> <code style={{ color: '#fff' }}>"{tempText}"</code></p>
                <p><strong>Previous Render State:</strong> <code style={{ color: '#ff4e50' }}>"{prevText || ''}"</code></p>
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 3 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 3: Debounced Search Input</h2>
            <p><strong>The Challenge:</strong> Implement a debounced search input to avoid triggering excessive API fetches on every keystroke.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <label>Search Input: </label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Type quickly..."
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#1f1f1f', color: '#fff', marginLeft: '10px', width: '250px' }}
              />
              <div style={{ marginTop: '15px' }}>
                <p><strong>Debounced value:</strong> <code style={{ color: '#42b983' }}>"{debouncedSearch}"</code></p>
                <h5 style={{ margin: '10px 0 5px 0', color: '#999' }}>API Dispatch Logs:</h5>
                <div style={{ background: '#0e0d12', padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  {apiLogs.length === 0 ? <p style={{ margin: '0', color: '#555' }}>Waiting for input stops...</p> : apiLogs.map((log, index) => (
                    <div key={index} style={{ color: '#a0a0a0', marginBottom: '4px' }}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 4 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 4: Derived State vs Effects</h2>
            <p><strong>The Challenge:</strong> Compute filtered lists efficiently without triggering extra React render cycles.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <label>Filter list: </label>
              <input 
                type="text" 
                value={filterQuery} 
                onChange={(e) => {
                  setFilterQuery(e.target.value)
                  setRenderCountDerived(c => c + 1)
                }} 
                placeholder="Type 'a' or 'b'..."
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #444', background: '#1f1f1f', color: '#fff', marginLeft: '10px' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                <div style={{ border: '1px solid #444', padding: '10px', borderRadius: '4px' }}>
                  <h5 style={{ color: 'red', margin: '0 0 5px 0' }}>Using useEffect state</h5>
                  <p style={{ margin: '0 0 8px 0' }}>Renders triggered: <strong style={{ color: 'red' }}>{renderCountEffect}</strong></p>
                  <p style={{ fontSize: '0.85rem', color: '#777', margin: '0' }}>Matches: {effectFiltered.join(', ')}</p>
                </div>
                <div style={{ border: '1px solid #444', padding: '10px', borderRadius: '4px' }}>
                  <h5 style={{ color: '#42b983', margin: '0 0 5px 0' }}>Using Derived Render</h5>
                  <p style={{ margin: '0 0 8px 0' }}>Renders triggered: <strong style={{ color: '#42b983' }}>{renderCountDerived}</strong></p>
                  <p style={{ fontSize: '0.85rem', color: '#777', margin: '0' }}>Matches: {derivedFiltered.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 5 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 5: Key Prop State Swap</h2>
            <p><strong>The Challenge:</strong> Fix the bug where typed values leak between different inputs when toggling conditional UI structures.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <div style={{ marginBottom: '10px' }}>
                <input 
                  type="checkbox" 
                  id="swap-chk" 
                  checked={isBusiness} 
                  onChange={(e) => setIsBusiness(e.target.checked)} 
                />
                <label htmlFor="swap-chk" style={{ marginLeft: '8px' }}>Toggle Business Profile Input</label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ border: '1px dashed red', padding: '10px', borderRadius: '4px' }}>
                  <h5 style={{ color: 'red', margin: '0 0 8px 0' }}>Without Keys (Leaks State)</h5>
                  {isBusiness ? (
                    <div>
                      <label style={{ fontSize: '0.8rem' }}>Business Name: </label>
                      <input style={{ color: '#000', padding: '4px' }} type="text" placeholder="e.g. Acme Corp" />
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.8rem' }}>Personal Name: </label>
                      <input style={{ color: '#000', padding: '4px' }} type="text" placeholder="e.g. John Doe" />
                    </div>
                  )}
                </div>

                <div style={{ border: '1px dashed #42b983', padding: '10px', borderRadius: '4px' }}>
                  <h5 style={{ color: '#42b983', margin: '0 0 8px 0' }}>With Keys (Correctly Resets)</h5>
                  {isBusiness ? (
                    <div>
                      <label style={{ fontSize: '0.8rem' }}>Business Name: </label>
                      <input key="business" style={{ color: '#000', padding: '4px' }} type="text" placeholder="e.g. Acme Corp" />
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontSize: '0.8rem' }}>Personal Name: </label>
                      <input key="personal" style={{ color: '#000', padding: '4px' }} type="text" placeholder="e.g. John Doe" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 6 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 6: Custom useToggle Hook</h2>
            <p><strong>State is currently:</strong> <strong style={{ color: isToggled ? '#42b983' : '#ff4e50' }}>{isToggled ? 'ON' : 'OFF'}</strong></p>
            <button onClick={toggleValue} style={{ padding: '8px 16px', background: '#aa3bff', color: '#fff', border: 'none', borderRadius: '4px' }}>Toggle</button>
          </div>
        )}

        {activeChallenge === 7 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 7: Custom useClickOutside</h2>
            <div ref={dropdownRef} style={{ display: 'inline-block' }}>
              <button onClick={() => setIsDropdownOpen(p => !p)} style={{ background: '#aa3bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
                {isDropdownOpen ? 'Click Outside Me' : 'Open Menu'}
              </button>
              {isDropdownOpen && (
                <div style={{ border: '1px solid #444', padding: '10px', background: '#131217', marginTop: '5px' }}>
                  Dropdown Active content click outside to dismiss.
                </div>
              )}
            </div>
          </div>
        )}

        {activeChallenge === 8 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 8: Async Race Conditions</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setUserId(1)} style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff' }}>Load User 1 (Slow)</button>
              <button onClick={() => setUserId(2)} style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff' }}>Load User 2 (Fast)</button>
            </div>
            <p>Buggy Data: <code>{profileBuggy}</code></p>
            <p>Fixed Data: <code>{profileFixed}</code></p>
          </div>
        )}

        {activeChallenge === 9 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 9: Custom useLocalStorage</h2>
            <input 
              type="text" 
              value={savedText} 
              onChange={(e) => setSavedText(e.target.value)} 
              placeholder="Sync details..."
              style={{ padding: '6px', background: '#1f1f1f', color: '#fff', border: '1px solid #444' }}
            />
            <p>Stored: <code>{savedText}</code></p>
          </div>
        )}

        {activeChallenge === 10 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 10: Custom useWindowSize</h2>
            <p>Dimensions: <strong>{windowSize.width}px x {windowSize.height}px</strong></p>
          </div>
        )}

        {activeChallenge === 11 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 11: Custom useTimeout Hook</h2>
            <p><strong>The Challenge:</strong> Implement a declarative useTimeout hook that sets up a timeout and handles cleanup automatically when components unmount.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <button 
                onClick={() => {
                  setTimeoutVisible(false)
                  setTimeoutDelay(1500)
                }} 
                style={{ background: '#aa3bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
              >
                Trigger 1.5s Delay Message
              </button>
              <p style={{ marginTop: '15px' }}>
                Status: {timeoutDelay ? <strong style={{ color: '#ff4e50' }}>Waiting...</strong> : timeoutVisible ? <strong style={{ color: '#42b983' }}>Visible! Hook triggered callback.</strong> : 'Idle'}
              </p>
            </div>

            <h4>The Solution:</h4>
            <pre style={{ background: '#0e0d12', padding: '15px', borderRadius: '6px', overflowX: 'auto', border: '1px solid #2e2c35' }}>
              <code style={{ color: '#42b983', fontFamily: 'monospace' }}>{`function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
}`}</code>
            </pre>
          </div>
        )}

        {activeChallenge === 12 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 12: Custom useFetch Hook</h2>
            <p><strong>The Challenge:</strong> Write a custom hook that manages loading states, parsed data responses, and errors for fetch API requests.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <button onClick={handleFetch} style={{ background: '#aa3bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
                Fetch API User Info
              </button>
              <div style={{ marginTop: '15px' }}>
                {fetchLoading ? <p>Loading data...</p> : fetchData ? (
                  <pre style={{ background: '#000', padding: '10px' }}><code>{JSON.stringify(fetchData, null, 2)}</code></pre>
                ) : <p style={{ color: '#666' }}>No requests fired yet.</p>}
              </div>
            </div>

            <h4>The Solution:</h4>
            <pre style={{ background: '#0e0d12', padding: '15px', borderRadius: '6px', overflowX: 'auto', border: '1px solid #2e2c35' }}>
              <code style={{ color: '#42b983', fontFamily: 'monospace' }}>{`function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(url)
      .then(res => res.json())
      .then(resData => { if (active) setData(resData); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url]);

  return { data, loading };
}`}</code>
            </pre>
          </div>
        )}

        {activeChallenge === 13 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 13: Custom useArray Hook</h2>
            <p><strong>The Challenge:</strong> Create a hook that wraps array state mutations (pushing, filtering, clearing) to simplify list manipulation logic.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button onClick={() => listItems.push('Item-' + (listItems.value.length + 1))} style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff' }}>Push Item</button>
                <button onClick={() => listItems.filter((_, idx) => idx % 2 === 0)} style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff' }}>Keep Even Indexes</button>
                <button onClick={listItems.clear} style={{ padding: '6px 12px', background: '#222', border: 'none', color: '#fff' }}>Clear All</button>
              </div>
              <p>Current Array: <strong>{JSON.stringify(listItems.value)}</strong></p>
            </div>

            <h4>The Solution:</h4>
            <pre style={{ background: '#0e0d12', padding: '15px', borderRadius: '6px', overflowX: 'auto', border: '1px solid #2e2c35' }}>
              <code style={{ color: '#42b983', fontFamily: 'monospace' }}>{`function useArray<T>(initialValue: T[]) {
  const [value, setValue] = useState<T[]>(initialValue);
  return {
    value,
    setValue,
    push: useCallback((item: T) => setValue(v => [...v, item]), []),
    filter: useCallback((cb) => setValue(v => v.filter(cb)), []),
    clear: useCallback(() => setValue([]), [])
  };
}`}</code>
            </pre>
          </div>
        )}

        {activeChallenge === 14 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 14: Debounced Callback</h2>
            <p><strong>The Challenge:</strong> Debounce a function callback trigger itself, ensuring that it is executed only after inactivity.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <button onClick={handleDebouncedClick} style={{ background: '#aa3bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px' }}>
                Click Rapidly (API Trigger)
              </button>
              <p style={{ marginTop: '10px' }}>Total keystroke clicks: <strong>{rawClicks}</strong></p>
              <h5 style={{ margin: '10px 0 5px 0', color: '#777' }}>Fired actions console:</h5>
              <div style={{ background: '#000', padding: '8px', fontSize: '0.85rem' }}>
                {cbLogs.length === 0 ? 'No actions fired yet...' : cbLogs.map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 15 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 15: Custom useEventListener Hook</h2>
            <p><strong>The Challenge:</strong> Create a hook that simplifies adding and cleanup of event listeners on the window or custom element nodes.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0', textAlign: 'center' }}>
              <p>Type any character on your keyboard:</p>
              <div style={{ color: '#42b983', fontSize: '2rem', fontWeight: 'bold' }}>
                "{lastKeyPressed}"
              </div>
            </div>

            <h4>The Solution:</h4>
            <pre style={{ background: '#0e0d12', padding: '15px', borderRadius: '6px', overflowX: 'auto', border: '1px solid #2e2c35' }}>
              <code style={{ color: '#42b983', fontFamily: 'monospace' }}>{`function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);
  useEffect(() => { savedHandler.current = handler; }, [handler]);

  useEffect(() => {
    const listener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, listener);
    return () => element.removeEventListener(eventName, listener);
  }, [eventName, element]);
}`}</code>
            </pre>
          </div>
        )}

        {activeChallenge === 16 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 16: Custom useHover Hook</h2>
            <p><strong>The Challenge:</strong> Detect cursor hover states on elements programmatically without relying on CSS styling hooks.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0', textAlign: 'center' }}>
              <div 
                ref={hoverRef} 
                style={{ 
                  display: 'inline-block', 
                  padding: '30px', 
                  background: isHovered ? '#42b983' : '#aa3bff', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background 0.2s'
                }}
              >
                {isHovered ? 'Hovering!' : 'Hover mouse over me'}
              </div>
            </div>
          </div>
        )}

        {activeChallenge === 17 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 17: Custom useForm Handler</h2>
            <p><strong>The Challenge:</strong> Build a custom hook to manage field inputs binding and state changes in HTML forms.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <div style={{ marginBottom: '10px' }}>
                <label>Username: </label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleFormChange} 
                  style={{ color: '#000', padding: '4px' }}
                />
              </div>
              <div>
                <label>Email: </label>
                <input 
                  type="text" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleFormChange} 
                  style={{ color: '#000', padding: '4px' }}
                />
              </div>
              <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Bound Value: {JSON.stringify(formData)}</p>
            </div>
          </div>
        )}

        {activeChallenge === 18 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 18: Custom useIsMounted</h2>
            <p><strong>The Challenge:</strong> Prevent React memory leak warnings by checking if components are mounted before setting state in async resolver functions.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <button onClick={handleMountTest} style={{ background: '#aa3bff', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
                Run Async Mount Test
              </button>
              <p style={{ marginTop: '10px' }}>Result: <strong>{mountStatus}</strong></p>
            </div>
          </div>
        )}

        {activeChallenge === 19 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 19: Custom useThrottle Hook</h2>
            <p><strong>The Challenge:</strong> Cap the rate at which value changes update downstream child components (e.g. range sliders).</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={throttleInput} 
                onChange={(e) => setThrottleInput(Number(e.target.value))} 
                style={{ width: '200px' }}
              />
              <p>Raw Slider Value: <strong>{throttleInput}</strong></p>
              <p>Throttled Hook Value (1s cap): <strong style={{ color: '#42b983' }}>{throttledVal}</strong></p>
            </div>
          </div>
        )}

        {activeChallenge === 20 && (
          <div>
            <h2 style={{ color: '#ff4e50', margin: '0 0 15px 0' }}>Challenge 20: useLockBodyScroll</h2>
            <p><strong>The Challenge:</strong> Temporarily lock document body scrolling when overlay panels are active to prevent double scrollbars.</p>
            
            <div style={{ background: '#131217', padding: '20px', borderRadius: '8px', margin: '15px 0' }}>
              <input 
                type="checkbox" 
                id="lock-body-check" 
                checked={scrollLocked} 
                onChange={(e) => setScrollLocked(e.target.checked)} 
              />
              <label htmlFor="lock-body-check" style={{ marginLeft: '8px' }}>Toggle Body Scroll Lock (overflow: hidden)</label>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '10px' }}>Active scroll status: {scrollLocked ? <strong style={{ color: '#ff4e50' }}>LOCKED</strong> : 'NORMAL'}</p>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}

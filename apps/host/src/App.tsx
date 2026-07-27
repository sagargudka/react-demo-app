import { useState, useEffect } from 'react'
import { useAppStore } from './store'
import ErrorBoundary from './components/ErrorBoundary'
import F2FChallenges from './components/F2FChallenges'
import { SessionNotes } from './SessionNotes'
import pkg from '../package.json'

interface QuestionItem {
  id: string
  category: string
  question: string
  snippet: string | null
  answer: string
}

function App() {
  const { message, updateMessage } = useAppStore()
  const [localData, setLocalData] = useState(localStorage.getItem('shared-local-data') || '')
  const [loadingRemotes, setLoadingRemotes] = useState(true)
  const [failedRemotes, setFailedRemotes] = useState<Record<string, boolean>>({})
  const getSubPath = (pathname: string) => {
    const base = import.meta.env.BASE_URL || '/'
    if (base !== '/' && pathname.startsWith(base)) {
      const sub = pathname.slice(base.length)
      return sub.startsWith('/') ? sub : '/' + sub
    }
    return pathname
  }

  const getFullPath = (path: string) => {
    const base = import.meta.env.BASE_URL || '/'
    if (base === '/') return path
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
    const cleanPath = path.startsWith('/') ? path : '/' + path
    return cleanBase + cleanPath
  }

  const [currentPath, setCurrentPath] = useState(getSubPath(window.location.pathname))

  // Interview Questions states
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [mfeSubTab, setMfeSubTab] = useState<'demo' | 'questions'>('demo')
  const [mobileDetailActive, setMobileDetailActive] = useState(false)

  useEffect(() => {
    let active = true
    const scripts: HTMLScriptElement[] = []

    // Fetch the version/import map config dynamically
    fetch(`${import.meta.env.BASE_URL || '/'}import-map.json`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return

        const remotes = data.remotes || {}
        
        // Dynamically load remote scripts based on URLs from the import map
        Object.entries(remotes).forEach(([name, url]) => {
          const script = document.createElement('script')
          script.src = url as string
          script.type = 'module'
          script.dataset.name = name
          script.onerror = () => {
            setFailedRemotes((prev) => ({ ...prev, [name]: true }))
          }
          document.body.appendChild(script)
          scripts.push(script)
        })
        
        setLoadingRemotes(false)
      })
      .catch((err) => {
        console.error('Failed to load import map:', err)
      })

    // Routing coordination event listeners
    const handlePopState = () => {
      setCurrentPath(getSubPath(window.location.pathname))
    }
    const handleShellNavigation = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      const newPath = customEvent.detail
      window.history.pushState(null, '', getFullPath(newPath))
      setCurrentPath(getSubPath(newPath))
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('shell:navigate', handleShellNavigation)

    const handleStorageChange = () => {
      setLocalData(localStorage.getItem('shared-local-data') || '')
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      active = false
      scripts.forEach((script) => {
        if (document.body.contains(script)) {
          document.body.removeChild(script)
        }
      })
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('shell:navigate', handleShellNavigation)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Load questions based on current route path
  useEffect(() => {
    let dataUrl = ''
    const base = import.meta.env.BASE_URL || '/'
    if (currentPath === '/microfrontend' || currentPath === '/') {
      dataUrl = `${base}data/microfrontend.json`
    } else if (currentPath === '/react-learnings') {
      dataUrl = `${base}data/react.json`
    } else if (currentPath === '/frontend-learnings') {
      dataUrl = `${base}data/frontend.json`
    } else if (currentPath === '/react-testing') {
      dataUrl = `${base}data/testing.json`
    } else if (currentPath === '/aws') {
      dataUrl = `${base}data/aws.json`
    } else if (currentPath === '/system-design') {
      dataUrl = `${base}data/system-design.json`
    }

    if (dataUrl) {
      setQuestions([])
      setSearchQuery('')
      setSelectedCategory('All')
      setSelectedQuestionId(null)
      setShowAnswer(false)
      setMobileDetailActive(false)
      fetch(dataUrl)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setQuestions(data)
            if (data.length > 0) {
              setSelectedQuestionId(data[0].id)
            }
          } else {
            setQuestions([])
          }
        })
        .catch((err) => console.error('Failed to load question bank:', err))
    }
  }, [currentPath])

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', getFullPath(path))
    setCurrentPath(path)
  }

  const updateLocalStorage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    localStorage.setItem('shared-local-data', val)
    setLocalData(val)
    window.dispatchEvent(new Event('storage'))
  }

  // Filter questions by search and category
  const categories = ['All', ...Array.from(new Set(questions.map((q) => q.category)))]
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Selected Question Reference
  const selectedIndex = filteredQuestions.findIndex((q) => q.id === selectedQuestionId)
  const currentQuestion = selectedIndex !== -1 ? filteredQuestions[selectedIndex] : null

  // Keep selected ID valid if filters change
  useEffect(() => {
    if (filteredQuestions.length > 0 && selectedIndex === -1) {
      setSelectedQuestionId(filteredQuestions[0].id)
      setShowAnswer(false)
    }
  }, [filteredQuestions, selectedIndex])

  const handleNext = () => {
    if (selectedIndex < filteredQuestions.length - 1) {
      setSelectedQuestionId(filteredQuestions[selectedIndex + 1].id)
      setShowAnswer(false)
    }
  }

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedQuestionId(filteredQuestions[selectedIndex - 1].id)
      setShowAnswer(false)
    }
  }

  const isMfeRoute = (currentPath === '/' || currentPath === '/microfrontend') && mfeSubTab === 'demo'
  const isQuestionRoute = currentPath === '/react-learnings' || currentPath === '/frontend-learnings' || currentPath === '/react-testing' || currentPath === '/aws' || currentPath === '/system-design' || ((currentPath === '/microfrontend' || currentPath === '/') && mfeSubTab === 'questions')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: '1200px', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* Navigation Bar */}
      <nav style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '10px', background: '#333', borderRadius: '8px' }}>
        <button onClick={() => navigateTo('/')} style={{ background: (currentPath === '/' || currentPath === '/microfrontend') ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>Microfrontend</button>
        <button onClick={() => navigateTo('/react-learnings')} style={{ background: currentPath === '/react-learnings' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>React Learnings</button>
        <button onClick={() => navigateTo('/frontend-learnings')} style={{ background: currentPath === '/frontend-learnings' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>Frontend Learnings</button>
        <button onClick={() => navigateTo('/react-testing')} style={{ background: currentPath === '/react-testing' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>React Testing</button>
        <button onClick={() => navigateTo('/aws')} style={{ background: currentPath === '/aws' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>AWS</button>
        <button onClick={() => navigateTo('/system-design')} style={{ background: currentPath === '/system-design' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>System Design</button>
        <button onClick={() => navigateTo('/f2f-challenges')} style={{ background: currentPath === '/f2f-challenges' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>F2F Coding</button>
        <button onClick={() => navigateTo('/session-notes')} style={{ background: currentPath === '/session-notes' ? '#aa3bff' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 16px', borderRadius: '4px' }}>Session Notes</button>
      </nav>

      {/* Subtabs for Microfrontend Route */}
      {(currentPath === '/' || currentPath === '/microfrontend') && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => setMfeSubTab('demo')} 
            style={{ 
              background: mfeSubTab === 'demo' ? '#aa3bff' : '#222', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              padding: '6px 12px', 
              borderRadius: '4px' 
            }}
          >
            Demo
          </button>
          <button 
            onClick={() => setMfeSubTab('questions')} 
            style={{ 
              background: mfeSubTab === 'questions' ? '#aa3bff' : '#222', 
              border: 'none', 
              color: '#fff', 
              cursor: 'pointer', 
              padding: '6px 12px', 
              borderRadius: '4px' 
            }}
          >
            Questions
          </button>
        </div>
      )}

      {/* Main State Card */}
      {isMfeRoute && (
        <div style={{ border: '2px solid #555', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>Host App State (Zustand)</h2>
          <p><strong>Current Message:</strong> {message}</p>
          <p><strong>Current Browser Route:</strong> <code>{currentPath}</code></p>
          <button onClick={() => updateMessage('Updated by Host App!')}>
            Set Message to "Updated by Host App!"
          </button>

          <div style={{ marginTop: '20px' }}>
            <label><strong>Shared LocalStorage Data:</strong> </label>
            <input 
              type="text" 
              value={localData} 
              onChange={updateLocalStorage}
              placeholder="Type to sync with remotes..."
              style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', color: '#000', marginLeft: '5px' }}
            />
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#888', marginTop: '15px' }}>
            v{pkg.version}
          </div>
        </div>
      )}

      {loadingRemotes ? (
        <p style={{ textAlign: 'center' }}>Loading micro-frontends from import map...</p>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Demo Page Content (renders both remotes side-by-side) */}
          {(currentPath === '/' || currentPath === '/microfrontend') && mfeSubTab === 'demo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minHeight: 0 }}>
              <div style={{ padding: '15px', background: '#1f1f1f', borderRadius: '8px', textAlign: 'center' }}>
                <h3>Welcome to the Micro-Frontend Monorepo Demo!</h3>
                <p>Both micro-frontends (React and Vue remotes) are dynamically loaded from their dev servers and mounted inside the host shell below.</p>
              </div>
              <div className="responsive-mfe-grid">
                <div>
                  {failedRemotes['mfe-react'] ? (
                    <div style={{ border: '2px dashed red', padding: '15px', borderRadius: '8px', color: 'red', textAlign: 'center' }}>
                      <h3>React Remote Offline</h3>
                      <p>Failed to load source files</p>
                    </div>
                  ) : (
                    <ErrorBoundary fallback={
                      <div style={{ border: '2px dashed red', padding: '15px', borderRadius: '8px', color: 'red', textAlign: 'center' }}>
                        <h3>React Remote Crashed</h3>
                        <p>Runtime error occurred</p>
                      </div>
                    }>
                      <mfe-react></mfe-react>
                    </ErrorBoundary>
                  )}
                </div>
                <div>
                  {failedRemotes['mfe-vue'] ? (
                    <div style={{ border: '2px dashed red', padding: '15px', borderRadius: '8px', color: 'red', textAlign: 'center' }}>
                      <h3>Vue Remote Offline</h3>
                      <p>Failed to load source files</p>
                    </div>
                  ) : (
                    <ErrorBoundary fallback={
                      <div style={{ border: '2px dashed red', padding: '15px', borderRadius: '8px', color: 'red', textAlign: 'center' }}>
                        <h3>Vue Remote Crashed</h3>
                        <p>Runtime error occurred</p>
                      </div>
                    }>
                      <mfe-vue></mfe-vue>
                    </ErrorBoundary>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* F2F Challenges Page */}
          {currentPath === '/f2f-challenges' && (
            <F2FChallenges />
          )}

          {/* Session Notes Page */}
          {currentPath === '/session-notes' && (
            <SessionNotes />
          )}

          {/* Interactive Question Database Router */}
          {isQuestionRoute && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <h2 style={{ textAlign: 'center', color: '#aa3bff', marginBottom: '20px' }}>
                {currentPath === '/system-design' ? 'System Design (HLD & LLD)' : currentPath === '/aws' ? 'AWS & Cloud Infrastructure' : currentPath === '/react-testing' ? 'React Testing' : currentPath === '/microfrontend' ? 'Micro-Frontend' : currentPath === '/react-learnings' ? 'React' : 'Frontend'} Interview Prep ({questions.length} Questions)
              </h2>

              {/* Filters & Search */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  style={{ padding: '8px 12px', width: '300px', borderRadius: '6px', border: '1px solid #444', background: '#1f1f1f', color: '#fff' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categories.map((cat) => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: selectedCategory === cat ? '#aa3bff' : '#222',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Layout: Left side questions, Right side detailed card */}
              <div className="responsive-split-grid">
                
                {/* Left Side: Question List */}
                <div 
                  className={mobileDetailActive ? 'hide-on-mobile' : ''} 
                  style={{ background: '#131217', border: '1px solid #2e2c35', borderRadius: '8px', padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  {filteredQuestions.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#777', marginTop: '20px' }}>No matches found</p>
                  ) : (
                    filteredQuestions.map((q) => (
                      <div 
                        key={q.id}
                        onClick={() => {
                          setSelectedQuestionId(q.id)
                          setShowAnswer(false)
                          setMobileDetailActive(true)
                        }}
                        style={{
                          padding: '12px',
                          background: selectedQuestionId === q.id ? 'rgba(170, 59, 255, 0.15)' : '#1c1b22',
                          border: selectedQuestionId === q.id ? '1px solid #aa3bff' : '1px solid #2e2c35',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#fff', marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {q.question}
                        </div>
                        {/* Topic Chip (formerly red category text) */}
                        <span style={{ display: 'inline-block', fontSize: '0.75rem', background: '#352144', color: '#ff8484', padding: '2px 8px', borderRadius: '12px' }}>
                          {q.category}
                        </span>

                        {/* Remove redundant inline accordion from mobile */}
                      </div>
                    ))
                  )}
                </div>

                {/* Right Side: Detailed Card */}
                <div 
                  className={!mobileDetailActive ? 'hide-on-mobile' : ''} 
                  style={{ background: '#1c1b22', border: '1px solid #2e2c35', borderRadius: '8px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}
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
                    ← Back to Questions
                  </button>
                  
                  {currentQuestion ? (
                    <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.85rem', background: '#251a3a', color: '#c084fc', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {currentQuestion.category}
                      </span>
                      <h2 style={{ color: '#fff', marginTop: '15px', marginBottom: '20px', lineHeight: '1.4' }}>
                        {currentQuestion.question}
                      </h2>
                      
                      <div style={{ minHeight: '120px', marginBottom: '20px' }}>
                        {showAnswer ? (
                          <div>
                            <h4 style={{ color: '#42b983', margin: '0 0 10px 0' }}>Answer:</h4>
                            <p style={{ lineHeight: '1.6', color: '#e0e0e0', whiteSpace: 'pre-line' }}>{currentQuestion.answer}</p>
                            
                            {currentQuestion.snippet && (
                              <pre style={{ background: '#0e0d12', padding: '15px', borderRadius: '6px', overflowX: 'auto', border: '1px solid #2e2c35', marginTop: '15px' }}>
                                <code style={{ fontFamily: 'monospace', color: '#42b983', fontSize: '0.9rem' }}>{currentQuestion.snippet}</code>
                              </pre>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#131217', borderRadius: '8px', border: '1px dashed #444', minHeight: '150px' }}>
                            <button 
                              onClick={() => setShowAnswer(true)}
                              style={{
                                padding: '10px 20px',
                                background: '#aa3bff',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '1rem'
                              }}
                            >
                              Show Answer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', color: '#777' }}>
                      Select a question from the left sidebar to begin.
                    </div>
                  )}

                  {/* Navigation controls inside card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2e2c35', paddingTop: '15px', alignItems: 'center' }}>
                    <button 
                      onClick={handlePrev}
                      disabled={selectedIndex <= 0}
                      style={{
                        padding: '8px 16px',
                        background: '#222',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedIndex <= 0 ? 'not-allowed' : 'pointer',
                        opacity: selectedIndex <= 0 ? 0.4 : 1
                      }}
                    >
                      ← Prev
                    </button>
                    
                    <span style={{ color: '#777', fontSize: '0.9rem' }}>
                      Question {selectedIndex + 1} of {filteredQuestions.length}
                    </span>

                    <button 
                      onClick={handleNext}
                      disabled={selectedIndex >= filteredQuestions.length - 1}
                      style={{
                        padding: '8px 16px',
                        background: '#222',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: selectedIndex >= filteredQuestions.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: selectedIndex >= filteredQuestions.length - 1 ? 0.4 : 1
                      }}
                    >
                      Next →
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import styles from './index.css?inline'

class MfeReact extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })
    
    // Create and inject style tag
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    shadow.appendChild(styleTag)

    // Create and inject mount point inside shadow root
    const mountPoint = document.createElement('div')
    shadow.appendChild(mountPoint)

    const root = createRoot(mountPoint)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  }
}

if (!customElements.get('mfe-react')) {
  customElements.define('mfe-react', MfeReact)
}

// Standalone execution check (runs if loaded outside host)
const rootEl = document.getElementById('root')
if (rootEl && !rootEl.hasChildNodes()) {
  const root = createRoot(rootEl)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

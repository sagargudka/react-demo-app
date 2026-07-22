import { createApp } from 'vue'
import App from './App.vue'
import styles from './style.css?inline'

class MfeVue extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })

    // Create and inject style tag
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    shadow.appendChild(styleTag)

    // Create and inject mount point inside shadow root
    const mountPoint = document.createElement('div')
    shadow.appendChild(mountPoint)

    createApp(App).mount(mountPoint)
  }
}

if (!customElements.get('mfe-vue')) {
  customElements.define('mfe-vue', MfeVue)
}

// Standalone execution check
const appEl = document.getElementById('app')
if (appEl && !appEl.hasChildNodes()) {
  createApp(App).mount(appEl)
}

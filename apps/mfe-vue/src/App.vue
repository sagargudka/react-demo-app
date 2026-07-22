<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import pkg from '../package.json'

const version = pkg.version

const hostMessage = ref('No message received yet')
const localData = ref(localStorage.getItem('shared-local-data') || '')
const currentPath = ref(window.location.pathname)

const handleHostState = (e: Event) => {
  const customEvent = e as CustomEvent
  hostMessage.value = customEvent.detail || ''
}

const handleStorageChange = () => {
  localData.value = localStorage.getItem('shared-local-data') || ''
}

const handleRouteSync = () => {
  currentPath.value = window.location.pathname
}

onMounted(() => {
  window.addEventListener('host:state-change', handleHostState)
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('popstate', handleRouteSync)
  window.addEventListener('shell:navigate', handleRouteSync)
  window.dispatchEvent(new CustomEvent('remote:request-initial-state'))
})

onUnmounted(() => {
  window.removeEventListener('host:state-change', handleHostState)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('popstate', handleRouteSync)
  window.removeEventListener('shell:navigate', handleRouteSync)
})

const updateHostZustand = () => {
  window.dispatchEvent(
    new CustomEvent('remote:update-state', { detail: 'Updated by Vue Remote!' })
  )
}

const updateLocalStorage = (e: Event) => {
  const target = e.target as HTMLInputElement
  const val = target.value
  localStorage.setItem('shared-local-data', val)
  localData.value = val
  window.dispatchEvent(new Event('storage'))
}

const navigateTo = (path: string) => {
  window.dispatchEvent(new CustomEvent('shell:navigate', { detail: path }))
}
</script>

<template>
  <div class="vue-remote-card">
    <h3>Vue Remote Micro-Frontend</h3>
    <p><strong>Zustand Message (from Event):</strong> {{ hostMessage }}</p>
    <button @click="updateHostZustand">
      Update Host Zustand State
    </button>
    
    <div class="field-container">
      <label><strong>Shared LocalStorage Data:</strong> </label>
      <input 
        type="text" 
        :value="localData" 
        @input="updateLocalStorage"
        placeholder="Type here to sync..."
      />
    </div>

    <!-- Internal Routing Simulation -->
    <div class="mfe-routing">
      <strong>MFE Internal Route:</strong>
      <div v-if="currentPath === '/vue-remote/subpage'" class="route-view">
        <p>You are rendering the <em>Vue Remote Subpage</em>!</p>
        <button @click="navigateTo('/vue-remote')">Back to Remote Home</button>
      </div>
      <div v-else class="route-view">
        <p>You are rendering the <em>Vue Remote Home</em>.</p>
        <button @click="navigateTo('/vue-remote/subpage')">Go to Subpage</button>
      </div>
    </div>

    <div style="text-align: right; font-size: 0.8rem; color: #888; margin-top: 15px;">
      v{{ version }}
    </div>
  </div>
</template>

<style scoped>
.vue-remote-card {
  border: 2px dashed #42b983;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  color: #c9d1d9;
  background-color: #1f1f1f;
  text-align: center;
}
.vue-remote-card h3 {
  margin: 0 0 10px 0;
  color: #42b983;
}
.vue-remote-card button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  background-color: #35495e;
  color: #fff;
  cursor: pointer;
  transition: border-color 0.25s, transform 0.15s;
}
.vue-remote-card button:hover {
  border-color: #42b983;
}
.vue-remote-card button:active {
  transform: scale(0.98);
}
.field-container {
  margin-top: 15px;
}
.field-container input {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
  color: #000;
  margin-left: 5px;
}
.mfe-routing {
  margin-top: 15px;
  background: rgba(66, 185, 131, 0.05);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid rgba(66, 185, 131, 0.2);
  text-align: left;
}
.route-view {
  margin-top: 5px;
}
.route-view p {
  margin: 0 0 10px 0;
}

@media (prefers-color-scheme: light) {
  .vue-remote-card {
    color: #213547;
    background-color: #f9f9f9;
  }
}
</style>

# React & Vue Micro-Frontend Monorepo

This project is a monorepo setup implementing a Host application and two framework-agnostic Micro-Frontends (Remotes) using custom elements (Web Components).

## Monorepo Structure

* **[apps/host](file:///home/sagar/rebase/react-demo-app/apps/host)** (Port `3000`): React Shell/Host application. It manages the central state using **Zustand** and orchestrates mounting the remotes.
* **[apps/mfe-react](file:///home/sagar/rebase/react-demo-app/apps/mfe-react)** (Port `3001`): React remote micro-frontend.
* **[apps/mfe-vue](file:///home/sagar/rebase/react-demo-app/apps/mfe-vue)** (Port `3002`): Vue remote micro-frontend.

---

## Communication Capabilities

This workspace demonstrates two communication techniques:

### 1. Decoupled Zustand State Sync (via Custom Events)
* The host publishes updates to its Zustand store by dispatching a custom `host:state-change` event on the `window`.
* The remotes listen to this event to display the latest Zustand state.
* The remotes can trigger updates back by dispatching a `remote:update-state` event, which the host listens to and applies to the Zustand store.

### 2. Cross-App Persistence (via LocalStorage)
* All applications (host and remotes) read and write to the shared localStorage key `shared-local-data`.
* A `storage` event listener is registered in each app to immediately sync input changes across the shell and both micro-frontends.

---

## Running the Workspace

### Install Dependencies
Run from the monorepo root:
```bash
npm install
```

### Start Development Servers
This runs the Host, React Remote, and Vue Remote dev servers in parallel:
```bash
npm run dev
```

### Run Tests
Runs the Vitest suites across workspaces:
```bash
npm run test
```

### Build Production Bundles
Build all applications for production:
```bash
npm run build
```

---

## Deployment to GitHub Pages

To compile the entire consolidated micro-frontend monorepo into a single static build suitable for GitHub Pages deployment:

### 1. Build the Consolidated Site
Run the custom compilation script from the monorepo root:
```bash
npm run build:gh-pages
```
This script builds the host shell and both remote micro-frontends with matching base URLs (`/react-demo-app/`), nests the remotes within the host's directory structure, maps the production hashed file entry points inside the `import-map.json`, and duplicates `index.html` as `404.html` for routing support.

### 2. Publish to GitHub Pages
Use the `gh-pages` package to push the consolidated `dist` folder directly to the `gh-pages` deployment branch:
```bash
npx gh-pages -d apps/host/dist
```
Ensure your repository's pages settings on GitHub are configured to build from the `gh-pages` branch.


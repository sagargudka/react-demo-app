/// <reference types="vite/client" />

import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'mfe-react': any;
      'mfe-vue': any;
    }
  }
}

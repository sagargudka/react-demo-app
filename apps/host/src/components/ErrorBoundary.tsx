import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '15px', border: '1px solid red', borderRadius: '8px', color: 'red' }}>
          <h4>Micro-Frontend failed to render</h4>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

import {Component, type ReactNode} from 'react'

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      error: null,
    }
  }

  /**
   * Invoked when an error is thrown in the child component,
   * and used to update state in a concurrent friendly manner
   */
  static getDerivedStateFromError(error: Error) {
    return {error}
  }

  /**
   * Called _after_ the re-render, used for performing side-effects
   */
  override componentDidCatch(error: Error) {
    /**
     * re-throws the error out of the rendering context
     * which ensures it propagates to failbot
     * but also avoids react unmounting the entire
     * tree from an uncaught error
     */
    setTimeout(() => {
      throw error
    })
  }

  override render() {
    if (!this.state.error) return this.props.children

    return this.props.fallback
  }
}

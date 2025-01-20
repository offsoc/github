import {ErrorPage} from './ErrorPage'
import React from 'react'

// NOTE(jon, 2022-02-28): I copied 99% of this from memex's error-boundary

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  /**
   * Provide a callback to be invoked when an error is thrown (can be used for logging errors)
   */
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
   * Called _after_ the re-render, used for performing side-effects such as logging
   */
  override componentDidCatch(error: Error) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error)
    } else {
      defaultOnError(error)
    }
  }

  override render() {
    if (!this.state.error) return this.props.children

    return this.props.fallback === undefined ? <ErrorPage type="httpError" /> : this.props.fallback
  }
}

/**
 * Re-throws the error out of the rendering context to ensure that it propagates to failbot.
 * Also avoids react unmounting the entire tree from an uncaught error.
 */
function defaultOnError(error: Error) {
  setTimeout(() => {
    throw error
  })
}

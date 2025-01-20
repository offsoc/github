import type {ReactNode} from 'react'
import {Component} from 'react'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'

type Props = {
  children: ReactNode
  onRetry: () => void
  fallback: (retry: () => void, error: Error) => ReactNode
}

type State = {
  error: Error | null
}

export default class PreloadedQueryBoundary extends Component<Props, State> {
  override state = {error: null}
  static defaultProps = {
    fallback: (retry: () => void) => {
      return (
        <div>
          <span>Error:</span>
          <button onClick={retry}>Retry</button>
        </div>
      )
    },
  }

  static getDerivedStateFromError(error: Error): State {
    return {error}
  }

  override componentDidCatch(error: Error) {
    // Log errors directly instead of using the global window error callback
    // to avoid hitting the global error boundary.
    reportError(error)
  }

  _retry = () => {
    // This ends up calling loadQuery again to get and render
    // a new query reference
    this.props.onRetry()
    this.setState({
      // Clear the error
      error: null,
    })
  }

  override render() {
    const {children, fallback} = this.props
    const {error} = this.state

    if (error) {
      return fallback(this._retry, error)
    }

    return children
  }
}

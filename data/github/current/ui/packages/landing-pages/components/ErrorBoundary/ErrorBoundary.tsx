import {Component, useEffect, type ReactNode} from 'react'
import {z} from 'zod'

const RedirectTo500 = () => {
  useEffect(() => {
    window.location.assign('/500')
  })

  return null
}

type ErrorBoundaryProps = {children: ReactNode}
type ErrorBoundaryState = {hasError: boolean}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {hasError: false}
  }

  static getDerivedStateFromError(error: Error) {
    if (error instanceof z.ZodError) {
      return {hasError: true}
    }

    return {hasError: false}
  }

  override componentDidCatch(error: Error) {
    /**
     * Re-throws the error out of the rendering context to ensure that it propagates to failbot.
     * Also avoids react unmounting the entire tree from an uncaught error.
     */
    setTimeout(() => {
      throw error
    })
  }

  override render() {
    if (this.state.hasError) {
      return <RedirectTo500 />
    }

    return this.props.children
  }
}

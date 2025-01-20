import type React from 'react'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {ThemeProvider} from '@primer/react-brand'

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  return (
    <ErrorBoundary>
      <ThemeProvider dir="ltr">{props.children}</ThemeProvider>
    </ErrorBoundary>
  )
}

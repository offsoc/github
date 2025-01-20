import type {Meta} from '@storybook/react'
import {ErrorBoundary} from './ErrorBoundary'
import {noop} from '@github-ui/noop'

const meta = {
  title: 'Utilities/ErrorBoundary',
  component: ErrorBoundary,
} satisfies Meta<typeof ErrorBoundary>

export default meta

export const NoError = {
  render: () => <ErrorBoundary>No Error</ErrorBoundary>,
}

export const ErrorFallback = {
  render: () => (
    <ErrorBoundary fallback="WOOPS! Something went wrong" onError={noop}>
      <ProblemChild />
    </ErrorBoundary>
  ),
}

export const DefaultErrorFallback = {
  render: () => (
    <ErrorBoundary onError={noop}>
      <ProblemChild />
    </ErrorBoundary>
  ),
}

function ProblemChild() {
  throw new Error(
    "Intentional Error: nothing's wrong! (You may need to close the error overlay to see the `ErrorBoundary fallback`)",
  )
  return <>Bad child</>
}

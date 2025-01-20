import type {Meta} from '@storybook/react'
import PreloadedQueryBoundary from './PreloadedQueryBoundary'

const meta = {
  title: 'Utilities/PreloadedQueryBoundary',
  component: PreloadedQueryBoundary,
} satisfies Meta<typeof PreloadedQueryBoundary>

export default meta

export const NoError = {
  render: () => <PreloadedQueryBoundary onRetry={onRetry}>No Error</PreloadedQueryBoundary>,
}

export const ErrorFallback = {
  render: () => (
    <PreloadedQueryBoundary
      onRetry={onRetry}
      fallback={retry => (
        <>
          WOOPS! Something went wrong. <button onClick={retry}>Retry</button>
        </>
      )}
    >
      <ProblemChild />
    </PreloadedQueryBoundary>
  ),
}

export const DefaultErrorFallback = {
  render: () => (
    <PreloadedQueryBoundary onRetry={onRetry}>
      <ProblemChild />
    </PreloadedQueryBoundary>
  ),
}

function ProblemChild() {
  throw new Error(
    "Intentional Error: nothing's wrong! (You may need to close the error overlay to see the `PreloadedQueryBoundary fallback`)",
  )
  return <>Bad child</>
}

function onRetry() {
  return null
}

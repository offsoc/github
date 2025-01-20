import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {AlertIcon} from '@primer/octicons-react'
import {Blankslate} from '@primer/react/drafts'
import {type PropsWithChildren, useState} from 'react'

export const NestedListViewErrorBoundary = ({
  children,
  onError,
}: PropsWithChildren<{onRetry?: () => void; onError?: () => void; onDismiss?: () => void}>) => {
  const [loadingError, setLoadingError] = useState('An error occured while loading items')

  return (
    <ErrorBoundary
      fallback={
        <Blankslate>
          <Blankslate.Visual>
            <AlertIcon />
          </Blankslate.Visual>
          <Blankslate.Heading>{loadingError}</Blankslate.Heading>
          <Blankslate.Description>There was an issue loading Sub issues</Blankslate.Description>
          <Blankslate.SecondaryAction href="https://www.githubstatus.com/">GitHub status</Blankslate.SecondaryAction>
        </Blankslate>
      }
      onError={error => {
        if (error instanceof Error) {
          setLoadingError(error.message)
        }
        onError?.()
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

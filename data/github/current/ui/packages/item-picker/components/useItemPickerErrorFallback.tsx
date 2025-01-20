/* eslint eslint-comments/no-use: off */
/* eslint-disable filenames/match-regex */
import {useCallback, useState, type HTMLAttributes, type RefAttributes} from 'react'

import {AnchoredOverlay, Box} from '@primer/react'
import {ErrorWithRetry} from '@github-ui/error-with-retry'

type useErrorOverlayProps = {
  errorMessage: string
  anchorElement?: (props: HTMLAttributes<HTMLElement> & RefAttributes<HTMLButtonElement>) => JSX.Element
  open?: boolean
}

export function useItemPickerErrorFallback({errorMessage, anchorElement, open = false}: useErrorOverlayProps) {
  const [errorOverlayOpened, setErrorOverlayOpened] = useState(open)

  const createFallbackComponent = useCallback(
    (retry: () => void) => {
      if (!anchorElement) {
        return null
      }
      return (
        <AnchoredOverlay
          width="medium"
          height="small"
          open={errorOverlayOpened}
          onOpen={() => setErrorOverlayOpened(true)}
          onClose={() => setErrorOverlayOpened(false)}
          renderAnchor={anchorElement}
        >
          <Box sx={{m: 1, display: 'flex', justifyContent: 'center', height: '100%'}}>
            <ErrorWithRetry message={errorMessage} retry={retry} sx={{p: 2}} />
          </Box>
        </AnchoredOverlay>
      )
    },
    [anchorElement, errorMessage, errorOverlayOpened],
  )

  return {createFallbackComponent}
}

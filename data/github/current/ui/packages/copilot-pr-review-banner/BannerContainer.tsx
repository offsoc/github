import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {Box, merge} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import type {PropsWithChildren} from 'react'

const dismissedContainerSx: BetterSystemStyleObject = {display: 'none'}

const defaultContainerSx: BetterSystemStyleObject = {
  position: 'relative',
  borderRadius: 2,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  borderStyle: 'solid',
  borderWidth: '1px',
  p: 3,
}

const locationFilesChangedContainerSx: BetterSystemStyleObject = {
  mb: 3,
}

const locationCompareContainerSx: BetterSystemStyleObject = {
  my: 3,
}

const locationConversationContainerSx: BetterSystemStyleObject = {
  mt: 3,
}

const loadingContainerSx: BetterSystemStyleObject = {
  backgroundColor: 'var(--bgColor-inset, var(--color-canvas-subtle))',
  borderColor: 'var(--borderColor-muted, var(--color-border-muted))',
}

const errorContainerSx: BetterSystemStyleObject = {
  backgroundColor: 'var(--bgColor-danger-muted, var(--color-danger-subtle))',
  borderColor: 'var(--borderColor-danger-muted, var(--color-danger-muted))',
}

const readyContainerSx: BetterSystemStyleObject = {
  backgroundColor: 'var(--bgColor-accent-muted, var(--color-accent-subtle))',
  borderColor: 'var(--borderColor-accent-muted, var(--color-accent-muted))',
}

type BannerLocation = 'compare' | 'files_changed' | 'conversation'

export interface BannerContainerProps {
  isDismissed: boolean
  isLoading: boolean
  isError: boolean
  /**
   * Where is the banner being rendered, which page on GitHub.
   */
  location?: BannerLocation | null | undefined
}

export const BannerContainer = ({
  isDismissed,
  isError,
  isLoading,
  children,
  location,
}: PropsWithChildren<BannerContainerProps>) => {
  let containerSx: BetterSystemStyleObject = {}
  if (isDismissed) {
    containerSx = dismissedContainerSx
  } else if (isLoading) {
    containerSx = merge<BetterSystemStyleObject>(defaultContainerSx, loadingContainerSx)
  } else if (isError) {
    containerSx = merge<BetterSystemStyleObject>(defaultContainerSx, errorContainerSx)
  } else {
    containerSx = merge<BetterSystemStyleObject>(defaultContainerSx, readyContainerSx)
  }

  if (location === 'compare') {
    containerSx = merge<BetterSystemStyleObject>(containerSx, locationCompareContainerSx)
  } else if (location === 'files_changed') {
    containerSx = merge<BetterSystemStyleObject>(containerSx, locationFilesChangedContainerSx)
  } else if (location === 'conversation') {
    containerSx = merge<BetterSystemStyleObject>(containerSx, locationConversationContainerSx)
  }

  return (
    <Box {...testIdProps('copilot-review-banner')} sx={containerSx}>
      {children}
    </Box>
  )
}

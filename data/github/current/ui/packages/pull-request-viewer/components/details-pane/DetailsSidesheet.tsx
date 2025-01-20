import {XIcon} from '@primer/octicons-react'
import {Box, Heading, IconButton, Overlay} from '@primer/react'
import {useEffect, useRef} from 'react'
import type {PreloadedQuery} from 'react-relay'

import type {DetailsPaneQuery} from './__generated__/DetailsPaneQuery.graphql'
import {DetailsPaneWithSuspense} from './DetailsPane'

/**
 * On smaller viewports, renders the pull request details in a sidesheet
 */
export default function DetailsSidesheet({
  detailsPaneQuery,
  isNarrow,
  toggleSidesheetRef,
  exitOverlay,
}: {
  detailsPaneQuery: PreloadedQuery<DetailsPaneQuery>
  isNarrow: boolean
  toggleSidesheetRef: React.RefObject<HTMLButtonElement>
  exitOverlay: () => void
}) {
  useEffect(() => {
    // auto close sidesheet if the window is resized
    if (!isNarrow) {
      exitOverlay()
    }
  }, [exitOverlay, isNarrow])

  const closeButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <Overlay
      anchorSide="inside-left"
      aria-label="Details"
      initialFocusRef={closeButtonRef}
      position="fixed"
      returnFocusRef={toggleSidesheetRef}
      right={0}
      role="complementary"
      top={0}
      width="large"
      sx={{
        p: 3,
        height: '100vh',
        maxHeight: '100vh',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
      onClickOutside={exitOverlay}
      onEscape={exitOverlay}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3}}>
        <Heading as="h3" sx={{fontSize: 2, fontWeight: 600}}>
          Details
        </Heading>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          ref={closeButtonRef}
          aria-label="Close overview"
          icon={XIcon}
          unsafeDisableTooltip={true}
          variant="invisible"
          onClick={exitOverlay}
        />
      </Box>
      <DetailsPaneWithSuspense queryRef={detailsPaneQuery} showTitle={false} />
    </Overlay>
  )
}

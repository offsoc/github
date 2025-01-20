import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {forwardRef} from 'react'

type Props = {
  horizontalScrollbarSize?: number | null
}

const omnibarDrawerStyle: BetterSystemStyleObject = {
  position: 'absolute',
  width: '100%',
  pointerEvents: 'none',
}

/**
 * Render an invisible "drawer" for the Omnibar to appear in from.
 *
 * The Omnibar drawer is similar to the showing and hiding dock in macOS,
 * except that when in the "down" position, just the top of the Omnibar is
 * still visible.
 *
 * See docs/omnibar.md for more info.
 */
export const OmnibarDrawer = forwardRef<HTMLDivElement, React.PropsWithChildren<Props>>(
  ({horizontalScrollbarSize, children}, ref) => {
    const effectiveScrollbarSize = horizontalScrollbarSize ?? 12
    return (
      <Box
        ref={ref}
        sx={{bottom: horizontalScrollbarSize ? `${effectiveScrollbarSize}px` : 0, ...omnibarDrawerStyle}}
        {...testIdProps('omnibar-drawer')}
      >
        {children}
      </Box>
    )
  },
)

OmnibarDrawer.displayName = 'OmnibarDrawer'

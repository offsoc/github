import {Box, type SxProp} from '@primer/react'
import {memo, useRef} from 'react'

type PotentiallyDirtyProps = {
  /**
   * Set to {@link true} to display the dirty-state indicator.
   */
  isDirty: boolean
  /**
   * Optional callback to fire if the dirty-state indicator is clicked by the user.
   */
  onClick?: React.MouseEventHandler<HTMLElement>
  /**
   * Optional field to override the `isDirty` value and hide the dirty-state indicator.
   *
   * This should be used if there are additional checks that are necessary to ensure
   * the user can save the changes, e.g. authorization or permission checks.
   *
   * Defaults to {@link false} if omitted.
   */
  hideDirtyState?: boolean
} & SxProp

const containerSx = {position: 'relative'} as const
/**
 * Display an indicator to the user to indicate there are unsaved changes in a part of the application.
 */
export const PotentiallyDirty = memo<React.PropsWithChildren<PotentiallyDirtyProps>>(function PotentiallyDirty({
  children,
  isDirty,
  hideDirtyState = false,
  ...props
}) {
  const sx = hideDirtyState
    ? {}
    : {
        height: '8px',
        width: '8px',
        backgroundColor: 'accent.emphasis',
        top: '-1px',
        right: '-3px',
        borderRadius: '100%',
        boxShadow: (theme: FixMeTheme) => `0 0 0 2px ${theme.colors.canvas.overlay}`,
        flex: 'none',
        ...props.sx,
      }

  const contentRef = useRef<HTMLDivElement>(null)

  const sharedProps = {
    ...props,
    title: undefined,
    ref: contentRef,
    'aria-label': 'Unsaved changes',
    sx: children ? {...sx, position: 'absolute'} : {...sx, position: 'relative'},
  }

  if (children) {
    return (
      <Box className="dirty-icon-container" sx={containerSx}>
        {children}
        {isDirty && <Box {...sharedProps} />}
      </Box>
    )
  }

  if (!isDirty) {
    return null
  }

  return <Box {...sharedProps} />
})

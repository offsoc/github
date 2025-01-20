import {testIdProps} from '@github-ui/test-id-props'
import {Box, Label, type LabelProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {type PropsWithChildren, useRef} from 'react'

import {useSuppressActions} from './hooks/use-suppress-actions'
import styles from './TrailingBadge.module.css'

export type NestedListItemTrailingBadgeProps = PropsWithChildren<Pick<LabelProps, 'variant' | 'size'>> & {
  /**
   * Text that is shown as a visible Primer Label and as visually hidden text for screen readers.
   */
  title?: string

  /**
   * Styling for the div surrounding the label
   */
  containerSx?: BetterSystemStyleObject

  /** Container class name. */
  className?: string
}

export const NestedListItemTrailingBadge = ({
  title,
  containerSx,
  className,
  children,
  ...props
}: NestedListItemTrailingBadgeProps) => {
  const trailingBadgesContainerRef = useRef<HTMLDivElement>(null)

  useSuppressActions(trailingBadgesContainerRef)

  return (
    <Box
      {...testIdProps('nested-list-view-item-trailing-badge')}
      className={clsx(styles.container, className)}
      sx={containerSx}
      aria-hidden
      ref={trailingBadgesContainerRef}
    >
      {children || (
        <Label className={styles.label} {...props}>
          <span className={styles.title}>{title}</span>
        </Label>
      )}
    </Box>
  )
}

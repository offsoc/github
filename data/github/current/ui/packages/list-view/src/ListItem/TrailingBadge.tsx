import {testIdProps} from '@github-ui/test-id-props'
import {Box, Label, type LabelProps} from '@primer/react'
import {clsx} from 'clsx'
import type {PropsWithChildren} from 'react'

import type {PrefixedStylableProps} from '../types'
import styles from './TrailingBadge.module.css'

export type ListItemTrailingBadgeProps = PropsWithChildren<Pick<LabelProps, 'variant' | 'size'>> &
  PrefixedStylableProps<'container'> & {
    /**
     * Text that is shown as a visible Primer Label and as visually hidden text for screen readers.
     */
    title: string
  }

export const ListItemTrailingBadge = ({
  title,
  containerStyle,
  containerSx,
  containerClassName,
  children,
  ...props
}: ListItemTrailingBadgeProps) => {
  return (
    <Box
      {...testIdProps('list-view-item-trailing-badge')}
      className={clsx(styles.container, containerClassName)}
      style={containerStyle}
      sx={containerSx}
      data-listview-component="trailing-badge"
    >
      {children ? (
        children
      ) : (
        <Label className={styles.label} {...props}>
          <span className={styles.title}>{title}</span>
        </Label>
      )}
    </Box>
  )
}

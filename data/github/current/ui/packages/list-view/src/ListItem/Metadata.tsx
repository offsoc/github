import {testIdProps} from '@github-ui/test-id-props'
import {Box, type BoxProps} from '@primer/react'
import {clsx} from 'clsx'
import type {PropsWithChildren} from 'react'

import type {StylableProps} from '../types'
import styles from './Metadata.module.css'

export type ListItemMetadataProps = PropsWithChildren<{
  /**
   * Controls how the metadata will be aligned inside the trailing content. Defaults to 'left'.
   */
  alignment?: 'left' | 'right'
  /**
   * Alter the appearance of the metadata to appear more subtle than other ListItem content ('secondary', default) or
   * comparable to other ListItem content ('primary'). Affects text color, font size, width, and distance from other
   * metadata items.
   */
  variant?: 'primary' | 'secondary'
}> &
  Omit<BoxProps, 'sx'> &
  StylableProps

export function ListItemMetadata({children, alignment, variant, ...props}: ListItemMetadataProps) {
  return (
    <Box
      {...testIdProps('list-view-item-metadata-item')}
      {...props}
      className={clsx(
        styles.metadata,
        variant === 'primary' ? styles.primary : styles.secondary,
        alignment === 'right' && styles.alignRight,
        props.className,
      )}
    >
      {children}
    </Box>
  )
}

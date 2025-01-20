import {testIdProps} from '@github-ui/test-id-props'
import {Box, type BoxProps} from '@primer/react'
import {clsx} from 'clsx'
import type {PropsWithChildren} from 'react'

import styles from './Metadata.module.css'

export type NestedListItemMetadataProps = PropsWithChildren<{
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
  BoxProps

export const NestedListItemMetadata = ({
  children,
  alignment,
  variant,
  className,
  ...props
}: NestedListItemMetadataProps) => (
  <Box
    className={clsx(
      'listitem-metadata',
      styles.container,
      variant === 'primary' ? styles.primary : styles.secondary,
      alignment === 'right' && styles.alignRight,
      className,
    )}
    {...testIdProps('nested-list-view-item-metadata-item')}
    {...props}
  >
    {children}
  </Box>
)

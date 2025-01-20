import {testIdProps} from '@github-ui/test-id-props'
import {Box, type BoxProps} from '@primer/react'
import {clsx} from 'clsx'

import styles from './DescriptionItem.module.css'

export function NestedListItemDescriptionItem({children, className, ...props}: BoxProps) {
  return (
    <Box className={clsx(styles.container, className)} {...testIdProps('list-view-item-descriptionitem')} {...props}>
      {children}
    </Box>
  )
}

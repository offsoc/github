import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {clsx} from 'clsx'

import type {StylableProps} from '../types'
import styles from './Description.module.css'

interface ListItemDescriptionProps extends StylableProps {
  children?: React.ReactNode
}

export function ListItemDescription({children, style, className, sx}: ListItemDescriptionProps) {
  return (
    <Box
      {...testIdProps('list-view-item-description')}
      className={clsx(styles.container, className)}
      style={style}
      sx={sx}
    >
      {children}
    </Box>
  )
}

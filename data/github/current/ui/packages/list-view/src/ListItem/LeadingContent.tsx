import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import type {PropsWithChildren} from 'react'

import {useListViewSelection} from '../ListView/SelectionContext'
import type {StylableProps} from '../types'
import styles from './LeadingContent.module.css'

export const ListItemLeadingContent = ({style, className, sx, children}: PropsWithChildren<StylableProps>) => {
  const {isSelectable} = useListViewSelection()

  return (
    <Box
      className={clsx(styles.container, isSelectable && styles.isSelectable, className)}
      {...testIdProps('list-view-item-leading-content')}
      style={style}
      sx={sx}
    >
      {children}
    </Box>
  )
}

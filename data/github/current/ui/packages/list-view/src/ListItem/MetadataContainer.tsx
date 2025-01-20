import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {clsx} from 'clsx'
import type {ReactElement, ReactNode} from 'react'

import type {StylableProps} from '../types'
import type {ListItemMetadata} from './Metadata'
import styles from './MetadataContainer.module.css'

export type ListItemMetadataContainerProps = StylableProps & {
  children: ReactNode | Array<ReactElement<typeof ListItemMetadata>>
}

export function ListItemMetadataContainer({style, sx, className, children}: ListItemMetadataContainerProps) {
  return (
    <Box
      className={clsx(styles.container, className)}
      style={style}
      sx={sx}
      {...testIdProps('list-view-item-metadata')}
    >
      {children}
    </Box>
  )
}

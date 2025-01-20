import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {type ReactElement, type ReactNode, useRef} from 'react'

import {useSuppressActions} from './hooks/use-suppress-actions'
import type {NestedListItemMetadata} from './Metadata'
import styles from './MetadataContainer.module.css'

export interface MetadataContainerProps {
  sx?: BetterSystemStyleObject
  children: ReactNode | Array<ReactElement<typeof NestedListItemMetadata>>
  className?: string
}

export function NestedListItemMetadataContainer({sx, children, className}: MetadataContainerProps) {
  const metadataContainerRef = useRef<HTMLDivElement>(null)

  useSuppressActions(metadataContainerRef)

  return (
    <Box
      ref={metadataContainerRef}
      aria-hidden="true"
      sx={sx}
      {...testIdProps('nested-list-view-item-metadata')}
      className={clsx(styles.metadataContainer, className)}
    >
      {children}
    </Box>
  )
}

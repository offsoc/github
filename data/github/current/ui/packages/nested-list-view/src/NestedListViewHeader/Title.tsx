import {testIdProps} from '@github-ui/test-id-props'
import {Heading} from '@primer/react'
import {clsx} from 'clsx'
import type {ReactNode} from 'react'

import {useNextHeaderTag} from '../hooks/use-next-header-tag'
import styles from './Title.module.css'

export type NestedListViewHeaderTitleProps = {
  title: string
  children?: ReactNode
  className?: string
}

export const NestedListViewHeaderTitle = ({title, children, className}: NestedListViewHeaderTitleProps) => {
  const titleTag = useNextHeaderTag('nested-list-view-metadata')

  return (
    <div className={clsx(styles.container, className)}>
      <Heading as={titleTag} className={styles.header} {...testIdProps('nested-list-view-header-title')}>
        {title}
      </Heading>
      {children}
    </div>
  )
}

import {TitleProvider} from '@github-ui/list-view/ListViewTitleContext'
import {VariantProvider} from '@github-ui/list-view/ListViewVariantContext'
import type React from 'react'

import styles from './SimpleListView.module.css'

export interface SimpleListViewProps {
  title: string
  children: React.ReactNode
}

export function SimpleListView(props: SimpleListViewProps) {
  const {children, title} = props

  return (
    <VariantProvider>
      <TitleProvider title={title}>
        <table className={styles.table}>
          <tbody className={styles.tbody}>{children}</tbody>
        </table>
      </TitleProvider>
    </VariantProvider>
  )
}

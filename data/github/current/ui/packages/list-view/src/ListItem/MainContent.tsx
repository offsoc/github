import {testIdProps} from '@github-ui/test-id-props'
import {clsx} from 'clsx'
import {Children, isValidElement, type ReactNode} from 'react'

import {useListViewVariant} from '../ListView/VariantContext'
import styles from './MainContent.module.css'
import {ListItemTitle} from './Title'

export function ListItemMainContent({children}: {children?: ReactNode}) {
  const {variant} = useListViewVariant()
  const childrenArray = Children.toArray(children)
  const titleIndex = childrenArray.findIndex(
    child => isValidElement(child) && typeof child !== 'string' && child.type === ListItemTitle,
  )
  const title = childrenArray[titleIndex]
  const nonTitleChildren =
    titleIndex < 0 ? childrenArray : childrenArray.slice(0, titleIndex).concat(childrenArray.slice(titleIndex + 1))
  return (
    <>
      {title}
      <div {...testIdProps('list-view-item-main-content')} className={styles.container}>
        <div className={clsx(styles.inner, variant === 'compact' && styles.compact)}>{nonTitleChildren}</div>
      </div>
    </>
  )
}

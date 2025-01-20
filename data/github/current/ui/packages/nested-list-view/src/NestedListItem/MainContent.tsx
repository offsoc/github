import {testIdProps} from '@github-ui/test-id-props'
import {Children, isValidElement, type ReactNode} from 'react'

import styles from './MainContent.module.css'
import {NestedListItemTitle} from './Title'

export function NestedListItemMainContent({children}: {children?: ReactNode}) {
  const childrenArray = Children.toArray(children)
  const titleIndex = childrenArray.findIndex(
    child => isValidElement(child) && typeof child !== 'string' && child.type === NestedListItemTitle,
  )
  const title = childrenArray[titleIndex]
  const nonTitleChildren =
    titleIndex < 0 ? childrenArray : childrenArray.slice(0, titleIndex).concat(childrenArray.slice(titleIndex + 1))
  return (
    <>
      {title}
      <div {...testIdProps('list-view-item-main-content')} className={styles.container}>
        <div className={styles.innerContainer}>{nonTitleChildren}</div>
      </div>
    </>
  )
}

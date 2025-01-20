import {clsx} from 'clsx'
import styles from './MergeBoxExpandable.module.css'
import type React from 'react'

type MergeBoxExpandableProps = {
  isExpanded?: boolean
  children: React.ReactNode
}

/**
 * Handles shared style treatment around collapsing Expandables
 */
export const MergeBoxExpandable = ({isExpanded = false, children}: MergeBoxExpandableProps) => {
  return (
    <div
      className={clsx(styles.expandableWrapper, isExpanded && styles.isExpanded)}
      //  We're setting visibility directly because tests don't pick up styles from modules
      style={{visibility: isExpanded ? 'visible' : 'hidden'}}
    >
      <div className={clsx(styles.expandableContent, isExpanded && styles.isExpanded)}>{children}</div>
    </div>
  )
}

import {testIdProps} from '@github-ui/test-id-props'

import styles from './UnreadIndicator.module.css'

export const NestedListItemUnreadIndicator = () => {
  return (
    <div className={styles.container}>
      <span className="sr-only" {...testIdProps('list-view-item-unread-indicator')}>
        New activity.
      </span>
    </div>
  )
}

import {Link, RelativeTime} from '@primer/react'
import styles from './row.module.css'

type AgoProps = {
  timestamp: Date
  linkUrl?: string
}

export function Ago({timestamp, linkUrl}: AgoProps): JSX.Element {
  return (
    <Link href={linkUrl} className={styles.timelineAgoLink}>
      <RelativeTime date={timestamp}>
        on {timestamp.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
      </RelativeTime>
    </Link>
  )
}

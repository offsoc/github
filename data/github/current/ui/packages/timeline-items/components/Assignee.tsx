import {userHovercardPath} from '@github-ui/paths'
import styles from './assignees.module.css'
import {Link} from '@primer/react'

type AssigneeProps = {
  assigneeLogin: string
}

export function Assignee({assigneeLogin}: AssigneeProps): JSX.Element {
  return (
    <Link
      data-hovercard-url={userHovercardPath({owner: assigneeLogin})}
      href={`/${assigneeLogin}`}
      className={styles.assigneeLink}
      inline
    >
      {assigneeLogin}
    </Link>
  )
}

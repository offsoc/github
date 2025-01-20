import {GitHubAvatar} from '@github-ui/github-avatar'
import {userHovercardPath} from '@github-ui/paths'
import {graphql, useFragment} from 'react-relay'
import styles from './assignees.module.css'

import type {Assignee$key} from './__generated__/Assignee.graphql'
import {Link} from '@primer/react'

type Props = {
  assignee: Assignee$key
  /**
   * Href getter for the assignee link
   * @param name - name of the assignee
   * @returns URL to the assignee
   */
  getAssigneeHref: (assignee: string) => string
}

export function Assignee({assignee, getAssigneeHref}: Props) {
  const {login, avatarUrl} = useFragment(
    graphql`
      fragment Assignee on User {
        login
        avatarUrl(size: 64)
      }
    `,
    assignee,
  )

  return (
    <Link
      aria-label={`${login} is assigned`}
      href={getAssigneeHref(login)}
      data-hovercard-url={userHovercardPath({owner: login})}
      className={`pc-AvatarItem ${styles.assigneeIconLink}`}
    >
      <GitHubAvatar key={login} alt={login} src={avatarUrl} sx={{cursor: 'pointer'}} />
    </Link>
  )
}

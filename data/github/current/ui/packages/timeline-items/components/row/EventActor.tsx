import {Link} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../../constants/labels'
import {VALUES} from '../../constants/values'
import type {EventActor$key} from './__generated__/EventActor.graphql'
import {GhostActor} from './GhostActor'
import {userHovercardPath} from '@github-ui/paths'
import {GitHubAvatar} from '@github-ui/github-avatar'
import styles from './row.module.css'

type EventActorProps = {
  actor: EventActor$key | null
} & SharedProps

type EventActorPropsInternal = {
  actor: EventActor$key
} & SharedProps

type SharedProps = {
  showAvatarOnly: boolean
}

type EventActorBaseProps = {
  login?: string
  avatarUrl: string
  isUser?: boolean
} & SharedProps

export function EventActor({actor, ...props}: EventActorProps): JSX.Element {
  return actor ? <EventActorInternal actor={actor} {...props} /> : <GhostActor />
}

function EventActorInternal({actor, ...props}: EventActorPropsInternal): JSX.Element {
  const data = useFragment(
    graphql`
      fragment EventActor on Actor {
        avatarUrl(size: 64)
        login
        __typename
      }
    `,
    actor,
  )

  const isUser = ['User', 'Organization'].includes(data.__typename)

  return <EventActorBase login={data.login} avatarUrl={data.avatarUrl} isUser={isUser} {...props} />
}

function EventActorBase({login, avatarUrl, showAvatarOnly, isUser = true}: EventActorBaseProps): JSX.Element {
  if (login === VALUES.ghostUserLogin) {
    return <span>{LABELS.repositoryOwner} </span>
  } else if (!login) {
    return <span>{VALUES.ghostUserLogin} </span>
  }

  return (
    <div className={styles.eventActorContainer}>
      <Link
        data-testid="actor-link"
        role="link"
        href={isUser ? `/${login}` : `/apps/${login}`}
        data-hovercard-url={isUser ? userHovercardPath({owner: login}) : null}
        className={styles.eventActorLink}
        muted
      >
        <GitHubAvatar src={avatarUrl} size={16} sx={{mr: showAvatarOnly ? 0 : 1}} />
        {showAvatarOnly ? '' : login}
      </Link>
    </div>
  )
}

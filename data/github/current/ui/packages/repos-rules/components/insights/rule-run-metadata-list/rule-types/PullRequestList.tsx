import {ListItem} from '../ListItem'
import type {PullRequestMetadata, RunMetadata} from '../../../../types/rules-types'
import {userHovercardPath} from '@github-ui/paths'

export function PullRequestList({metadata}: {metadata: RunMetadata}) {
  return (
    <ul>
      {(metadata as PullRequestMetadata).prReviewers.map(({state, stateSummary, user}) => (
        <ListItem
          key={user.login}
          state={state === 'approved' ? 'success' : state}
          avatarLabel={user.login}
          avatarUrl={user.primaryAvatarUrl}
          hovercardUrl={userHovercardPath({owner: user.login})}
          title={user.login}
          description={stateSummary}
        />
      ))}
    </ul>
  )
}

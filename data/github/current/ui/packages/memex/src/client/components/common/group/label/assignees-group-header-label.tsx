import {GitHubAvatar} from '@github-ui/github-avatar'
import {AvatarStack} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {User} from '../../../../api/common-contracts'
import {joinOxford} from '../../../../helpers/join-oxford'
import type {FieldAggregate} from '../../../../hooks/use-aggregation-settings'
import {AggregateLabels} from '../../aggregate-labels'
import {SanitizedGroupHeaderText} from '../sanitized-group-header-text'

type Props = {
  assignees: Array<User>
  rowCount: number
  hideItemsCount: boolean
  aggregates: Array<FieldAggregate>
  titleSx?: BetterSystemStyleObject
}

export function AssigneesGroupHeaderLabel({assignees, rowCount, aggregates, hideItemsCount, titleSx}: Props) {
  const title = joinOxford(assignees.map(u => u.login))

  return (
    <>
      <AvatarStack sx={{zIndex: 0}}>
        {assignees.map(assignee => (
          <GitHubAvatar loading="lazy" key={assignee.id} alt={assignee.login} src={assignee.avatarUrl} />
        ))}
      </AvatarStack>
      <SanitizedGroupHeaderText titleHtml={title} sx={titleSx} />
      <AggregateLabels
        counterSx={{color: 'fg.muted'}}
        itemsCount={rowCount}
        aggregates={aggregates}
        hideItemsCount={hideItemsCount}
      />
    </>
  )
}

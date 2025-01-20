import {graphql, useFragment} from 'react-relay'
import {NestedListItemLeadingVisual} from '@github-ui/nested-list-view/NestedListItemLeadingVisual'

import type {SubIssueStateIcon$key} from './__generated__/SubIssueStateIcon.graphql'
import {getIssueStateIcon} from '../constants/stateIcon'

const stateIconFragment = graphql`
  fragment SubIssueStateIcon on Issue {
    state
    stateReason
  }
`

type SubIssueStateIconProps = {
  dataKey: SubIssueStateIcon$key
}

export function SubIssueStateIcon({dataKey}: SubIssueStateIconProps) {
  const data = useFragment(stateIconFragment, dataKey)

  const stateOrReason = data.state === 'CLOSED' && data.stateReason === 'NOT_PLANNED' ? 'NOT_PLANNED' : data.state

  const state = getIssueStateIcon(stateOrReason)

  const {icon, color, description} = state

  return (
    <NestedListItemLeadingVisual
      icon={icon}
      color={color}
      description={description}
      data-testid="nested-list-item-state-icon"
    />
  )
}

import {SkipIcon} from '@primer/octicons-react'

import {ICONS_VALUES} from './values'

export function getIssueStateIcon(stateOrReason: string | null) {
  let issueState = {
    color: 'fg.muted',
    icon: SkipIcon,
    description: ICONS_VALUES.issueIcons.NOT_PLANNED.description,
  }
  if (stateOrReason) {
    const stateKey = `${stateOrReason}` as keyof typeof ICONS_VALUES.issueIcons
    if (stateKey in ICONS_VALUES.issueIcons) {
      issueState = ICONS_VALUES.issueIcons[stateKey]
    } else {
      throw new Error('Invalid state reason')
    }
  }
  return issueState
}

export function getPullRequestStateIcon(state: string | null) {
  let pullRequestState = {
    color: 'fg.muted',
    icon: SkipIcon,
    description: ICONS_VALUES.pullRequestIcons.DRAFT.description,
  }
  if (state) {
    const stateKey = `${state}` as keyof typeof ICONS_VALUES.pullRequestIcons
    if (stateKey in ICONS_VALUES.pullRequestIcons) {
      pullRequestState = ICONS_VALUES.pullRequestIcons[stateKey]
    } else {
      throw new Error('Invalid state reason')
    }
  }
  return pullRequestState
}

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

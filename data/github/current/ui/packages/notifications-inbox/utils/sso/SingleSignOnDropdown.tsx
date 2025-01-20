import {ShieldLockIcon} from '@primer/octicons-react'
import {ActionMenu, type ActionMenuProps, CounterLabel} from '@primer/react'
import type {FC} from 'react'

import {LABELS} from './constants'
import useSso from './hooks/useSso'
import SingleSignOnDropdownMenu from './SingleSignOnDropdownMenu'

type Props = Omit<ActionMenuProps, 'children'>
export const SingleSignOnDropdown: FC<Props> = props => {
  const {ssoOrgs} = useSso()

  if (ssoOrgs.length === 0) {
    return null
  }

  return (
    <ActionMenu {...props}>
      <ActionMenu.Button leadingVisual={ShieldLockIcon} size="small">
        {LABELS.singleSignOnLinkText}
        <CounterLabel sx={{ml: 1}}>{ssoOrgs.length}</CounterLabel>
      </ActionMenu.Button>
      <SingleSignOnDropdownMenu />
    </ActionMenu>
  )
}

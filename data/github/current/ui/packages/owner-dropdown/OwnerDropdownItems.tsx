import {GitHubAvatar} from '@github-ui/github-avatar'
import {ActionList} from '@primer/react'

import type {OwnerItem} from './OwnerDropdown'

export function OwnerDropdownItems({
  ownerItems,
  selectedOwner,
  onSelect,
}: {
  ownerItems: OwnerItem[]
  selectedOwner?: OwnerItem
  onSelect: (selectedOwner: OwnerItem) => void
}) {
  const ownerListItems = ownerItems.map(item => {
    const {name, avatarUrl, disabled, customDisabledMessage} = item
    return (
      <ActionList.Item
        key={name}
        selected={name === selectedOwner?.name}
        disabled={disabled}
        onSelect={() => onSelect(item)}
      >
        <ActionList.LeadingVisual>
          <GitHubAvatar src={avatarUrl} />
        </ActionList.LeadingVisual>
        {name} {disabled && (customDisabledMessage || '(Insufficient permission)')}
      </ActionList.Item>
    )
  })

  return <ActionList selectionVariant="single">{ownerListItems}</ActionList>
}

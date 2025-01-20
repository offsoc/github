import {ActionList} from '@primer/react'

export function MergeDropdownOption({
  onSelect,
  primaryText,
  secondaryText,
  selected,
}: {
  onSelect: () => void
  primaryText: string
  secondaryText: string
  selected: boolean
}) {
  return (
    <ActionList.Item selected={selected} onSelect={onSelect}>
      {primaryText}
      <ActionList.Description variant="block">{secondaryText}</ActionList.Description>
    </ActionList.Item>
  )
}

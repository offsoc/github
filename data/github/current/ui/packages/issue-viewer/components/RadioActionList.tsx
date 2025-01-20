import {ActionList, RadioGroup} from '@primer/react'
import {RadioActionListItem, type Item} from './RadioActionListItem'

export interface RadioActionListProps {
  name: string
  onChange: (value: string | undefined) => void
  groupLabel: string
  items: Item[]
  selectedId?: string
}

export const RadioActionList = ({name, onChange, groupLabel, items, selectedId}: RadioActionListProps) => {
  return (
    <RadioGroup name={name} onChange={e => onChange(e?.valueOf())}>
      {/* This is here for accessibility, but hidden so we can use it in a dialog with a title */}
      <RadioGroup.Label visuallyHidden>{groupLabel}</RadioGroup.Label>
      <ActionList showDividers>
        {items.map(item => (
          <RadioActionListItem key={item.id} item={item} onChange={onChange} selected={item.id === selectedId} />
        ))}
      </ActionList>
    </RadioGroup>
  )
}

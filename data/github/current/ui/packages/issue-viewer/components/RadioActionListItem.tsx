import {ActionList, FormControl, Radio} from '@primer/react'

export interface Item {
  id: string
  name: string
  description?: string
}

interface RadioActionListItemProps {
  item: Item
  onChange: (value: string | undefined) => void
  selected: boolean
}

export const RadioActionListItem = ({item, onChange, selected}: RadioActionListItemProps) => {
  return (
    // aria labeleedBy is overriden here to avoid a duplicate label. The radio button input
    // is already labeled by the FormControl.Label
    <ActionList.Item onSelect={() => onChange(item.id)} aria-labelledby="">
      <ActionList.LeadingVisual>
        <FormControl>
          <Radio value={item.id} checked={selected} aria-checked={selected} />
          <FormControl.Label visuallyHidden>{item.name}</FormControl.Label>
        </FormControl>
      </ActionList.LeadingVisual>
      {item.name}
      <ActionList.Description variant="block">{item.description}</ActionList.Description>
    </ActionList.Item>
  )
}

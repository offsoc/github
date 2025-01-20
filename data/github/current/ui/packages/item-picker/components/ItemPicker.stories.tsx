import type {Meta} from '@storybook/react'
import {ItemPicker, type ItemPickerProps} from './ItemPicker'
import {noop} from '@github-ui/noop'

interface Item {
  name: string
}

const items: Item[] = [{name: 'Nandor'}, {name: 'Nadja'}, {name: 'Lazlo'}, {name: 'Colin'}, {name: 'Guillermo'}]

const meta = {
  title: 'ItemPicker/ItemPicker',
  component: ItemPicker,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<ItemPickerProps<Item>>

export default meta

const defaultArgs = {
  items,
  initialSelectedItems: [],
  placeholderText: 'Placeholder Text',
  selectionVariant: 'multiple',
  title: 'Select item',
  filterItems: noop,
  renderAnchor: anchorProps => (
    <a role="button" {...anchorProps}>
      {anchorProps.children ? `Selected Items: ${anchorProps.children}` : 'Select Items'}
    </a>
  ),
  getItemKey: item => item.name,
  convertToItemProps: item => ({id: item.name, text: item.name, source: item}),
  onSelectionChange: noop,
} satisfies ItemPickerProps<Item>

export const Example = {
  args: {...defaultArgs},
}

export const Nested = {
  args: {...defaultArgs, nested: true},
}

export const WithSelectedItems = {
  args: {
    ...defaultArgs,
    initialSelectedItems: ['Nadja', 'Lazlo'],
  },
}

export const Empty = {
  args: {
    ...defaultArgs,
    items: [],
  },
}

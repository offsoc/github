import {ListItem, type ListItemProps} from '../ListItem'
import type {Meta} from '@storybook/react'

const item = {
  title: 'list item',
  id: '0',
  index: 0,
  children: [],
  nested: false,
  content: 'list item',
  checked: false,
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  container: document.createElement('li'),
  markdownIndex: 0,
  isBullet: true,
}

const defaultArgs: Partial<ListItemProps> = {
  item,
  position: 0,
}

const ListItemWrapper = (args: ListItemProps) => <ListItem {...args} />

const meta = {
  title: 'ListItem',
  component: ListItem,
} satisfies Meta<typeof ListItem>

export default meta

export const ListItemDefault = {
  args: {
    ...defaultArgs,
  },
  render: ListItemWrapper,
}

export const ListItemWithEmbeddedLink = {
  args: {
    ...defaultArgs,
    item: {...item, content: 'list item with <a href="/">test link</a> more text'},
  },
  render: ListItemWrapper,
}

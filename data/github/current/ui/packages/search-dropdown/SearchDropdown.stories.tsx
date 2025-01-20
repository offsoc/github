import type {Meta} from '@storybook/react'
import {SearchDropdown, type SearchDropdownProps} from './SearchDropdown'

const meta = {
  title: 'ReposComponents/SearchDropdown',
  component: SearchDropdown,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof SearchDropdown>

export default meta

const defaultArgs: Partial<SearchDropdownProps> = {
  title: 'TestLabel',
  items: [
    {text: 'Foo', id: 'foo'},
    {text: 'Bar', id: 'bar'},
  ],
  onSelect: () => {},
}

export const SearchDropdownNoSelection = {
  args: defaultArgs,
  render: (args: SearchDropdownProps) => <SearchDropdown {...args} />,
}

export const SearchDropdownWithSelection = {
  args: {
    ...defaultArgs,
    selectedItem: {text: 'Foo', id: 'foo'},
  },
  render: (args: SearchDropdownProps) => <SearchDropdown {...args} />,
}

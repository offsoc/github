import type {Meta} from '@storybook/react'
import {ListLoading, type ListLoadingProps} from './ListLoading'

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: ListLoading,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ListLoading>

export default meta

const defaultArgs: Partial<ListLoadingProps> = {
  pageSize: 10,
  headerTitle: 'Header',
  showBorder: true,
}

export const ListLoadingExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ListLoadingProps) => <ListLoading {...args} />,
}

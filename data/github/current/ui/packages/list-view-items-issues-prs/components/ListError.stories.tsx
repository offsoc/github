import type {Meta} from '@storybook/react'
import {ListError, type ListErrorProps} from './ListError'

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: ListError,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ListError>

export default meta

const defaultArgs: Partial<ListErrorProps> = {
  title: 'There was an error',
  message: 'Message goes here',
  retry: () => alert('Retry clicked'),
  retryText: 'Retry text goes here',
}

export const ListErrorExample = {
  args: {
    ...defaultArgs,
  },
}

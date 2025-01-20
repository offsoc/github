import type {Meta} from '@storybook/react'
import {PaginationLoading, type PaginationLoadingProps} from './PaginationLoading'

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: PaginationLoading,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof PaginationLoading>

export default meta

const defaultArgs: Partial<PaginationLoadingProps> = {
  isCompactRows: false,
}

export const PaginationLoadingExample = {
  args: {
    ...defaultArgs,
  },
}

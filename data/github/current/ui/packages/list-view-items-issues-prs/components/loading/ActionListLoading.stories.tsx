import type {Meta} from '@storybook/react'
import {ActionListLoading} from './ActionListLoading'
import type {ActionListLoadingProps} from './ActionListLoading'

const meta = {
  title: 'ListViewItemsIssuesPrs',
  component: ActionListLoading,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ActionListLoading>

export default meta

const defaultArgs: Partial<ActionListLoadingProps> = {
  numberOfRows: 10,
  isCompact: false,
}

export const ActionListLoadingExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ActionListLoadingProps) => <ActionListLoading {...args} />,
}

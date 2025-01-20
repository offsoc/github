import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getActionListSelectionVariant} from '../../common/helpers'
import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import type {SelectType} from '../../common/types'
import {
  ActionListItemPullRequest,
  type ActionListItemPullRequestProps,
  ActionListItemPullRequestSkeleton,
} from '../PullRequest'

const meta = {
  title: 'Recipes/ActionListItems/PullRequest',
  component: ActionListItemPullRequest,
  parameters: defaultParameters,
  args: {
    name: 'Shared Components PullRequest',
    selectType: 'multiple',
    selected: true,
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemPullRequest>

export default meta
type Story = StoryObj<typeof ActionListItemPullRequest>

export const Example: Story = {
  name: 'ActionListItemPullRequest',
  render: (args: ActionListItemPullRequestProps) => <ActionListItemPullRequest {...args} />,
  decorators: [
    (Story, {args}) => (
      <ActionList selectionVariant={getActionListSelectionVariant(args.selectType)}>
        <Story />
      </ActionList>
    ),
  ],
}

export const Skeleton: Story = {
  name: 'ActionListItemPullRequestSkeleton',
  render: (args: {selectType: SelectType}) => <ActionListItemPullRequestSkeleton {...args} />,
}

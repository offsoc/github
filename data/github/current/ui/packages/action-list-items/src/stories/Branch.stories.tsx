import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getActionListSelectionVariant} from '../../common/helpers'
import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import type {SelectType} from '../../common/types'
import {ActionListItemBranch, type ActionListItemBranchProps, ActionListItemBranchSkeleton} from '../Branch'

const meta = {
  title: 'Recipes/ActionListItems/Branch',
  component: ActionListItemBranch,
  parameters: defaultParameters,
  args: {
    name: 'Shared Components Branch',
    selectType: 'multiple',
    selected: true,
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemBranch>

export default meta
type Story = StoryObj<typeof ActionListItemBranch>

export const Example: Story = {
  name: 'ActionListItemBranch',
  render: (args: ActionListItemBranchProps) => <ActionListItemBranch {...args} />,
  decorators: [
    (Story, {args}) => (
      <ActionList selectionVariant={getActionListSelectionVariant(args.selectType)}>
        <Story />
      </ActionList>
    ),
  ],
}

export const Skeleton: Story = {
  name: 'ActionListItemBranchSkeleton',
  render: (args: {selectType: SelectType}) => <ActionListItemBranchSkeleton {...args} />,
}

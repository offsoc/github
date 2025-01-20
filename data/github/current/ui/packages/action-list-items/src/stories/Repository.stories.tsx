import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getActionListSelectionVariant} from '../../common/helpers'
import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import type {SelectType} from '../../common/types'
import {
  ActionListItemRepository,
  type ActionListItemRepositoryProps,
  ActionListItemRepositorySkeleton,
} from '../Repository'

const meta = {
  title: 'Recipes/ActionListItems/Repository',
  component: ActionListItemRepository,
  parameters: defaultParameters,
  args: {
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/mona',
    nameWithOwner: 'owner-name/repo-name',
    selectType: 'multiple',
    selected: true,
    showTrailingVisual: false,
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemRepository>

export default meta
type Story = StoryObj<typeof ActionListItemRepository>

export const Example: Story = {
  name: 'ActionListItemRepository',
  render: (args: ActionListItemRepositoryProps) => <ActionListItemRepository {...args} />,
  decorators: [
    (Story, {args}) => (
      <ActionList selectionVariant={getActionListSelectionVariant(args.selectType)}>
        <Story />
      </ActionList>
    ),
  ],
}

export const Skeleton: Story = {
  name: 'ActionListItemRepositorySkeleton',
  render: (args: {selectType: SelectType}) => <ActionListItemRepositorySkeleton {...args} />,
}

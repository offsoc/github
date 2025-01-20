import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getActionListSelectionVariant} from '../../common/helpers'
import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import type {SelectType} from '../../common/types'
import {ActionListItemUser, type ActionListItemUserProps, ActionListItemUserSkeleton} from '../User'

const meta = {
  title: 'Recipes/ActionListItems/User',
  component: ActionListItemUser,
  parameters: defaultParameters,
  args: {
    avatarUrl: 'https://avatars.githubusercontent.com/mona',
    fullName: 'Mona Lisa',
    username: 'monalisa',
    selectType: 'multiple',
    selected: true,
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemUser>

export default meta
type Story = StoryObj<typeof ActionListItemUser>

export const Example: Story = {
  name: 'ActionListItemUser',
  render: (args: ActionListItemUserProps) => <ActionListItemUser {...args} />,
  decorators: [
    (Story, {args}) => (
      <ActionList selectionVariant={getActionListSelectionVariant(args.selectType)}>
        <Story />
      </ActionList>
    ),
  ],
}

export const Skeleton: Story = {
  name: 'ActionListItemUserSkeleton',
  render: (args: {selectType: SelectType}) => <ActionListItemUserSkeleton {...args} />,
}

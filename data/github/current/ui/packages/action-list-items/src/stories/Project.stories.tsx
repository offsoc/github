import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getActionListSelectionVariant} from '../../common/helpers'
import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import type {SelectType} from '../../common/types'
import {ActionListItemProject, type ActionListItemProjectProps, ActionListItemProjectSkeleton} from '../Project'

const meta = {
  title: 'Recipes/ActionListItems/Project',
  component: ActionListItemProject,
  parameters: defaultParameters,
  args: {
    name: 'Shared Components Project',
    isClassic: false,
    selectType: 'multiple',
    selected: true,
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemProject>

export default meta
type Story = StoryObj<typeof ActionListItemProject>

export const Example: Story = {
  name: 'ActionListItemProject',
  render: (args: ActionListItemProjectProps) => <ActionListItemProject {...args} />,
  decorators: [
    (Story, {args}) => (
      <ActionList selectionVariant={getActionListSelectionVariant(args.selectType)}>
        <Story />
      </ActionList>
    ),
  ],
}

export const Skeleton: Story = {
  name: 'ActionListItemProjectSkeleton',
  render: (args: {selectType: SelectType}) => <ActionListItemProjectSkeleton {...args} />,
}

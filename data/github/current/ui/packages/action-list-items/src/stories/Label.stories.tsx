import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {getActionListSelectionVariant} from '../../common/helpers'
import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import type {SelectType} from '../../common/types'
import {ActionListItemLabel, type ActionListItemLabelProps, ActionListItemLabelSkeleton} from '../Label'

const meta = {
  title: 'Recipes/ActionListItems/Label',
  component: ActionListItemLabel,
  parameters: defaultParameters,
  args: {
    description: 'Issues identified by VS code team',
    hexColor: 'd73a4a',
    name: 'bug',
    selectType: 'multiple',
    selected: true,
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemLabel>

export default meta
type Story = StoryObj<typeof ActionListItemLabel>

export const Example: Story = {
  name: 'ActionListItemLabel',
  render: (args: ActionListItemLabelProps) => <ActionListItemLabel {...args} />,
  decorators: [
    (Story, {args}) => (
      <ActionList selectionVariant={getActionListSelectionVariant(args.selectType)}>
        <Story />
      </ActionList>
    ),
  ],
}

export const Skeleton: Story = {
  name: 'ActionListItemLabelSkeleton',
  render: (args: {selectType: SelectType}) => <ActionListItemLabelSkeleton {...args} />,
}

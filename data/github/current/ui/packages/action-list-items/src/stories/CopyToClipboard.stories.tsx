import {ActionList} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {defaultArgTypes, defaultParameters} from '../../common/storyDefaults'
import {ActionListItemCopyToClipboard, type ActionListItemCopyToClipboardProps} from '../CopyToClipboard'

const meta = {
  title: 'Recipes/ActionListItems/CopyToClipboard',
  component: ActionListItemCopyToClipboard,
  parameters: defaultParameters,
  args: {
    textToCopy: 'https://github.com',
    children: 'Copy link',
  },
  argTypes: defaultArgTypes,
} satisfies Meta<typeof ActionListItemCopyToClipboard>

export default meta
type Story = StoryObj<typeof ActionListItemCopyToClipboard>

export const Example: Story = {
  name: 'ActionListItemCopyToClipboard',
  render: (args: ActionListItemCopyToClipboardProps) => <ActionListItemCopyToClipboard {...args} />,
  decorators: [
    Story => (
      <ActionList>
        <Story />
      </ActionList>
    ),
  ],
}

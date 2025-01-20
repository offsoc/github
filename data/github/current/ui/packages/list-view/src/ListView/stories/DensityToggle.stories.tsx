import type {Meta, StoryObj} from '@storybook/react'

import {ListViewDensityToggle, type ListViewDensityToggleProps} from '../DensityToggle'
import {ListView} from '../ListView'
import {ListViewMetadata} from '../Metadata'

const meta: Meta<ListViewDensityToggleProps> = {
  title: 'Recipes/ListView/Subcomponents/ListViewDensityToggle',
  component: ListViewDensityToggle,
  args: {
    size: 'medium',
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['small', 'medium'],
    },
  },
}

export default meta
type Story = StoryObj<ListViewDensityToggleProps>

export const Example: Story = {
  name: 'ListViewDensityToggle',
  render: args => <ListViewDensityToggle {...args} />,
  decorators: [
    Story => <ListView title="DensityToggle story list" metadata={<ListViewMetadata densityToggle={<Story />} />} />,
  ],
}

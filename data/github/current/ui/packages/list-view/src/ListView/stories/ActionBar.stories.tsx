import type {Meta, StoryObj} from '@storybook/react'
import type {Component} from 'react'

import {ListViewActionBar, type ListViewActionBarProps} from '../ActionBar'
import {ListView} from '../ListView'
import {ListViewMetadata} from '../Metadata'
import {SampleListViewMetadataWithActions} from './helpers'

const meta: Meta<ListViewActionBarProps> = {
  title: 'Recipes/ListView/Subcomponents/ListViewActionBar',
  component: ListViewActionBar,
}

export default meta
type Story = StoryObj<Component>

export const Example: Story = {
  name: 'ListViewActionBar',
  render: () => <SampleListViewMetadataWithActions />,
  decorators: [
    Story => (
      <ListView
        title="ActionBar story list"
        metadata={
          <ListViewMetadata>
            <Story />
          </ListViewMetadata>
        }
      />
    ),
  ],
}

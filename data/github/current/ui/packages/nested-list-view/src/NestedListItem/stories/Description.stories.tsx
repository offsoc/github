import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateTitle} from '../../stories/helpers'
import {type DescriptionProps, NestedListItemDescription} from '../Description'
import {NestedListItemMainContent} from '../MainContent'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<DescriptionProps> = {
  title: 'Recipes/NestedListView/NestedListItem/Description',
  component: NestedListItemDescription,
  parameters: {
    a11y: {
      config: {
        // Disable role=presentation axe rule on anchor tag
        rules: [
          {id: 'aria-allowed-role', enabled: false},
          {id: 'presentation-role-conflict', enabled: false},
        ],
      },
    },
  },
}

export default meta
type Story = StoryObj<DescriptionProps>

export const Example: Story = {
  render: () => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <NestedListItem key={index} title={<NestedListItemTitle value={title} href="#" />}>
              <NestedListItemMainContent>
                <NestedListItemDescription>This is where the description goes</NestedListItemDescription>
              </NestedListItemMainContent>
            </NestedListItem>
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <NestedListView title="Storybook description">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'Description'

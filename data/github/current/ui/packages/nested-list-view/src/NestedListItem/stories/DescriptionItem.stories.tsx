import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateTitle} from '../../stories/helpers'
import {NestedListItemDescription} from '../Description'
import {NestedListItemDescriptionItem} from '../DescriptionItem'
import {NestedListItemMainContent} from '../MainContent'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta = {
  title: 'Recipes/NestedListView/NestedListItem/DescriptionItem',
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
type Story = StoryObj

export const Example: Story = {
  render: () => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <NestedListItem key={index} title={<NestedListItemTitle value={title} href="#" />}>
              <NestedListItemMainContent>
                <NestedListItemDescription>
                  <NestedListItemDescriptionItem>This is where the description item goes</NestedListItemDescriptionItem>
                </NestedListItemDescription>
              </NestedListItemMainContent>
            </NestedListItem>
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <NestedListView title="Storybook description item">
        <Story />
      </NestedListView>
    ),
  ],
}

Example.storyName = 'DescriptionItem'

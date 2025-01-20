import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateTitle} from '../../stories/helpers'
import {NestedListItemDescription} from '../Description'
import {NestedListItemMainContent} from '../MainContent'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta = {
  title: 'Recipes/NestedListView/NestedListItem/MainContent',
  component: NestedListItemMainContent,
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
            <NestedListItem key={index} title={<NestedListItemTitle value={title} />}>
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
      <NestedListView title="Storybook main content">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'MainContent'

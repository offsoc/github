import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateStatusIcon, generateTitle} from '../../stories/helpers'
import {NestedListItemLeadingContent} from '../LeadingContent'
import {NestedListItemLeadingVisual, type NestedListItemLeadingVisualProps} from '../LeadingVisual'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<NestedListItemLeadingVisualProps> = {
  title: 'Recipes/NestedListView/NestedListItem/LeadingVisual',
  component: NestedListItemLeadingVisual,
}

export default meta
type Story = StoryObj<NestedListItemLeadingVisualProps>

export const Example: Story = {
  render: () => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <NestedListItem key={index} title={<NestedListItemTitle value={title} />}>
              <NestedListItemLeadingContent>
                <NestedListItemLeadingVisual {...generateStatusIcon('Issues')} newActivity={true} />
              </NestedListItemLeadingContent>
            </NestedListItem>
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <NestedListView title="Storybook leading visual">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'LeadingVisual'

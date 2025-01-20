import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateStatusIcon, generateTitle} from '../../stories/helpers'
import {NestedListItemLeadingContent, type NestedListItemLeadingContentProps} from '../LeadingContent'
import {NestedListItemLeadingVisual} from '../LeadingVisual'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<NestedListItemLeadingContentProps> = {
  title: 'Recipes/NestedListView/NestedListItem/LeadingContent',
  component: NestedListItemLeadingContent,
}

export default meta
type Story = StoryObj<NestedListItemLeadingContentProps>

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
      <NestedListView title="Storybook leading content">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'LeadingContent'

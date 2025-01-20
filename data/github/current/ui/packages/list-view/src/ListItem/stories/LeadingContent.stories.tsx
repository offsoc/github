import {IssueOpenedIcon} from '@primer/octicons-react'
import type {Meta, StoryObj} from '@storybook/react'
import {type PropsWithChildren, useMemo} from 'react'

import {ListView} from '../../ListView/ListView'
import {generateTitle} from '../../ListView/stories/helpers'
import {ListItemLeadingContent} from '../LeadingContent'
import {ListItemLeadingVisual} from '../LeadingVisual'
import {ListItem} from '../ListItem'
import {ListItemTitle} from '../Title'

const meta: Meta<PropsWithChildren> = {
  title: 'Recipes/ListView/ListItem/LeadingContent',
  component: ListItemLeadingContent,
}

export default meta
type Story = StoryObj<PropsWithChildren>

export const Example: Story = {
  name: 'LeadingContent',
  render: () => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])

          return (
            <ListItem key={index} title={<ListItemTitle value={title!} />}>
              <ListItemLeadingContent>
                <ListItemLeadingVisual description="an icon of love" icon={IssueOpenedIcon} />
              </ListItemLeadingContent>
            </ListItem>
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <ListView title="LeadingContent list">
        <Story />
      </ListView>
    ),
  ],
}

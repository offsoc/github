import type {Meta, StoryObj} from '@storybook/react'
import {type PropsWithChildren, useMemo} from 'react'

import {ListView} from '../../ListView/ListView'
import {generateTitle} from '../../ListView/stories/helpers'
import {ListItemDescription} from '../Description'
import {ListItem} from '../ListItem'
import {ListItemMainContent} from '../MainContent'
import {ListItemTitle} from '../Title'

const meta: Meta<PropsWithChildren> = {
  title: 'Recipes/ListView/ListItem/MainContent',
  component: ListItemDescription,
}

export default meta
type Story = StoryObj<PropsWithChildren>

export const Example: Story = {
  name: 'MainContent',
  render: () => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])

          return (
            <ListItem key={index} title={<ListItemTitle value={title!} />}>
              <ListItemMainContent>hello this is inside the main content</ListItemMainContent>
            </ListItem>
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <ListView title="MainContent list">
        <Story />
      </ListView>
    ),
  ],
}

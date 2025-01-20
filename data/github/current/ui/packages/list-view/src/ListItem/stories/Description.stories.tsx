import type {Meta, StoryObj} from '@storybook/react'
import {type PropsWithChildren, useMemo} from 'react'

import {ListView} from '../../ListView/ListView'
import {generateDescription, generateTitle} from '../../ListView/stories/helpers'
import {ListItemDescription} from '../Description'
import {ListItem} from '../ListItem'
import {ListItemMainContent} from '../MainContent'
import {ListItemTitle} from '../Title'

const meta: Meta<PropsWithChildren> = {
  title: 'Recipes/ListView/ListItem/Description',
  component: ListItemDescription,
}

export default meta
type Story = StoryObj<PropsWithChildren>

export const Example: Story = {
  name: 'Description',
  render: () => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          const description = useMemo(() => generateDescription('Combo'), [])

          return (
            <ListItem key={index} title={<ListItemTitle value={title!} />}>
              <ListItemMainContent>
                <ListItemDescription>{description}</ListItemDescription>
              </ListItemMainContent>
            </ListItem>
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <ListView title="Description list">
        <Story />
      </ListView>
    ),
  ],
}

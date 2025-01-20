import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {ListView} from '../../ListView/ListView'
import {generateTitle} from '../../ListView/stories/helpers'
import {ListItem} from '../ListItem'
import {ListItemTitle} from '../Title'
import {ListItemTrailingBadge, type ListItemTrailingBadgeProps} from '../TrailingBadge'

const meta: Meta<ListItemTrailingBadgeProps> = {
  title: 'Recipes/ListView/ListItem/TrailingBadge',
  component: ListItemTrailingBadge,
  args: {
    size: 'small',
    title: 'Badge Title',
    variant: 'primary',
  },
  argTypes: {
    size: {
      options: ['small', 'large'],
      control: 'radio',
    },
    title: {
      control: 'text',
      default: 'warning',
    },
    variant: {
      options: ['primary', 'secondary', 'accent', 'success', 'attention', 'severe', 'danger', 'done', 'sponsors'],
      control: 'radio',
    },
  },
}

export default meta
type Story = StoryObj<ListItemTrailingBadgeProps>

export const Example: Story = {
  name: 'TrailingBadge',
  render: args => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <ListItem
              key={index}
              title={<ListItemTitle value={title!} trailingBadges={[<ListItemTrailingBadge key={0} {...args} />]} />}
            />
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <ListView title="TrailingBadge list">
        <Story />
      </ListView>
    ),
  ],
}

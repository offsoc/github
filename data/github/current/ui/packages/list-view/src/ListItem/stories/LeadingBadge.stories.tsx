import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {ListView} from '../../ListView/ListView'
import {generateTitle} from '../../ListView/stories/helpers'
import {ListItemLeadingBadge, type ListItemLeadingBadgeProps} from '../LeadingBadge'
import {ListItem} from '../ListItem'
import {ListItemTitle} from '../Title'

const meta: Meta<ListItemLeadingBadgeProps> = {
  title: 'Recipes/ListView/ListItem/LeadingBadge',
  component: ListItemLeadingBadge,
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
type Story = StoryObj<ListItemLeadingBadgeProps>

export const Example: Story = {
  name: 'LeadingBadge',
  render: args => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <ListItem
              key={index}
              title={<ListItemTitle value={title!} leadingBadge={<ListItemLeadingBadge {...args} />} />}
            />
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <ListView title="LeadingBadge list">
        <Story />
      </ListView>
    ),
  ],
}

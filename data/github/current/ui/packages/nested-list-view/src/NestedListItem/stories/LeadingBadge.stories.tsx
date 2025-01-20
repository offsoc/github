import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateTitle} from '../../stories/helpers'
import {NestedListItemLeadingBadge, type NestedListItemLeadingBadgeProps} from '../LeadingBadge'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'

const meta: Meta<NestedListItemLeadingBadgeProps> = {
  title: 'Recipes/NestedListView/NestedListItem/LeadingBadge',
  component: NestedListItemLeadingBadge,
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
type Story = StoryObj<NestedListItemLeadingBadgeProps>

export const Example: Story = {
  render: args => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <NestedListItem
              key={index}
              title={<NestedListItemTitle value={title} leadingBadge={<NestedListItemLeadingBadge {...args} />} />}
            />
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <NestedListView title="Storybook leading badge">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'LeadingBadge'

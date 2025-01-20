import type {Meta, StoryObj} from '@storybook/react'
import {useMemo} from 'react'

import {NestedListView} from '../../NestedListView'
import {generateTitle} from '../../stories/helpers'
import {NestedListItem} from '../NestedListItem'
import {NestedListItemTitle} from '../Title'
import {NestedListItemTrailingBadge, type NestedListItemTrailingBadgeProps} from '../TrailingBadge'

const meta: Meta<NestedListItemTrailingBadgeProps> = {
  title: 'Recipes/NestedListView/NestedListItem/TrailingBadge',
  component: NestedListItemTrailingBadge,
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
type Story = StoryObj<NestedListItemTrailingBadgeProps>

export const Example: Story = {
  render: args => {
    return (
      <>
        {[0, 1, 2].map(index => {
          const title = useMemo(() => generateTitle('Issues', index), [index])
          return (
            <NestedListItem
              key={index}
              title={
                <NestedListItemTitle
                  value={title}
                  trailingBadges={[<NestedListItemTrailingBadge key={0} {...args} />]}
                />
              }
            />
          )
        })}
      </>
    )
  },
  decorators: [
    Story => (
      <NestedListView title="trailing badge storybook">
        <Story />
      </NestedListView>
    ),
  ],
}
Example.storyName = 'TrailingBadge'

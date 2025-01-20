import type {Meta, StoryObj} from '@storybook/react'
import {TimelineLoadMore} from './TimelineLoadMore'

const meta: Meta<typeof TimelineLoadMore> = {
  title: 'Shared Components/Timeline Items/TimelineLoadMore',
  component: TimelineLoadMore,
}

const args = {
  loadMoreTopFn: () => {},
  loadMoreBottomFn: () => {},
  numberOfTimelineItems: 10,
  type: 'front' as const,
}

type Story = StoryObj<typeof TimelineLoadMore>

export const loadMore: Story = {
  args: {
    ...args,
  },
  render: props => <TimelineLoadMore {...props} />,
}

export default meta

import {Link} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {TimelineRow, type TimelineRowProps} from '../components/Commits/TimelineRow'

const meta = {
  title: 'Apps/Commits/Timeline Row',
  component: TimelineRow,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof TimelineRow>

export default meta

const defaultArgs: Partial<TimelineRowProps> = {}

type Story = StoryObj<typeof TimelineRow>

export const CommitDate: Story = {
  args: {
    ...defaultArgs,
  },
  render: (args: TimelineRowProps) => (
    <TimelineRow {...args}>
      <TimelineRow.Heading as="h3" title="Commits on Nov 20, 2023" />
    </TimelineRow>
  ),
}

export const EndOfFileHistory: Story = {
  render: () => (
    <TimelineRow clipTimeline="bottom">
      <TimelineRow.Heading as="h3" title="End of commit history for this file" />
    </TimelineRow>
  ),
}

export const RenamedFromHistory: Story = {
  render: () => (
    <TimelineRow>
      <div className="d-flex flex-items-baseline">
        <TimelineRow.Heading as="h3" title={`Renamed from old_name.md`} />
        <Link href="#">(Browse History)</Link>
      </div>
    </TimelineRow>
  ),
}

export const RenamedToHistory: Story = {
  render: () => (
    <TimelineRow>
      <div className="d-flex flex-items-baseline">
        <TimelineRow.Heading as="h3" title={`Renamed to new_name.md`} />
        <Link href="#">(Browse History)</Link>
      </div>
    </TimelineRow>
  ),
}

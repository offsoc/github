import type {Meta} from '@storybook/react'
import {TimelineRowBorder, type TimelineRowBorderProps} from './TimelineRowBorder'

const meta = {
  title: 'TimelineEvents/TimelineRowBorder',
  component: TimelineRowBorder,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<TimelineRowBorderProps>

export default meta

const defaultArgs = {
  children: <>Children</>,
  addDivider: false,
  item: {
    __id: 'id',
  },
  isMajor: true,
  isHighlighted: false,
} satisfies TimelineRowBorderProps

export const Example = {
  args: {...defaultArgs},
}

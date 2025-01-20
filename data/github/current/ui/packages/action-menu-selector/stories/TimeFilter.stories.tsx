import type {Meta} from '@storybook/react'
import {TimeFilter, type TimeFilterProps} from '../TimeFilter'

const meta = {
  title: 'ReposComponents/ActionMenuSelector/TimeFilter',
  component: TimeFilter,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof TimeFilter>

export default meta

export const TimeFilterExample = {
  args: {
    currentTimePeriod: 'day',
    onSelect: () => null,
  },
  render: (args: TimeFilterProps) => <TimeFilter {...args} />,
}

import type {Meta} from '@storybook/react'
import {ProgressCircle, type ProgressCircleProps} from './ProgressCircle'
import {colorNames} from '@github-ui/use-named-color'

const meta = {
  title: 'Recipes/ProgressCircle',
  component: ProgressCircle,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    percentCompleted: {control: 'number', defaultValue: 50},
    size: {control: 'select', options: [14, 16], defaultValue: 16},
    color: {
      control: 'select',
      options: colorNames,
      defaultValue: 'PURPLE',
    },
  },
} satisfies Meta<typeof ProgressCircle>

export default meta

const defaultArgs: Partial<ProgressCircleProps> = {
  percentCompleted: 50,
  size: 16,
  color: 'PURPLE',
}

export const ProgressCircleExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: ProgressCircleProps) => <ProgressCircle {...args} />,
}

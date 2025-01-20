import type {Meta} from '@storybook/react'
import {StatusIcon, type StatusIconProps} from './StatusIcon'
import {CheckCircleFillIcon} from '@primer/octicons-react'

const meta = {
  title: 'StatusIcon',
  component: StatusIcon,
  argTypes: {
    absolute: {
      control: 'boolean',
    },
    size: {
      control: 'number',
    },
  },
} satisfies Meta<typeof StatusIcon>

export default meta

const defaultArgs: Partial<StatusIconProps> = {
  icon: CheckCircleFillIcon,
  iconColor: 'success.fg',
  absolute: false,
  size: 20,
}

export const StatusIconExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: StatusIconProps) => <StatusIcon {...args} />,
}

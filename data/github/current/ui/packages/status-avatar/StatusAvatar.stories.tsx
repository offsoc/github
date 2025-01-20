import type {Meta} from '@storybook/react'
import {StatusAvatar, type StatusAvatarProps} from './StatusAvatar'
import {XCircleFillIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'

const meta = {
  title: 'StatusAvatar',
  component: StatusAvatar,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof StatusAvatar>

export default meta

const defaultArgs: Partial<StatusAvatarProps> = {
  zIndex: {zIndex: 1},
  altText: 'status avatar',
  hovercardUrl: '',
  src: 'https://avatars.githubusercontent.com/u/583231?v=4',
  square: false,
  icon: XCircleFillIcon,
  iconColor: 'success.fg',
}

export const StatusAvatarExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: StatusAvatarProps) => (
    <Box sx={{height: '20px', width: '20px'}}>
      <StatusAvatar {...args} />
    </Box>
  ),
}

import type {Meta} from '@storybook/react'
import {FileStatusIcon} from './FileStatusIcon'

type FileStatusIconProps = React.ComponentProps<typeof FileStatusIcon>

const args = {
  status: 'MODIFIED',
} satisfies FileStatusIconProps

const meta = {
  title: 'FileStatusIcon',
  component: FileStatusIcon,
} satisfies Meta<typeof FileStatusIcon>

export default meta

export const StatusIcon = {args}

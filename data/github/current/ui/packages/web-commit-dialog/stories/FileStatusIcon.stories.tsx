import type {Meta} from '@storybook/react'

import {FileStatusIcon, type FileStatusIconProps} from '../FileStatusIcon'

const meta = {
  title: 'Recipes/WebCommitDialog/Subcomponents/FileStatusIcon',
  component: FileStatusIcon,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    status: {control: {type: 'text'}},
  },
} satisfies Meta<typeof FileStatusIcon>

export default meta

const defaultArgs: Partial<FileStatusIconProps> = {
  status: 'M',
}

export const FileStatusIconExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: FileStatusIconProps) => <FileStatusIcon {...args} />,
}

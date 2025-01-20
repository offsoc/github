import type {Meta} from '@storybook/react'
import {RepositoryTypeIcon, type RepositoryTypeIconProps} from '../RepositoryTypeIcon'

const meta = {
  title: 'Security Campaigns/Repository Type Icon',
  component: RepositoryTypeIcon,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof RepositoryTypeIcon>

export default meta

const defaultArgs: Partial<RepositoryTypeIconProps> = {
  typeIcon: 'repo',
}

export const PublicRepository = {
  args: defaultArgs,
  render: (args: RepositoryTypeIconProps) => <RepositoryTypeIcon {...args} />,
}

export const PrivateRepository = {
  args: {
    ...defaultArgs,
    typeIcon: 'lock',
  },
  render: (args: RepositoryTypeIconProps) => <RepositoryTypeIcon {...args} />,
}

export const ForkedRepository = {
  args: {
    ...defaultArgs,
    typeIcon: 'repo-forked',
  },
  render: (args: RepositoryTypeIconProps) => <RepositoryTypeIcon {...args} />,
}

export const MirrorRepository = {
  args: {
    ...defaultArgs,
    typeIcon: 'mirror',
  },
  render: (args: RepositoryTypeIconProps) => <RepositoryTypeIcon {...args} />,
}

import type {Meta} from '@storybook/react'
import {RepositoryLabel, type RepositoryLabelProps} from '../RepositoryLabel'

const meta = {
  title: 'Security Campaigns/Repository Label',
  component: RepositoryLabel,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof RepositoryLabel>

export default meta

const defaultArgs: Partial<RepositoryLabelProps> = {
  name: 'security-campaigns',
  typeIcon: 'repo',
}

export const PublicRepository = {
  args: defaultArgs,
  render: (args: RepositoryLabelProps) => <RepositoryLabel {...args} />,
}

export const PrivateRepository = {
  args: {
    ...defaultArgs,
    typeIcon: 'lock',
  },
  render: (args: RepositoryLabelProps) => <RepositoryLabel {...args} />,
}

export const ForkedRepository = {
  args: {
    ...defaultArgs,
    typeIcon: 'repo-forked',
  },
  render: (args: RepositoryLabelProps) => <RepositoryLabel {...args} />,
}

export const MirrorRepository = {
  args: {
    ...defaultArgs,
    typeIcon: 'mirror',
  },
  render: (args: RepositoryLabelProps) => <RepositoryLabel {...args} />,
}

import type {Repository} from '@github-ui/current-repository'
import {Box} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'

import {CommitActionBar, type CommitActionBarProps} from '../components/Commits/CommitActionBar'
import type {Commit} from '../types/shared'

const meta = {
  title: 'Apps/Commits/Commit Row/Action Bar Menu',
  component: CommitActionBar,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof CommitActionBar>

export default meta

const defaultArgs: Partial<CommitActionBarProps> = {
  commit: {
    oid: '9e25330ad266c97edbe7b6712b2d1cceaf8ded55',
  } as Commit,
  repo: {
    ownerLogin: 'monalisa',
    name: 'smile',
    id: 1,
  } as Repository,
}

type Story = StoryObj<typeof CommitActionBar>

export const RepositoryActions: Story = {
  args: {
    ...defaultArgs,
  },
  render: (args: CommitActionBarProps) => <CommitActionBar {...args} />,
  decorators: [
    Story => (
      <Box
        sx={{
          border: '3px dashed',
          borderColor: 'border.subtle',
          borderRadius: 1,
          width: '200px',
          p: '2px',
        }}
      >
        <Story />
      </Box>
    ),
  ],
}

export const PathActions: Story = {
  args: {
    ...defaultArgs,
    path: '/readme.md',
  },
  render: (args: CommitActionBarProps) => <CommitActionBar {...args} />,
  decorators: [
    Story => (
      <Box
        sx={{
          border: '3px dashed',
          borderColor: 'border.subtle',
          borderRadius: 1,
          width: '200px',
          p: '2px',
        }}
      >
        <Story />
      </Box>
    ),
  ],
}

import {createRepository} from '@github-ui/current-repository/test-helpers'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'

import {CommitGroup} from '../components/Commits/CommitGroup'
import {generateCommitGroups} from '../shared/test-helpers'

const meta = {
  title: 'Apps/Commits/Commit Group',
  component: CommitGroup,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta

export default meta

const defaultArgs = {
  repo: createRepository(),
  commitGroups: generateCommitGroups(1, 3, true),
}

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CommitGroup
        commits={defaultArgs.commitGroups[0]?.commits ?? []}
        title="Nov 20, 2023"
        shouldClipTimeline={true}
        repo={defaultArgs.repo}
      />
    </Wrapper>
  ),
}

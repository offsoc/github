import {createRepository} from '@github-ui/current-repository/test-helpers'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'

import {deferredData} from '../test-utils/mock-data'
import {Commits, type CommitsProps} from './Commits'
import {generateCommitGroups} from './test-helpers'

const meta = {
  title: 'Apps/Commits/Shared/Commits',
  component: Commits,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof Commits>

export default meta

const defaultArgs: Partial<CommitsProps> = {
  repository: createRepository(),
  commitGroups: generateCommitGroups(2, 5, true),
  deferredCommitData: deferredData,
  shouldClipTimeline: true,
}

type Story = StoryObj<typeof Commits>

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  render: (args: CommitsProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <Commits {...args} />
    </Wrapper>
  ),
}

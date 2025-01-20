import {createRepository} from '@github-ui/current-repository/test-helpers'
import {ListView} from '@github-ui/list-view'
import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'

import {CommitRow, type CommitRowProps} from '../components/Commits/CommitRow'
import {generateCommitMessages, sampleCommitRowData} from '../test-utils/mock-data'

const meta = {
  title: 'Apps/Commits/Commit Row',
  component: CommitRow,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof CommitRow>

export default meta

const defaultArgs: Partial<CommitRowProps> = {
  repo: createRepository(),
  commit: {...sampleCommitRowData, ...generateCommitMessages()},
}

type Story = StoryObj<typeof CommitRow>

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  render: (args: CommitRowProps) => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <ListView title={'Commits on Nov 20, 2023'}>
        <CommitRow {...args} />
      </ListView>
    </Wrapper>
  ),
}

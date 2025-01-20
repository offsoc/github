import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {UnpinnedEvent} from '../../components/UnpinnedEvent'

const meta = {
  title: 'TimelineEvents/UnpinnedEvent',
  component: UnpinnedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof UnpinnedEvent>

export default meta

const node = {
  __typename: 'UnpinnedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  lockReason: 'off-topic',
}

export const Example = getExample([relayDecorator<typeof UnpinnedEvent, IssuesTimelineQueries>], node)

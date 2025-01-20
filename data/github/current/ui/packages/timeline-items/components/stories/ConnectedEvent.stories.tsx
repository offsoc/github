import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {ConnectedEvent} from '../../components/ConnectedEvent'

const meta = {
  title: 'TimelineEvents/ConnectedEvent',
  component: ConnectedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof ConnectedEvent>

export default meta

const node = {
  __typename: 'ConnectedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  subject: {
    __typename: 'PullRequest',
    databaseId: 1232,
    title: '[Bug] Fix on click not being fired',
    url: 'issue.url',
    number: 123,
    state: 'OPEN',
    isDraft: false,
    isInMergeQueue: false,
    repository: {
      name: 'repo-name',
      owner: {
        login: 'repo-owner',
      },
    },
  },
}

export const Example = getExample([relayDecorator<typeof ConnectedEvent, IssuesTimelineQueries>], node)

import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {CrossReferencedEvent} from '../../components/CrossReferencedEvent'

const meta = {
  title: 'TimelineEvents/CrossReferencedEvent',
  component: CrossReferencedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof CrossReferencedEvent>

export default meta

const node = [
  {
    __typename: 'CrossReferencedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    referencedAt: '2022-07-26T11:46:07Z',
    willCloseTarget: true,
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    source: {
      __typename: 'PullRequest',
      databaseId: 1232,
      title: 'Write the epic update',
      url: 'issue.url',
      number: 123,
      state: 'OPEN',
      isDraft: false,
      isInMergeQueue: true,
      repository: {
        name: 'repo-name',
        owner: {
          login: 'repo-owner',
        },
      },
    },
  },
  {
    __typename: 'CrossReferencedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    referencedAt: '2022-07-26T11:46:07Z',
    willCloseTarget: true,
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    source: {
      __typename: 'PullRequest',
      issueDatabaseId: 1232,
      title: 'Write the epic update',
      url: 'issue.url',
      number: 123,
      state: 'OPEN',
      isDraft: true,
      isInMergeQueue: false,
      repository: {
        name: 'repo-name',
        owner: {
          login: 'repo-owner',
        },
      },
    },
  },
]

export const PullInMergeQueue = getExample(
  [relayDecorator<typeof CrossReferencedEvent, IssuesTimelineQueries>],
  node[0]!,
)
export const PullIsDraft = getExample([relayDecorator<typeof CrossReferencedEvent, IssuesTimelineQueries>], node[1]!)

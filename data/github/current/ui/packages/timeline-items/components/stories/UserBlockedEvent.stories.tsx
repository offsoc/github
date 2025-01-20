import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {UserBlockedEvent} from '../../components/UserBlockedEvent'

const meta = {
  title: 'TimelineEvents/UserBlockedEvent',
  component: UserBlockedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof UserBlockedEvent>

export default meta

const node = [
  {
    __typename: 'UserBlockedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    blockDuration: 'ONE_MONTH',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    blockedUser: {
      login: 'ginko',
    },
  },
  {
    __typename: 'UserBlockedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    blockDuration: 'PERMANENT',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    blockedUser: {
      login: 'ginko-must-go',
    },
  },
]

export const Temporary = getExample([relayDecorator<typeof UserBlockedEvent, IssuesTimelineQueries>], node[0]!)
export const Permanent = getExample([relayDecorator<typeof UserBlockedEvent, IssuesTimelineQueries>], node[1]!)

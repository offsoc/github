import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {AssignedEvent} from '../../components/AssignedEvent'

const meta = {
  title: 'TimelineEvents/AssignedEvent',
  component: AssignedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof AssignedEvent>

export default meta

const node = [
  {
    __typename: 'AssignedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    assignee: {
      __typename: 'User',
      login: 'monafree',
    },
  },
  {
    __typename: 'AssignedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    assignee: {
      __typename: 'User',
      login: 'monalisa',
    },
  },
  {
    __typename: 'AssignedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    assignee: {
      __typename: 'Mannequin',
      login: 'mannequin',
    },
  },
  {
    __typename: 'AssignedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    assignee: {
      __typename: 'Organization',
      login: 'github-org',
    },
  },
  {
    __typename: 'AssignedEvent',
    databaseId: 1232,
    createdAt: '2022-07-26T11:46:07Z',
    actor: {
      __typename: 'User',
      login: 'monalisa',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    },
    assignee: {
      __typename: 'Bot',
      login: 'chat-gpt-bot',
    },
  },
]

export const Assigned_User = getExample([relayDecorator<typeof AssignedEvent, IssuesTimelineQueries>], node[0]!)
export const Self_Assigned = getExample([relayDecorator<typeof AssignedEvent, IssuesTimelineQueries>], node[1]!)
export const Assigned_Mannequin = getExample([relayDecorator<typeof AssignedEvent, IssuesTimelineQueries>], node[2]!)
export const Assigned_Org = getExample([relayDecorator<typeof AssignedEvent, IssuesTimelineQueries>], node[3]!)
export const Assigned_Bot = getExample([relayDecorator<typeof AssignedEvent, IssuesTimelineQueries>], node[4]!)

import type {Meta} from '@storybook/react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {ClosedEvent} from '../../components/ClosedEvent'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'

const closedEventNode = {
  __typename: 'ClosedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  closer: {
    __typename: 'Commit',
    url: 'https://commit.link',
    abbreviatedOid: '1234',
    repository: {
      name: 'MyRepo',
      owner: {
        login: 'monalisa',
      },
    },
  },
  stateReason: undefined,
}

const closedByProjectEventNode = {
  __typename: 'ClosedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  closingProjectItemStatus: 'closed',
  closer: {
    __typename: 'ProjectV2',
    title: 'My Project',
    url: 'https://project.link',
  },
  stateReason: undefined,
}

const notPlannedEventNode = {
  ...closedEventNode,
  stateReason: 'NOT_PLANNED',
}

const meta = {
  title: 'TimelineEvents/ClosedEvent',
  component: ClosedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof ClosedEvent>

export default meta

export const ClosedExample = getExample([relayDecorator<typeof ClosedEvent, IssuesTimelineQueries>], closedEventNode)
export const ClosedByProjectExample = getExample(
  [relayDecorator<typeof ClosedEvent, IssuesTimelineQueries>],
  closedByProjectEventNode,
)
export const NotPlannedExample = getExample(
  [relayDecorator<typeof ClosedEvent, IssuesTimelineQueries>],
  notPlannedEventNode,
)

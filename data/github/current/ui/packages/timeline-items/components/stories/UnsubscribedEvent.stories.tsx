import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {UnsubscribedEvent} from '../../components/UnsubscribedEvent'

const meta = {
  title: 'TimelineEvents/UnsubscribedEvent',
  component: UnsubscribedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof UnsubscribedEvent>

export default meta

const node = {
  __typename: 'UnsubscribedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
}

export const Example = getExample([relayDecorator<typeof UnsubscribedEvent, IssuesTimelineQueries>], node)

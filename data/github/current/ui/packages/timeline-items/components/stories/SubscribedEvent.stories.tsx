import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {SubscribedEvent} from '../../components/SubscribedEvent'

const meta = {
  title: 'TimelineEvents/SubscribedEvent',
  component: SubscribedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof SubscribedEvent>

export default meta

const node = {
  __typename: 'SubscribedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
}

export const Example = getExample([relayDecorator<typeof SubscribedEvent, IssuesTimelineQueries>], node)

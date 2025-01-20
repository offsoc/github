import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {DemilestonedEvent} from '../../components/DemilestonedEvent'

const meta = {
  title: 'TimelineEvents/DemilestonedEvent',
  component: DemilestonedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof DemilestonedEvent>

export default meta

const node = {
  __typename: 'DemilestonedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  milestoneTitle: 'v1.0',
  milestone: {
    url: 'milestone.url',
  },
}

export const Example = getExample([relayDecorator<typeof DemilestonedEvent, IssuesTimelineQueries>], node)

import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {MilestonedEvent} from '../../components/MilestonedEvent'

const meta = {
  title: 'TimelineEvents/MilestonedEvent',
  component: MilestonedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof MilestonedEvent>

export default meta

const node = {
  __typename: 'MilestonedEvent',
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

export const Example = getExample([relayDecorator<typeof MilestonedEvent, IssuesTimelineQueries>], node)

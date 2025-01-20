import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {ConvertedToDiscussionEvent} from '../../components/ConvertedToDiscussionEvent'

const meta = {
  title: 'TimelineEvents/ConvertedToDiscussionEvent',
  component: ConvertedToDiscussionEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof ConvertedToDiscussionEvent>

export default meta

const node = {
  __typename: 'ConvertedToDiscussionEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  discussion: {
    number: 3,
    url: 'https://discussion.link',
  },
}

export const Example = getExample([relayDecorator<typeof ConvertedToDiscussionEvent, IssuesTimelineQueries>], node)

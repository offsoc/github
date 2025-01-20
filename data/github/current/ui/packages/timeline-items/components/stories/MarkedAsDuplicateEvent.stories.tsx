import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {MarkedAsDuplicateEvent} from '../../components/MarkedAsDuplicateEvent'

const meta = {
  title: 'TimelineEvents/MarkedAsDuplicateEvent',
  component: MarkedAsDuplicateEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof MarkedAsDuplicateEvent>

export default meta

const node = {
  __typename: 'MarkedAsDuplicateEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  canonical: {
    __typename: 'Issue',
    url: 'issue.url',
    number: 123,
  },
}

export const Example = getExample([relayDecorator<typeof MarkedAsDuplicateEvent, IssuesTimelineQueries>], node)

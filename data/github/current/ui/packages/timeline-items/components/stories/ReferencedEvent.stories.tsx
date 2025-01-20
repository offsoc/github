import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {ReferencedEvent} from '../../components/ReferencedEvent'

const meta = {
  title: 'TimelineEvents/ReferencedEvent',
  component: ReferencedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof ReferencedEvent>

export default meta

const node = {
  __typename: 'ReferencedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  commit: {
    message:
      'This is fixing issue github/issues#123 \
        and also github/issues#124 \
        There is a lot of text here that is not visible in the UI ',
    url: 'commit.url',
    abbreviatedOid: 'commit-oid',
    repository: {
      name: 'issues',
      owner: {
        login: 'github',
      },
    },
  },
}

export const Example = getExample([relayDecorator<typeof ReferencedEvent, IssuesTimelineQueries>], node)

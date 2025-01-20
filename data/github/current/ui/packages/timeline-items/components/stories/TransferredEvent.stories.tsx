import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {TransferredEvent} from '../../components/TransferredEvent'

const meta = {
  title: 'TimelineEvents/TransferredEvent',
  component: TransferredEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof TransferredEvent>

export default meta

const node = {
  __typename: 'TransferredEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  fromRepository: {
    nameWithOwner: 'github/repo',
    url: 'fromRepository.url',
  },
}

export const Example = getExample([relayDecorator<typeof TransferredEvent, IssuesTimelineQueries>], node)

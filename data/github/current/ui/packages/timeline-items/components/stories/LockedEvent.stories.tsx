import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {LockedEvent} from '../../components/LockedEvent'

const meta = {
  title: 'TimelineEvents/LockedEvent',
  component: LockedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof LockedEvent>

export default meta

const node = {
  __typename: 'LockedEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  lockReason: 'OFF_TOPIC',
}

export const Example = getExample([relayDecorator<typeof LockedEvent, IssuesTimelineQueries>], node)

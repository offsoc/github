import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {RenamedTitleEvent} from '../../components/RenamedTitleEvent'

const meta = {
  title: 'TimelineEvents/RenamedTitleEvent',
  component: RenamedTitleEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof RenamedTitleEvent>

export default meta

const node = {
  __typename: 'RenamedTitleEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  currentTitle: 'Add storybook for all events',
  previousTitle: 'Add storybook for Unlabeled',
}

export const Example = getExample([relayDecorator<typeof RenamedTitleEvent, IssuesTimelineQueries>], node)

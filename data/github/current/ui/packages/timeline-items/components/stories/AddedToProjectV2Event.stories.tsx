// eslint-disable-next-line filenames/match-regex
import type {Meta} from '@storybook/react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {AddedToProjectV2Event} from '../AddedToProjectV2Event'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'

const meta = {
  title: 'TimelineEvents/AddedToProjectV2Event',
  component: AddedToProjectV2Event,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof AddedToProjectV2Event>

export default meta

const node = {
  __typename: 'AddedToProjectV2Event',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  project: {
    title: 'My Memex',
    url: 'https://project.link',
  },
  projectColumnName: 'MyColumn',
}

export const Example = getExample([relayDecorator<typeof AddedToProjectV2Event, IssuesTimelineQueries>], node)

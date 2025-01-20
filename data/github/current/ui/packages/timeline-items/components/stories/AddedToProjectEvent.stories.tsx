import type {Meta} from '@storybook/react'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {AddedToProjectEvent} from '../AddedToProjectEvent'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'

const meta = {
  title: 'TimelineEvents/AddedToProjectEvent',
  component: AddedToProjectEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof AddedToProjectEvent>

export default meta

const node = {
  __typename: 'AddedToProjectEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  project: {
    name: 'My cool Project',
    url: 'https://project.link',
  },
  projectColumnName: 'MyColumn',
}

export const Example = getExample([relayDecorator<typeof AddedToProjectEvent, IssuesTimelineQueries>], node)

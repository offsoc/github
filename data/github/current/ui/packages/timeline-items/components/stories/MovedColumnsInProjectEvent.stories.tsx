import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {MovedColumnsInProjectEvent} from '../../components/MovedColumnsInProjectEvent'

const meta = {
  title: 'TimelineEvents/MovedColumnsInProjectEvent',
  component: MovedColumnsInProjectEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof MovedColumnsInProjectEvent>

export default meta

const node = {
  __typename: 'MovedColumnsInProjectEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  project: {
    name: 'MyProject',
    url: 'https://project.link',
  },
  previousProjectColumnName: 'To Do',
  projectColumnName: 'In Progress',
}

export const Example = getExample([relayDecorator<typeof MovedColumnsInProjectEvent, IssuesTimelineQueries>], node)

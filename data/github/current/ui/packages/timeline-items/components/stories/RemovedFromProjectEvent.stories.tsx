import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {RemovedFromProjectEvent} from '../../components/RemovedFromProjectEvent'

const meta = {
  title: 'TimelineEvents/RemovedFromProjectEvent',
  component: RemovedFromProjectEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof RemovedFromProjectEvent>

export default meta

const node = {
  __typename: 'RemovedFromProjectEvent',
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
  projectColumnName: 'To Do',
}

export const Example = getExample([relayDecorator<typeof RemovedFromProjectEvent, IssuesTimelineQueries>], node)

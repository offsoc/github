import type {Meta} from '@storybook/react'
import {ConvertedNoteToIssueEvent} from '../../components/ConvertedNoteToIssueEvent'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {Wrapper} from '@github-ui/react-core/test-utils'

const meta = {
  title: 'TimelineEvents/ConvertedNoteToIssueEvent',
  component: ConvertedNoteToIssueEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof ConvertedNoteToIssueEvent>

export default meta

const node = {
  __typename: 'ConvertedNoteToIssueEvent',
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
  projectColumnName: 'MyColumn',
}

export const Example = getExample([relayDecorator<typeof ConvertedNoteToIssueEvent, IssuesTimelineQueries>], node)

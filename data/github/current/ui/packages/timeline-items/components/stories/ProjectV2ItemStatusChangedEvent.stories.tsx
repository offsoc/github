// eslint-disable-next-line filenames/match-regex
import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {ProjectV2ItemStatusChangedEvent} from '../../components/ProjectV2ItemStatusChangedEvent'

const meta = {
  title: 'TimelineEvents/ProjectV2ItemStatusChangedEvent',
  component: ProjectV2ItemStatusChangedEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof ProjectV2ItemStatusChangedEvent>

export default meta

const node = {
  __typename: 'ProjectV2ItemStatusChangedEvent',
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
  previousStatus: 'In progress',
  status: 'Done',
}

export const Example = getExample([relayDecorator<typeof ProjectV2ItemStatusChangedEvent, IssuesTimelineQueries>], node)

// eslint-disable-next-line filenames/match-regex
import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {RemovedFromProjectV2Event} from '../../components/RemovedFromProjectV2Event'

const meta = {
  title: 'TimelineEvents/RemovedFromProjectV2Event',
  component: RemovedFromProjectV2Event,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof RemovedFromProjectV2Event>

export default meta

const node = {
  __typename: 'RemovedFromProjectV2Event',
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
}

export const Example = getExample([relayDecorator<typeof RemovedFromProjectV2Event, IssuesTimelineQueries>], node)

import type {Meta} from '@storybook/react'
import {getExample, type IssuesTimelineQueries} from './IssueEventWrapper'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {relayDecorator} from '@github-ui/relay-test-utils/storybook'
import {LabeledEvent} from '../../components/LabeledEvent'

const meta = {
  title: 'TimelineEvents/LabeledEvent',
  component: LabeledEvent,
  decorators: [
    Story => (
      <Wrapper>
        <Story />
      </Wrapper>
    ),
  ],
} satisfies Meta<typeof LabeledEvent>

export default meta

const node = {
  __typename: 'LabeledEvent',
  databaseId: 1232,
  createdAt: '2022-07-26T11:46:07Z',
  actor: {
    __typename: 'User',
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  },
  label: {
    __typename: 'Label',
    nameHTML: 'bug',
    name: 'bug',
    color: 'd73a4a',
    id: 'MDU6TGFiZWwyMjE3OTI4MjE=',
    repository: {
      name: 'example-repo',
      owner: {
        login: 'example-owner',
      },
    },
  },
}

export const Example = getExample([relayDecorator<typeof LabeledEvent, IssuesTimelineQueries>], node)

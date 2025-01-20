import {Box, Link, Text} from '@primer/react'
import type {Meta, StoryObj} from '@storybook/react'
import type React from 'react'

import {getDocsetMock, getRepositoryMock} from '../test-utils/mock-data'
import {CanIndexStatus, type IndexingState, TopicIndexStatus} from '../utils/copilot-chat-hooks'
import {TopicIndexState, type TopicIndexStateProps} from './TopicIndexState'

const meta = {
  title: 'Apps/Copilot/TopicIndexState',
  component: TopicIndexState,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof TopicIndexState>

export default meta

const indexedState: IndexingState = {
  code: TopicIndexStatus.Indexed,
  docs: TopicIndexStatus.Indexed,
  requestStatus: CanIndexStatus.CanIndex,
}

const unindexedState: IndexingState = {
  code: TopicIndexStatus.Unindexed,
  docs: TopicIndexStatus.Unindexed,
  requestStatus: CanIndexStatus.CanIndex,
}

const indexingState: IndexingState = {
  code: TopicIndexStatus.Indexing,
  docs: TopicIndexStatus.Indexing,
  requestStatus: CanIndexStatus.CanIndex,
}

const defaultArgs: TopicIndexStateProps = {
  currentTopic: getDocsetMock(),
  indexingState: indexedState,
  okToIndex: false,
  triggerIndexing: () => {},
}

const disclaimerText = (
  <Text as="p" sx={{mb: 0}}>
    Copilot is powered by AI, so mistakes are possible. Review output carefully before use.{' '}
    <Link
      inline
      href="https://docs.github.com/en/copilot/github-copilot-enterprise/copilot-chat-in-github/about-github-copilot-chat"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn more about GitHub Copilot Chat.
    </Link>
  </Text>
)

// eslint-disable-next-line @typescript-eslint/ban-types
const Container = ({children}: React.PropsWithChildren<{}>) => (
  <Box
    sx={{
      paddingLeft: 'calc(50% - 360px)',
      paddingRight: 'calc(50% - 375px)',
    }}
  >
    <Box sx={{border: '1px solid var(--borderColor-default, var(--color-border-default))', borderRadius: '6px'}}>
      <Box sx={{p: 3}}>{disclaimerText}</Box>
      {children}
    </Box>
  </Box>
)

export const IndexedDocset: StoryObj<TopicIndexStateProps> = {
  args: {...defaultArgs},
  render: args => (
    <Container>
      <TopicIndexState {...args} />
    </Container>
  ),
}

export const UnindexedDocset: StoryObj<TopicIndexStateProps> = {
  args: {...defaultArgs, indexingState: unindexedState, okToIndex: true},
  render: args => (
    <Container>
      <TopicIndexState {...args} />
    </Container>
  ),
}

export const IndexingDocset: StoryObj<TopicIndexStateProps> = {
  args: {...defaultArgs, indexingState},
  render: args => (
    <Container>
      <TopicIndexState {...args} />
    </Container>
  ),
}

export const IndexedRepo: StoryObj<TopicIndexStateProps> = {
  args: {...defaultArgs, currentTopic: getRepositoryMock()},
  render: args => (
    <Container>
      <TopicIndexState {...args} />
    </Container>
  ),
}

export const UnindexedRepo: StoryObj<TopicIndexStateProps> = {
  args: {...defaultArgs, currentTopic: getRepositoryMock(), indexingState: unindexedState, okToIndex: true},
  render: args => (
    <Container>
      <TopicIndexState {...args} />
    </Container>
  ),
}

export const IndexingRepo: StoryObj<TopicIndexStateProps> = {
  args: {...defaultArgs, currentTopic: getRepositoryMock(), indexingState},
  render: args => (
    <Container>
      <TopicIndexState {...args} />
    </Container>
  ),
}

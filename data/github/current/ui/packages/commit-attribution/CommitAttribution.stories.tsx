import type {Meta} from '@storybook/react'
import type {Repository} from '@github-ui/current-repository'
import {CommitAttribution, type CommitAttributionProps} from './CommitAttribution'
import {ghost, github, hubot, monalisa, webflow} from './test-utils/mock-data'

const meta = {
  title: 'ReposComponents/CommitAttribution',
  component: CommitAttribution,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof CommitAttribution>

export default meta

const defaultArgs: Partial<CommitAttributionProps> = {
  repo: {
    ownerLogin: 'monalisa',
    name: 'smile',
    id: 1,
  } as Repository,
  includeVerbs: true,
}

export const SingleAuthor = {
  args: {
    ...defaultArgs,
    authors: [monalisa],
    committer: webflow,
    committerAttribution: false,
  },
  render: (args: CommitAttributionProps) => <CommitAttribution {...args} />,
}

export const AuthorAndCommitter = {
  args: {
    ...defaultArgs,
    authors: [hubot],
    committer: monalisa,
    committerAttribution: true,
  },
  render: (args: CommitAttributionProps) => <CommitAttribution {...args} />,
}

export const TwoAuthors = {
  args: {
    ...defaultArgs,
    authors: [hubot, monalisa],
    committer: monalisa,
    committerAttribution: false,
  },
  render: (args: CommitAttributionProps) => <CommitAttribution {...args} />,
}

export const MultipleAuthors = {
  args: {
    ...defaultArgs,
    authors: [monalisa, hubot, ghost],
    committer: monalisa,
    committerAttribution: false,
  },
  render: (args: CommitAttributionProps) => <CommitAttribution {...args} />,
}

export const OnBehalfOfOrg = {
  args: {
    ...defaultArgs,
    authors: [monalisa],
    committer: monalisa,
    committerAttribution: false,
    onBehalfOf: github,
  },
  render: (args: CommitAttributionProps) => <CommitAttribution {...args} />,
}

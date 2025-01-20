import type {Meta} from '@storybook/react'
import {subDays, subHours, subMinutes} from 'date-fns'
import {AlertLinksButton, type AlertLinksButtonProps} from '../AlertLinksButton'
import {createLinkedBranch, createLinkedPullRequest, createRepository} from '../../test-utils/mock-data'

const meta = {
  title: 'Apps/Security Campaigns/Alert links button',
  component: AlertLinksButton,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {},
} satisfies Meta<typeof AlertLinksButton>

export default meta

const defaultArgs: AlertLinksButtonProps = {
  linkedPullRequests: [],
  linkedBranches: [],
  repository: createRepository(),
}

export const NoLinks = {
  args: {
    ...defaultArgs,
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const OpenPullRequest = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        state: 'open',
        closedAt: null,
        mergedAt: null,
        draft: false,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const OpenPullRequestWithSingleBranch = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [...OpenPullRequest.args.linkedPullRequests],
    linkedBranches: [createLinkedBranch()],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const OpenPullRequestWithMultipleBranches = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [...OpenPullRequest.args.linkedPullRequests],
    linkedBranches: [
      createLinkedBranch({
        name: 'fix1',
      }),
      createLinkedBranch({name: 'fix/security-campaigns'}),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const OpenDraftPullRequest = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        state: 'open',
        closedAt: null,
        mergedAt: null,
        draft: true,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const ClosedDraftPullRequest = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        state: 'closed',
        closedAt: subDays(new Date(), 2).toISOString(),
        mergedAt: null,
        draft: true,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const MergedPullRequest = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        state: 'closed',
        closedAt: subDays(new Date(), 2).toISOString(),
        mergedAt: subDays(new Date(), 2).toISOString(),
        draft: false,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const ClosedPullRequest = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        state: 'closed',
        closedAt: subDays(new Date(), 2).toISOString(),
        mergedAt: null,
        draft: false,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const MultiplePullRequests = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        number: 125,
        title: 'wait for task reconnection before allowing tasks to run',
        state: 'open',
        createdAt: subMinutes(new Date(), 25).toISOString(),
        closedAt: null,
        mergedAt: null,
        draft: false,
      }),
      createLinkedPullRequest({
        number: 120,
        title: 'Add `--entry` argv to filter build bundles',
        state: 'open',
        createdAt: subMinutes(new Date(), 44).toISOString(),
        closedAt: null,
        mergedAt: null,
        draft: true,
      }),
      createLinkedPullRequest({
        number: 351,
        title: 'Add support for transition{run,start,cancel} events',
        state: 'closed',
        createdAt: subMinutes(new Date(), 50).toISOString(),
        closedAt: subMinutes(new Date(), 15).toISOString(),
        mergedAt: subMinutes(new Date(), 15).toISOString(),
        draft: false,
      }),
      createLinkedPullRequest({
        number: 123,
        title: 'Bump undefsafe from 2.0.2 to 2.05',
        state: 'closed',
        createdAt: subHours(new Date(), 5).toISOString(),
        closedAt: subHours(new Date(), 3).toISOString(),
        mergedAt: null,
        draft: false,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const MultiplePullRequestsWithBranches = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [...MultiplePullRequests.args.linkedPullRequests],
    linkedBranches: [
      createLinkedBranch({
        name: 'campaign-fix-1',
      }),
      createLinkedBranch({
        name: 'campaign-fix-2',
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const MultipleMergedPullRequests = {
  args: {
    ...defaultArgs,
    linkedPullRequests: [
      createLinkedPullRequest({
        number: 125,
        title: 'wait for task reconnection before allowing tasks to run',
        state: 'closed',
        createdAt: subMinutes(new Date(), 25).toISOString(),
        closedAt: subMinutes(new Date(), 5).toISOString(),
        mergedAt: subMinutes(new Date(), 5).toISOString(),
        draft: false,
      }),
      createLinkedPullRequest({
        number: 120,
        title: 'Add `--entry` argv to filter build bundles',
        state: 'closed',
        createdAt: subMinutes(new Date(), 44).toISOString(),
        closedAt: subMinutes(new Date(), 22).toISOString(),
        mergedAt: subMinutes(new Date(), 22).toISOString(),
        draft: false,
      }),
      createLinkedPullRequest({
        number: 351,
        title: 'Add support for transition{run,start,cancel} events',
        state: 'closed',
        createdAt: subMinutes(new Date(), 50).toISOString(),
        closedAt: subMinutes(new Date(), 15).toISOString(),
        mergedAt: subMinutes(new Date(), 15).toISOString(),
        draft: false,
      }),
      createLinkedPullRequest({
        number: 123,
        title: 'Bump undefsafe from 2.0.2 to 2.05',
        state: 'closed',
        createdAt: subHours(new Date(), 5).toISOString(),
        closedAt: subHours(new Date(), 3).toISOString(),
        mergedAt: subHours(new Date(), 3).toISOString(),
        draft: false,
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const SingleBranch = {
  args: {
    ...defaultArgs,
    linkedBranches: [createLinkedBranch()],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

export const MultipleBranches = {
  args: {
    ...defaultArgs,
    linkedBranches: [
      createLinkedBranch({
        name: 'campaign-fix-1',
      }),
      createLinkedBranch({
        name: 'campaign-fix-2',
      }),
      createLinkedBranch({
        name: 'fix/campaign-client-side-cross-site-scripting',
      }),
    ],
  },
  render: (args: AlertLinksButtonProps) => <AlertLinksButton {...args} />,
}

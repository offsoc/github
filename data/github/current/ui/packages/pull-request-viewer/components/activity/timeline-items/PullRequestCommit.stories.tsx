import {relayDecorator, type RelayStoryObj} from '@github-ui/relay-test-utils/storybook'
import {expect, jest} from '@storybook/jest'
import type {Meta} from '@storybook/react'
import {userEvent, within} from '@storybook/test'
import {graphql} from 'relay-runtime'

import type {PullRequestCommitWithoutVerificationStoryQuery} from './__generated__/PullRequestCommitWithoutVerificationStoryQuery.graphql'
import type {PullRequestCommitWithVerificationStoryQuery} from './__generated__/PullRequestCommitWithVerificationStoryQuery.graphql'
import {PullRequestCommit} from './PullRequestCommit'

type PullRequestCommitQueries = {
  commitQuery: PullRequestCommitWithVerificationStoryQuery | PullRequestCommitWithoutVerificationStoryQuery
}

const meta = {
  title: 'PullRequestViewer/ActivityView/PullRequestCommit',
  component: PullRequestCommit,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof PullRequestCommit>

export default meta

const defaultArgs = {
  pullRequestUrl: '/monalisa/smile/pull/7',
}

const mockCommitAuthor = {
  login: 'monalisa',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
}

const mockCommit = {
  abbreviatedOid: 'abc123',
  oid: 'abc123efg456',
  message: 'This is a commit message',
  verificationStatus: 'UNVERIFIED',
  authoredDate: '2021-01-01T00:00:00Z',
  statusCheckRollup: {
    state: 'SUCCESS',
  },
  authors: {
    edges: [
      {
        node: {
          user: mockCommitAuthor,
        },
      },
    ],
  },
}

export const WithVerifiedStatus = {
  decorators: [relayDecorator<typeof PullRequestCommit, PullRequestCommitQueries>],
  parameters: {
    relay: {
      queries: {
        commitQuery: {
          type: 'fragment',
          query: graphql`
            query PullRequestCommitWithVerificationStoryQuery($id: ID!) @relay_test_operation {
              pullRequestCommit: node(id: $id) {
                ...PullRequestCommit_pullRequestCommit
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        PullRequestCommit() {
          return {
            commit: {...mockCommit, verificationStatus: 'VERIFIED'},
          }
        },
      },
      mapStoryArgs: ({queryData: {commitQuery}}) => {
        return {
          ...defaultArgs,
          queries: {commitQuery},
          queryRef: commitQuery.pullRequestCommit!,
        }
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Shows "Verified" label"', async () => {
      await expect(canvas.getByText('Verified')).toBeInTheDocument()
    })
    await step('Verify static content', () => verifyStaticSharedContent(canvasElement))
    await step('Click clipboard icon to copy commit sha', async () => await verifyCopyCommitToClipboard(canvasElement))
  },
} satisfies RelayStoryObj<typeof PullRequestCommit, PullRequestCommitQueries>

export const WithoutVerifiedStatus = {
  decorators: [relayDecorator<typeof PullRequestCommit, PullRequestCommitQueries>],
  parameters: {
    relay: {
      queries: {
        commitQuery: {
          type: 'fragment',
          query: graphql`
            query PullRequestCommitWithoutVerificationStoryQuery($id: ID!) @relay_test_operation {
              pullRequestCommit: node(id: $id) {
                ...PullRequestCommit_pullRequestCommit
              }
            }
          `,
          variables: {id: 'abc123'},
        },
      },
      mockResolvers: {
        PullRequestCommit() {
          return {
            commit: {
              ...mockCommit,
              verificationStatus: 'UNVERIFIED',
            },
          }
        },
      },
      mapStoryArgs: ({queryData: {commitQuery}}) => {
        return {
          ...defaultArgs,
          queries: {commitQuery},
          queryRef: commitQuery.pullRequestCommit!,
        }
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement)

    await step('Does not show "Verified" label"', async () => {
      await expect(canvas.queryByText('Verified')).not.toBeInTheDocument()
    })
    await step('Verify static content', () => verifyStaticSharedContent(canvasElement))
    await step('Click clipboard icon to copy commit sha', async () => await verifyCopyCommitToClipboard(canvasElement))
  },
} satisfies RelayStoryObj<typeof PullRequestCommit, PullRequestCommitQueries>

async function verifyStaticSharedContent(canvasElement: HTMLElement) {
  const mockPullRequestURL = '/monalisa/smile/pull/7'
  const canvas = within(canvasElement)
  const avatarLink = canvas.getByRole('link', {name: new RegExp(mockCommitAuthor.login)})
  const abbreviatedCommitLink = canvas.getByRole('link', {name: mockCommit.abbreviatedOid})
  const commitMessageLink = canvas.getByRole('link', {name: mockCommit.message})

  await expect(abbreviatedCommitLink).toHaveAttribute('href', `${mockPullRequestURL}/commits/${mockCommit.oid}`)
  await expect(commitMessageLink).toHaveAttribute('href', `${mockPullRequestURL}/commits/${mockCommit.oid}`)
  await expect(avatarLink).toHaveAttribute('href', `/${mockCommitAuthor.login}`)
}

async function verifyCopyCommitToClipboard(canvasElement: HTMLElement) {
  const mockedCopyText = jest.fn()
  // console.log('navigator', navigator)
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: {writeText: mockedCopyText},
  })
  const canvas = within(canvasElement)
  const clipboardLink = canvas.getByRole('button', {name: `Copy full SHA for ${mockCommit.abbreviatedOid}`})

  await userEvent.click(clipboardLink)
  await expect(canvas.getByRole('button', {name: `Copy full SHA for ${mockCommit.abbreviatedOid}`})).toBeInTheDocument()
  await expect(mockedCopyText).toHaveBeenCalledWith(mockCommit.oid)
}

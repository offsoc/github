import {screen} from '@testing-library/react'

import {type BranchCommitState, useLoadBranchCommits} from '../../../hooks/use-load-branch-commits'
import {getCommitRoutePayload} from '../../../test-utils/commit-mock-data'
import {renderCommit} from '../../../test-utils/Render'
import {CommitInfo} from '../CommitInfo'

jest.mock('../../../hooks/use-load-branch-commits')
const mockedUseLoadBranchCommitsData = jest.mocked(useLoadBranchCommits)

const branchData: BranchCommitState = {
  branches: [
    {
      branch: 'main',
      prs: [],
    },
    {
      branch: 'feature-branch',
      prs: [
        {
          number: 5,
          showPrefix: 'true',
          repo: {
            name: 'repo-name',
            ownerLogin: 'repo-owner',
          },
          globalRelayId: 'global-relay-id',
        },
      ],
    },
  ],
  tags: ['tag1', 'tag2', 'tag3', 'tag4'],
  loading: false,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseLoadBranchCommitsData.mockReturnValue(branchData)
})

test('CommitInfo shows branches', async () => {
  const payload = getCommitRoutePayload()

  renderCommit(
    <CommitInfo
      commit={payload.commit}
      commitInfo={{loading: false, branches: branchData.branches, tags: branchData.tags}}
    />,
    payload,
  )

  expect(screen.getByText('main')).toBeInTheDocument()
  expect(screen.getByText('feature-branch')).toBeInTheDocument()
  expect(screen.getByText('repo-owner/repo-name#5')).toBeInTheDocument()
})

test('CommitInfo shows tags', async () => {
  const payload = getCommitRoutePayload()

  const {user} = renderCommit(
    <CommitInfo
      commit={payload.commit}
      commitInfo={{loading: false, branches: branchData.branches, tags: branchData.tags}}
    />,
    payload,
  )

  expect(screen.getByText('tag1')).toBeInTheDocument()
  expect(screen.getByText('tag4')).toBeInTheDocument()

  expect(screen.queryByText('tag2')).not.toBeInTheDocument()

  const expandButton = screen.getByRole('button', {name: 'Show more tags'})
  expect(expandButton).toBeInTheDocument()

  await user.click(expandButton)

  expect(screen.getByText('tag2')).toBeInTheDocument()
  expect(screen.getByText('tag3')).toBeInTheDocument()
})

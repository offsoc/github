import type {FileTreePagePayload, RefComparison} from '@github-ui/code-view-types'
import {screen} from '@testing-library/react'

import {cannotEditTreePayload, forkRepoPayload, testTreePayload} from '../../../../__tests__/test-helpers'
import {useBranchInfoBar} from '../../../../hooks/use-branch-infobar'
import {BranchInfoBar} from '../../BranchInfoBar/BranchInfoBar'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import {render} from '@github-ui/react-core/test-utils'

const sampleComparison: RefComparison = {
  ahead: 0,
  behind: 0,
  baseBranch: 'main',
  baseBranchRange: 'main',
  currentRef: 'feature-branch',
  isTrackingBranch: false,
}

jest.mock('../../../../hooks/use-branch-infobar.ts')
const mockedUseBranchInfoBar = jest.mocked(useBranchInfoBar)

const renderBranchInfoBar = (payload: FileTreePagePayload) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <BranchInfoBar />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('BranchInfoBar', () => {
  test('shows PR link, if there is a PR number', async () => {
    mockedUseBranchInfoBar.mockReturnValueOnce([{refComparison: sampleComparison, pullRequestNumber: 100}, undefined])
    renderBranchInfoBar(testTreePayload)

    expect(screen.queryByText('Contribute')).not.toBeInTheDocument()
    expect(screen.getByText('#100')).toBeInTheDocument()
  })

  test('shows contribute button if there is no PR number', async () => {
    mockedUseBranchInfoBar.mockReturnValueOnce([{refComparison: sampleComparison}, undefined])
    renderBranchInfoBar(testTreePayload)

    expect(screen.getByText('Contribute')).toBeInTheDocument()
    expect(screen.queryByText('Sync fork')).not.toBeInTheDocument()
  })

  test('hides contribute button if there is no PR number and viewer cannot push', async () => {
    mockedUseBranchInfoBar.mockReturnValueOnce([{refComparison: sampleComparison}, undefined])
    renderBranchInfoBar(cannotEditTreePayload)

    expect(screen.queryByText('Contribute')).not.toBeInTheDocument()
    expect(screen.queryByText('Sync fork')).not.toBeInTheDocument()
  })

  test('shows sync fork button if repo is a fork and user can push', async () => {
    mockedUseBranchInfoBar.mockReturnValueOnce([{refComparison: sampleComparison}, undefined])
    renderBranchInfoBar(forkRepoPayload)

    expect(screen.getByText('Contribute')).toBeInTheDocument()
    expect(screen.getByText('Sync fork')).toBeInTheDocument()
  })

  test('shows error message in case of GitRPC timeout', async () => {
    mockedUseBranchInfoBar.mockReturnValueOnce([undefined, 'timeout'])
    renderBranchInfoBar(testTreePayload)

    const errorElement = await screen.findByText(
      'Sorry, getting ahead/behind information for this branch is taking too long.',
    )
    expect(errorElement).toBeInTheDocument()
  })

  test('shows error message in case of ref comparison being invalid', async () => {
    mockedUseBranchInfoBar.mockReturnValueOnce([{pullRequestNumber: 100}, undefined])
    renderBranchInfoBar(testTreePayload)

    expect(screen.queryByText('Contribute')).not.toBeInTheDocument()
    expect(screen.queryByText('#100')).not.toBeInTheDocument()
    const errorElement = await screen.findByText('Cannot retrieve ahead/behind information for this branch.')
    expect(errorElement).toBeInTheDocument()
  })
})

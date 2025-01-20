import type {FileTreePagePayload, RefComparison} from '@github-ui/code-view-types'
import {fireEvent, screen, waitFor} from '@testing-library/react'

import {testTreePayload} from '../../../../__tests__/test-helpers'
import {useMergeabilityCheck} from '../../../../hooks/use-mergeability-check'
import {FetchPopoverContainer} from '../../BranchInfoBar/FetchPopoverContainer'
import {FetchUpstreamPopoverContent} from '../../BranchInfoBar/FetchUpstreamPopoverContent'
import {FetchUpstreamWithConflictsPopoverContent} from '../../BranchInfoBar/FetchUpstreamWithConflictsPopoverContent'
import {render} from '@github-ui/react-core/test-utils'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'

const sampleComparison: RefComparison = {
  ahead: 0,
  behind: 0,
  baseBranch: 'main',
  baseBranchRange: 'main',
  currentRef: 'feature-branch',
  isTrackingBranch: false,
}

const renderFetchPopoverContainer = (payload: FileTreePagePayload, comparison: RefComparison) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <FetchPopoverContainer comparison={comparison} />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

jest.mock('../../../../hooks/use-mergeability-check.ts')
const mockedUseMergeabilityCheck = jest.mocked(useMergeabilityCheck)

describe('FetchPopoverContainer', () => {
  describe('branch has conflicts with upstream', () => {
    beforeEach(() => mockedUseMergeabilityCheck.mockReturnValue(['dirty', false, undefined]))

    test('suggests to resolve conflicts', async () => {
      renderFetchPopoverContainer(testTreePayload, {...sampleComparison, behind: 1, ahead: 1})

      expect(screen.getByText(/This branch has conflicts/)).toBeInTheDocument()
      expect(screen.getByTestId('discard-button')).toBeEnabled()
      expect(screen.getByTestId('open-pr-button')).toBeEnabled()
    })
  })

  describe('branch has no conflicts with upstream', () => {
    beforeEach(() => mockedUseMergeabilityCheck.mockReturnValue(['clean', false, undefined]))

    test('is in sync with upstream', async () => {
      renderFetchPopoverContainer(testTreePayload, sampleComparison)

      expect(screen.getByText(/This branch is not behind the upstream/)).toBeInTheDocument()
      expect(screen.getByText(/No new commits to fetch/)).toBeInTheDocument()
      expect(screen.queryByTestId('compare-button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('update-branch-button')).not.toBeInTheDocument()
    })

    test('is behind upstream', async () => {
      renderFetchPopoverContainer(testTreePayload, {...sampleComparison, behind: 1})

      expect(screen.getByText(/This branch is out-of-date/)).toBeInTheDocument()
      expect(screen.getByText(/Update branch to keep this branch up-to-date by/)).toBeInTheDocument()
      expect(screen.getByTestId('compare-button')).toBeEnabled()
      expect(screen.getByTestId('update-branch-button')).toBeEnabled()
    })

    test('is ahead upstream', async () => {
      renderFetchPopoverContainer(testTreePayload, {...sampleComparison, ahead: 1})

      expect(screen.getByText(/This branch is not behind the upstream/)).toBeInTheDocument()
      expect(screen.getByText(/No new commits to fetch/)).toBeInTheDocument()
      expect(screen.queryByTestId('update-branch-button')).not.toBeInTheDocument()
    })

    test('is ahead and behind upstream and is a tracking branch', async () => {
      renderFetchPopoverContainer(testTreePayload, {...sampleComparison, behind: 1, ahead: 1, isTrackingBranch: true})

      expect(screen.getByText(/This branch is out-of-date/)).toBeInTheDocument()
      expect(screen.getByText(/Update branch to merge the latest changes/)).toBeInTheDocument()

      expect(screen.getByTestId('discard-button')).toBeEnabled()
      expect(screen.getByTestId('update-branch-button')).toBeEnabled()
    })

    test('is ahead and behind upstream and is not a tracking branch', async () => {
      renderFetchPopoverContainer(testTreePayload, {...sampleComparison, behind: 1, ahead: 1, isTrackingBranch: false})

      expect(screen.getByText(/This branch is out-of-date/)).toBeInTheDocument()
      expect(screen.getByText(/Update branch to merge the latest changes/)).toBeInTheDocument()

      expect(screen.queryByTestId('discard-button')).not.toBeInTheDocument()
      expect(screen.getByTestId('update-branch-button')).toBeEnabled()
    })
  })
})

function sleep(time: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time)
  })
}

describe('FetchUpstreamPopoverContent', () => {
  test('shows alternative label while discarding changes or updating branch', async () => {
    const discard = () => sleep(10)
    const update = () => sleep(10)

    render(
      <CurrentRepositoryProvider repository={testTreePayload.repo}>
        <FilesPageInfoProvider
          action="tree"
          copilotAccessAllowed={false}
          path={testTreePayload.path}
          refInfo={testTreePayload.refInfo}
        >
          <FetchUpstreamPopoverContent
            comparison={{...sampleComparison, behind: 1, ahead: 1, isTrackingBranch: true}}
            update={update}
            discard={discard}
          />
        </FilesPageInfoProvider>
      </CurrentRepositoryProvider>,
    )

    fireEvent.click(screen.getByText('Discard 1 commit'))
    expect(screen.getByText('Discarding changes...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Discard 1 commit')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Update branch'))
    expect(screen.getByText('Updating...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Update branch')).toBeInTheDocument()
    })
  })
})

describe('FetchUpstreamWithConflictsPopoverContent', () => {
  test('shows alternative label while discarding changes', async () => {
    const discard = () => sleep(10)

    render(
      <CurrentRepositoryProvider repository={testTreePayload.repo}>
        <FilesPageInfoProvider
          action="tree"
          copilotAccessAllowed={false}
          path={testTreePayload.path}
          refInfo={testTreePayload.refInfo}
        >
          <FetchUpstreamWithConflictsPopoverContent
            comparison={{...sampleComparison, behind: 1, ahead: 1, isTrackingBranch: true}}
            discard={discard}
          />
        </FilesPageInfoProvider>
      </CurrentRepositoryProvider>,
    )

    fireEvent.click(screen.getByText('Discard 1 commit'))
    expect(screen.getByText('Discarding changes...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Discard 1 commit')).toBeInTheDocument()
    })
  })
})

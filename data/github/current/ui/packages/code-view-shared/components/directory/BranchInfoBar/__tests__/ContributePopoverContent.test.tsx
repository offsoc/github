import type {FileTreePagePayload, RefComparison} from '@github-ui/code-view-types'
import {screen} from '@testing-library/react'

import {forkRepoPayload, testTreePayload} from '../../../../__tests__/test-helpers'
import {ContributePopoverContent} from '../../BranchInfoBar/ContributePopoverContent'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import {render} from '@github-ui/react-core/test-utils'

const sampleComparison = {
  ahead: 0,
  behind: 0,
  baseBranch: 'main',
  baseBranchRange: 'main',
  currentRef: 'feature-branch',
} as RefComparison

const intraOrgForkComparison = {
  ahead: 1,
  baseBranch: 'monalisa/smile:main',
  baseBranchRange: 'monalisa:smile:main',
  currentRef: 'main',
} as RefComparison

const renderContributePopoverContent = (payload: FileTreePagePayload, comparison: RefComparison) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <ContributePopoverContent comparison={comparison} />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('ContributePopoverContent', () => {
  test('suggests opening a PR if branch is ahead', async () => {
    renderContributePopoverContent(testTreePayload, {...sampleComparison, ahead: 1})

    expect(screen.getByText(/Open a pull request to contribute/)).toBeInTheDocument()
    expect(screen.getByTestId('compare-button')).toBeEnabled()
    expect(screen.getByTestId('open-pr-button')).toBeEnabled()
  })

  test('says that there are no new commits, when not branch is not ahead', async () => {
    renderContributePopoverContent(testTreePayload, sampleComparison)

    expect(screen.getByText(/This branch is not ahead of the upstream/)).toBeInTheDocument()
    expect(screen.getByText(/No new commits yet/)).toBeInTheDocument()
    expect(screen.queryByTestId('compare-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('open-pr-button')).not.toBeInTheDocument()
  })

  test('hides compare button, if repo is a fork', async () => {
    renderContributePopoverContent(forkRepoPayload, sampleComparison)

    expect(screen.queryByTestId('compare-button')).not.toBeInTheDocument()
  })

  test('the open pr button href is correct for forks', async () => {
    renderContributePopoverContent(forkRepoPayload, intraOrgForkComparison)

    const openPrButton: HTMLAnchorElement = screen.getByTestId('open-pr-button')
    expect(openPrButton.href).toBe('http://localhost/monalisa/smile/compare/monalisa%3Asmile%3Amain...main?expand=1')
  })

  test('the open pr and compare button hrefs are correct for non-forks', async () => {
    renderContributePopoverContent(testTreePayload, {...sampleComparison, ahead: 1})

    const openPrButton: HTMLAnchorElement = screen.getByTestId('open-pr-button')
    expect(openPrButton.href).toBe('http://localhost/monalisa/smile/compare/main...feature-branch?expand=1')

    const compareButton: HTMLAnchorElement = screen.getByTestId('compare-button')
    expect(compareButton.href).toBe('http://localhost/monalisa/smile/compare/main...feature-branch')
  })
})

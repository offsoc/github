import {mockFetch} from '@github-ui/mock-fetch'
import {resetMemoizeFetchJSON} from '@github-ui/use-latest-commit'
import {latestCommitData} from '@github-ui/use-latest-commit/sample-data'
import {act, screen} from '@testing-library/react'

import {testTreePayload} from '../../../__tests__/test-helpers'
import {LatestCommitSingleLine} from '../../LatestCommit'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../contexts/FilesPageInfoContext'
import type {FileTreePagePayload} from '@github-ui/code-view-types'
import {render} from '@github-ui/react-core/test-utils'

beforeEach(() => {
  resetMemoizeFetchJSON()
})

const renderLatestCommitSingleLine = (payload: FileTreePagePayload) => {
  return render(
    <CurrentRepositoryProvider repository={payload.repo}>
      <FilesPageInfoProvider action="tree" copilotAccessAllowed={false} path={payload.path} refInfo={payload.refInfo}>
        <LatestCommitSingleLine />
      </FilesPageInfoProvider>
    </CurrentRepositoryProvider>,
  )
}

describe('Accessibility', () => {
  describe('LatestCommitSingleLine', () => {
    test('H2: Commits section', async () => {
      renderLatestCommitSingleLine(testTreePayload)

      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.getByText('History', {selector: ':not(.sr-only)'})).toBeInTheDocument()

      await act(() => mockFetch.resolvePendingRequest('/monalisa/smile/latest-commit/main/src/app', latestCommitData))

      const commitsHeading = screen.getByRole('heading', {name: 'Latest commit'})
      expect(commitsHeading.tagName).toBe('H2')
    })
  })
})

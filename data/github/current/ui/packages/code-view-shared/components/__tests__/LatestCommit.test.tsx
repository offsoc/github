import {LatestCommitSingleLine} from '../LatestCommit'
import {mockFetch} from '@github-ui/mock-fetch'
import {resetMemoizeFetchJSON} from '@github-ui/use-latest-commit'
import {latestCommitData, latestCommitDataWithMultipleLinks} from '@github-ui/use-latest-commit/sample-data'
import {act, fireEvent, screen} from '@testing-library/react'

import type {FileTreePagePayload} from '@github-ui/code-view-types'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../contexts/FilesPageInfoContext'
import {render} from '@github-ui/react-core/test-utils'
import {testTreePayload} from '../../__tests__/test-helpers'

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

describe('LatestCommitSingleLine', () => {
  test('completes loading', async () => {
    renderLatestCommitSingleLine(testTreePayload)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('History', {selector: ':not(.sr-only)'})).toBeInTheDocument()

    await act(() => mockFetch.resolvePendingRequest('/monalisa/smile/latest-commit/main/src/app', latestCommitData))

    expect(screen.getByTestId('latest-commit')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-icon-link')).toBeInTheDocument()
    expect(screen.getByTestId('latest-commit-details')).toBeInTheDocument()
    expect(screen.getByTestId('latest-commit-html')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Commit 1234sha'})).toBeInTheDocument()

    // eslint-disable-next-line testing-library/no-node-access
    const links = screen.getByTestId('latest-commit-html').getElementsByTagName('a')
    expect(links.length).toBe(1)
    for (const link of links) {
      expect(link).toHaveAttribute('data-hovercard-url')
    }
  })

  test('shows multiple hovercards not just 1', async () => {
    renderLatestCommitSingleLine(testTreePayload)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
    expect(screen.getByText('History', {selector: ':not(.sr-only)'})).toBeInTheDocument()

    await act(() =>
      mockFetch.resolvePendingRequest('/monalisa/smile/latest-commit/main/src/app', latestCommitDataWithMultipleLinks),
    )

    expect(screen.getByTestId('latest-commit')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-icon-link')).toBeInTheDocument()
    expect(screen.getByTestId('latest-commit-details')).toBeInTheDocument()
    expect(screen.getByTestId('latest-commit-details')).toBeInTheDocument()

    // eslint-disable-next-line testing-library/no-node-access
    const links = screen.getByTestId('latest-commit-html').getElementsByTagName('a')
    expect(links.length).toBe(2)
    for (const link of links) {
      expect(link).toHaveAttribute('data-hovercard-url')
    }
  })

  test('display error message', async () => {
    mockFetch.mockRouteOnce('/monalisa/smile/latest-commit/main/src/app', {error: 'Error message'}, {ok: false})
    renderLatestCommitSingleLine(testTreePayload)

    const errorElement = await screen.findByText('Cannot retrieve latest commit at this time.')
    expect(errorElement).toBeInTheDocument()
    expect(screen.getByText('History', {selector: ':not(.sr-only)'})).toBeInTheDocument()
  })

  test('display ellipsis expandable', async () => {
    renderLatestCommitSingleLine(testTreePayload)

    await act(() => mockFetch.resolvePendingRequest('/monalisa/smile/latest-commit/main/src/app', latestCommitData))

    expect(screen.getByTestId('latest-commit')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-icon-link')).toBeInTheDocument()
    expect(screen.getByTestId('latest-commit-details')).toBeInTheDocument()
    expect(screen.getByTestId('latest-commit-html')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Commit 1234sha'})).toBeInTheDocument()
    expect(screen.queryByText('This is the message of the latest commit')).not.toBeInTheDocument()

    // There are two of these in the dom but only 1 is shown at a time
    const toggleButton = screen.getAllByTestId('latest-commit-details-toggle')[1]
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton!)
    expect(screen.getByText('This is the message of the latest commit')).toBeInTheDocument()
  })
})

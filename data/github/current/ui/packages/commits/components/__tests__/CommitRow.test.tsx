import type {Repository} from '@github-ui/current-repository'
import {ListView} from '@github-ui/list-view'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, within} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import userEvent from 'user-event-13'

import {useFindDeferredCommitData} from '../../contexts/DeferredCommitDataContext'
import {
  deferredData,
  deferredOnBehalfOfCommit,
  getCommitsRoutePayload,
  sampleCommitRowData,
} from '../../test-utils/mock-data'
import {CommitRow, type CommitRowProps} from '../Commits/CommitRow'

jest.mock('react', () => {
  const React = jest.requireActual('react')
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.Suspense = ({children}: {children: any}) => children
  return React
})

// Mock the following properties to avoid focus errors for ListView
beforeAll(() => {
  Object.defineProperties(HTMLElement.prototype, {
    offsetHeight: {get: () => 42},
    offsetWidth: {get: () => 42},
    getClientRects: {get: () => () => [42]},
    offsetParent: {get: () => true},
  })
})

jest.mock('../../contexts/DeferredCommitDataContext')
const mockedUseFindDeferredCommitData = jest.mocked(useFindDeferredCommitData)

beforeEach(() => {
  mockedUseFindDeferredCommitData.mockReturnValue(deferredData.deferredCommits[0])
})

const renderCommitRow = (commit: CommitRowProps['commit'], repo: Repository, path: string) => {
  return render(
    <ListView title="Test Title">
      <CommitRow commit={commit} repo={repo} path={path} />
    </ListView>,
  )
}

describe('Commit row display info', () => {
  test('show more of the commit message button should show more of the commit message', async () => {
    const {repo, filters} = getCommitsRoutePayload()
    const commit = sampleCommitRowData

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitRow(commit, repo, filters.currentBlobPath)
    })

    expect(screen.queryByText('here is some body message html')).not.toBeInTheDocument()
    expect(screen.getByText('this is a short message')).toBeInTheDocument()
    expect(screen.getByText('this is a short message').tagName).toBe('A') // from raw shortMessageMarkdownLink value
    const button = screen.getByTestId('commit-row-show-description-button')
    userEvent.click(button)
    expect(screen.getByText('here is some body message html')).toBeInTheDocument()
  })

  test('commit attribution information should render as expected', async () => {
    const {repo, filters} = getCommitsRoutePayload()
    const commit = sampleCommitRowData

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitRow(commit, repo, filters.currentBlobPath)
    })

    // eslint-disable-next-line testing-library/no-node-access
    const authorElement = screen.getByText('monalisa2').parentNode?.parentNode
    expect(authorElement).toBeInTheDocument()
    //weird space here and lack of space due to the way the styles worked out
    expect(authorElement!.textContent).toBe(' monalisaandmonalisa2committedSep 12, 2023·1 / 47')
  })

  test('should have metadata information', async () => {
    const {repo, filters} = getCommitsRoutePayload()
    const commit = sampleCommitRowData

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitRow(commit, repo, filters.currentBlobPath)
    })

    expect(screen.getByText('1 / 47')).toBeInTheDocument()
    expect(screen.getAllByTestId('list-view-item-metadata-item')).toHaveLength(3)
    const metadataInstances = screen.getAllByTestId('list-view-item-metadata-item')
    // metadataInstances[0] is the commit comments
    expect(metadataInstances[1]?.textContent).toBe('Verified')
    expect(metadataInstances[2]?.textContent).toBe('052a205')
    // check for hidden: true since jest will run this in a mobile view where the button is hidden in favor of the elipsis menu
    expect(screen.getByRole('button', {name: 'Copy full SHA for 052a205', hidden: true})).toBeInTheDocument()
    expect(screen.getByTestId('list-view-item-action-bar-container')).toBeInTheDocument()
    expect(screen.getByTestId('commit-row-browse-repo')).toHaveAccessibleName('Browse repository at this point')
  })

  test('ellipsis menu renders as expected', async () => {
    const {repo, filters} = getCommitsRoutePayload()
    const commit = sampleCommitRowData

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitRow(commit, repo, filters.currentBlobPath)
    })

    const actionBar = screen.getByTestId('list-view-item-action-bar-container')
    const ellipsisButton = within(actionBar).getByTestId('overflow-menu-anchor')
    expect(ellipsisButton).toBeInTheDocument()

    userEvent.click(ellipsisButton)

    expect(ellipsisButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('View commit details')).toBeInTheDocument()
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('View commit details').parentNode?.parentNode).toHaveAttribute(
      'href',
      '/monalisa/smile/commit/052a205c10a5a949ec8b00521da6508e7f2eab1fc',
    )
    expect(screen.getByText('Copy full SHA', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('Browse repository at this point')).toBeInTheDocument()
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('Browse repository at this point').parentNode?.parentNode).toHaveAttribute(
      'href',
      '/monalisa/smile/tree/052a205c10a5a949ec8b00521da6508e7f2eab1fc',
    )
    expect(screen.getByText('View checks')).toBeInTheDocument()

    userEvent.click(screen.getByRole('menuitem', {name: 'View commit details'}))

    expect(ellipsisButton).toHaveAttribute('aria-expanded', 'false')
  })

  test('shows onBehalfOf commit info', async () => {
    mockedUseFindDeferredCommitData.mockReturnValue(deferredOnBehalfOfCommit)

    const {repo, filters} = getCommitsRoutePayload()
    const commit = sampleCommitRowData

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      renderCommitRow(commit, repo, filters.currentBlobPath)
    })

    // eslint-disable-next-line testing-library/no-node-access
    const authorElement = screen.getByText('monalisa2').parentNode?.parentNode
    expect(authorElement).toBeInTheDocument()
    //weird space here and lack of space due to the way the styles worked out
    expect(authorElement!.textContent).toMatch(/monalisaandmonalisa2committedon behalf ofgithubSep 12, 2023·1 \/ 47/)
  })
})

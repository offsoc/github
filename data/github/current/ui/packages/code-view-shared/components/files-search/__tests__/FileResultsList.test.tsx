import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import FileResultsList, {FileResultRow} from '../FileResultsList'
import {FileQueryContext} from '../../../contexts/FileQueryContext'
import {type FilesPageInfo, FilesPageInfoProvider} from '../../../contexts/FilesPageInfoContext'
import {resetTreeListMemoizeFetch} from '../../../hooks/use-tree-list'
import type {RepositoryClickTarget} from '@github-ui/code-view-types'
import {CurrentRepositoryProvider, type Repository} from '@github-ui/current-repository'
import {mockFetch} from '@github-ui/mock-fetch'
import {render, type User} from '@github-ui/react-core/test-utils'
import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import type {RefInfo} from '@github-ui/repos-types'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import React from 'react'

const terminateMock = jest.fn()
let returnMessages = true

// Web workers are not supported on jsdom, so we mock the minimum we need for this test,
// which will call onmessage once per each postMessage with a fixed resultset.
window.Worker = class {
  // onmessage will be replaced by the caller to handle responses
  onmessage = (data: unknown) => data
  postMessage() {
    if (returnMessages) {
      this.onmessage({data: {query: 'any', list: ['contra', 'transport', 'ter/rain'], startTime: 20, baseCount: 4}})
    }
  }
  terminate = terminateMock
} as unknown as typeof Worker

jest.useFakeTimers()
describe('FileResultsList', () => {
  beforeEach(() => {
    resetTreeListMemoizeFetch()
    terminateMock.mockClear()
    returnMessages = true
  })

  it('filter by query and highlight matches', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })
    render(buildComponent('tr a'))

    fireEvent.focus(screen.getByRole('textbox'))
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument()

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument()
    expect(screen.queryByText('No matches found')).not.toBeInTheDocument()

    await waitForLoadingToComplete()

    // 3 items should pass the 'tra' filter, including _t_er/_ra_in
    expect(screen.queryAllByRole('option')).toHaveLength(3)

    const list = screen.getByRole('listbox')
    // Every character uses a separate <mark>, so we expect 9
    // eslint-disable-next-line testing-library/no-node-access
    expect(list.querySelectorAll('mark')).toHaveLength(9)
  })

  it('shows additional results', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['file', 'old-file'],
    })
    render(buildComponent('file', 'any', undefined, undefined, ['new-file']))

    fireEvent.focus(screen.getByRole('textbox'))
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument()

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })

    await waitForLoadingToComplete()

    // 3 items should pass the 'file' filter
    expect(screen.queryAllByRole('option')).toHaveLength(3)
  })

  it('terminates an in progress worker for a new query', async () => {
    returnMessages = false
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })
    const {rerender} = render(buildComponent('tr a'))

    fireEvent.focus(screen.getByRole('textbox'))
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument()

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      jest.runAllTimers()
    })

    rerender(buildComponent('port'))

    await act(async () => {
      jest.runAllTimers()
    })

    expect(terminateMock).toHaveBeenCalledTimes(1)
  })

  it('renders in an overlay', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })
    render(buildComponent('tra', undefined, undefined, undefined))

    expect(screen.queryByText('No matches found')).not.toBeInTheDocument()

    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument()

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })

    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument()
    expect(screen.queryByText('No matches found')).not.toBeInTheDocument()

    await waitForLoadingToComplete()

    // 3 items should pass the 'tra' filter, including _t_er/_ra_in
    expect(screen.queryAllByRole('option')).toHaveLength(3)

    const list = screen.getByRole('listbox')
    // Every character uses a separate <mark>, so we expect 9
    // eslint-disable-next-line testing-library/no-node-access
    expect(list.querySelectorAll('mark')).toHaveLength(9)
  })

  it('navigates to results', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })

    const onItemSelectedMock = jest.fn()
    const {user} = render(buildComponent('tra', 'any', jest.fn, onItemSelectedMock))
    fireEvent.focus(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })
    await waitForLoadingToComplete()

    const stopTime = performance.now()
    const firstMatch = screen.getByRole<HTMLAnchorElement>('option', {name: 'File con t r a Go to file'})
    expect(firstMatch.href).toBe('http://localhost/owner/repo/blob/main/contra')

    await clickWithoutNavigation(user, firstMatch)

    expectAnalyticsEvents<RepositoryClickTarget | ''>(
      {
        type: 'repository.find-file',
        target: '',
        data: {
          'find-file-base-count': '4',
          'find-file-results-count': '3',
          // stopTime minus 20 (startTime) should be accurate, but
          // there's a consistent offset by 1 in fakeTimers that I cannot explain
          'find-file-duration-ms': `${stopTime - 20}`,
        },
      },
      {
        type: 'repository.click',
        target: 'FILE_TREE.SEARCH_RESULT_CLICK',
      },
    )
    expect(onItemSelectedMock).toHaveBeenCalledTimes(1)
  })

  it('navigates to line number "tra:12"', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })
    render(buildComponent('tra:12'))
    fireEvent.focus(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })
    await waitForLoadingToComplete()

    const firstMatch = screen.getByRole<HTMLAnchorElement>('option', {name: 'File con t r a Go to file'})
    expect(firstMatch.href).toBe('http://localhost/owner/repo/blob/main/contra#L12')
  })

  it('rows not re-rendered on navigation', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })
    const renderMock = jest.fn()
    const onItemSelectedMock = jest.fn()
    const {rerender} = render(buildComponent('tra', 'any', renderMock, onItemSelectedMock))
    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })

    await waitForLoadingToComplete()

    expect(renderMock).toHaveBeenCalledTimes(3)

    renderMock.mockClear()
    rerender(buildComponent('tra', 'contra', renderMock, onItemSelectedMock))

    // Only 1 re-render expected, to make 'contra' active
    expect(renderMock).toHaveBeenCalledTimes(1)

    renderMock.mockClear()
    rerender(buildComponent('tra', 'transport', renderMock, onItemSelectedMock))

    // Only 2 re-render expected: one to remove active from 'contra', and another to make 'transport' active
    expect(renderMock).toHaveBeenCalledTimes(2)
  })

  it('navigates through items with up/down keys', async () => {
    const mock = mockFetch.mockRouteOnce('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['contra', 'transport', 'ter/rain', '/src'],
    })

    const {user} = render(buildComponent('tra'))

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      jest.runAllTimers()
    })

    // Focus the input
    act(() => screen.getByRole('textbox', {name: 'Go to file'}).focus())

    // First item is active focusing the input
    await waitFor(() => expect(getListItemAt(0)).toHaveAttribute('data-focus-visible-added'))

    // The active element changes with keyboard navigation
    await user.keyboard('[ArrowDown][ArrowDown]')
    expect(getListItemAt(2)).toHaveAttribute('data-focus-visible-added')

    // Only the active element has the data attribute
    expect(getListItemAt(0)).not.toHaveAttribute('data-focus-visible-added')

    // Does not go below list length
    await user.keyboard('[ArrowDown]')
    expect(getListItemAt(2)).toHaveAttribute('data-focus-visible-added')

    await user.keyboard('[ArrowUp][ArrowUp]')
    expect(getListItemAt(0)).toHaveAttribute('data-focus-visible-added')

    // Does not go above first item
    await user.keyboard('[ArrowUp]')
    expect(getListItemAt(0)).toHaveAttribute('data-focus-visible-added')
  })
})

describe('FileResultRow', () => {
  beforeEach(() => resetTreeListMemoizeFetch())

  test('renders file and folder', async () => {
    render(
      <FileResultRow
        index={0}
        match="folder/filename.txt"
        query="name.txt"
        active={false}
        to="/anywhere"
        isDirectory={false}
        useOverlay={false}
      />,
    )
    // "name.txt" is rendered with a <mark> element because it matches the query
    expect(screen.getByText('folder/​file')).toBeInTheDocument()
  })

  test('renders folder icon', async () => {
    render(
      <FileResultRow
        index={0}
        match="folder/filename.txt"
        query="file"
        active={false}
        to="/anywhere"
        isDirectory={true}
        useOverlay={false}
      />,
    )

    expect(screen.getByRole('img', {name: 'Directory'})).toBeInTheDocument()
  })
})

function getListItemAt(position: number) {
  return screen.queryAllByRole('option').at(position) as HTMLElement
}

// Freeze metadata object, otherwise every re-render will generate new analytics functions
const metadata = {}
const repo = {name: 'repo', ownerLogin: 'owner'} as Repository
const refInfo = {name: 'main', currentOid: '2dead2be'} as RefInfo

function buildComponent(
  query: string,
  path = 'any',
  onRenderRow?: () => void,
  onItemSelected?: () => void,
  additionalResults?: string[],
) {
  const infoProps = {refInfo, path, action: 'tree'} as FilesPageInfo
  const searchBoxRef = React.createRef<HTMLInputElement>()
  return (
    <AnalyticsProvider appName="react-code-view-test" category="" metadata={metadata}>
      <AppPayloadContext.Provider value={{}}>
        <CurrentRepositoryProvider repository={repo}>
          <FilesPageInfoProvider {...infoProps}>
            <FileQueryContext.Provider value={{query, setQuery: jest.fn()}}>
              <FileResultsList
                additionalResults={additionalResults}
                commitOid={refInfo.currentOid}
                findFileWorkerPath="mock"
                onRenderRow={onRenderRow}
                onItemSelected={onItemSelected ?? jest.fn()}
                searchBoxRef={searchBoxRef}
              />
            </FileQueryContext.Provider>
          </FilesPageInfoProvider>
        </CurrentRepositoryProvider>
      </AppPayloadContext.Provider>
    </AnalyticsProvider>
  )
}

async function clickWithoutNavigation(user: User, el: HTMLElement) {
  el.addEventListener('click', e => e.preventDefault())
  await user.click(el)
}

async function waitForLoadingToComplete() {
  await act(async () => {
    jest.runAllTimers()
  })

  await waitFor(() => {
    expect(screen.queryByRole('status', {name: 'Loading'})).not.toBeInTheDocument()
  })
}

import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {resetTreeListMemoizeFetch} from '@github-ui/code-view-shared/hooks/use-tree-list'
import type {DirectoryItem, ReposFileTreeData, RepositoryClickTarget} from '@github-ui/code-view-types'
import {mockFetch} from '@github-ui/mock-fetch'
import {render} from '@github-ui/react-core/test-utils'
import {CommentIcon} from '@primer/octicons-react'
import {act, fireEvent, screen, waitFor} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {ReposFileTreePane} from '../components/ReposFileTreePane'
import {buildTreeComponent, defaultPaneProps, WrapPane} from './test-utils'

const src: DirectoryItem = {
  name: 'src',
  contentType: 'directory',
  hasSimplifiedPath: false,
  path: 'src',
  totalCount: 1,
}

const readme: DirectoryItem = {
  name: 'readme',
  contentType: 'file',
  hasSimplifiedPath: false,
  path: 'readme',
}

const app: DirectoryItem = {
  name: 'app',
  contentType: 'file',
  hasSimplifiedPath: false,
  path: 'src/app',
  totalCount: 1,
}

const test: DirectoryItem = {
  name: 'test/case',
  contentType: 'directory',
  hasSimplifiedPath: true,
  path: 'src/test/case',
  totalCount: 1,
}

// Web workers are not supported on jsdom, so we mock the minimum we need for this test,
// which will call onmessage once per each postMessage with a fixed resultset.
window.Worker = class {
  // onmessage will be replaced by the caller to handle responses
  onmessage = (data: unknown) => data
  postMessage() {
    this.onmessage({data: {query: 'any', list: ['a']}})
  }
  terminate = () => undefined
} as unknown as typeof Worker

jest.useFakeTimers()

const scrollIntoViewMock = jest.fn()
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

describe('ReposFileTreePane', () => {
  beforeEach(resetTreeListMemoizeFetch)

  it('Displays a simplified item', async () => {
    await renderTreeComponent(
      {
        '': {
          items: [src],
          totalCount: 1,
        },
      },
      'another/folder',
    )

    const srcLink = screen.getByRole('treeitem', {name: 'src'})
    act(() => {
      srcLink.focus()
    })
    fireEvent.keyDown(srcLink, {key: 'ArrowRight'})

    mockFetch.resolvePendingRequest('/owner/repo/tree/main/src?noancestors=1', {
      payload: {tree: {items: [test, readme]}},
    })

    const testItem = await screen.findByText('test/case')
    expect(testItem).toBeInTheDocument()
  })

  it('Loads folder data', async () => {
    await renderTreeComponent(
      {
        '': {
          items: [src],
          totalCount: 1,
        },
      },
      'another/folder',
    )

    const srcLink = screen.getByRole('treeitem', {name: 'src'})
    act(() => {
      srcLink.focus()
    })
    fireEvent.keyDown(srcLink, {key: 'ArrowRight'})

    mockFetch.resolvePendingRequest('/owner/repo/tree/main/src?noancestors=1', {
      payload: {tree: {items: [app]}},
    })

    const appItem = await screen.findByText('app')
    expect(appItem).toBeInTheDocument()
  })

  it('Shows an error when loading', async () => {
    mockFetch.mockRoute('/owner/repo/tree/main/src?noancestors=1', null, {ok: false})

    render(
      buildTreeComponent(
        {
          '': {
            items: [src],
            totalCount: 1,
          },
        },
        'another/folder',
      ),
    )

    const srcLink = screen.getByRole('treeitem', {name: 'src'})
    act(() => {
      srcLink.focus()
    })
    fireEvent.keyDown(srcLink, {key: 'ArrowRight'})

    const errorItem = await screen.findByText('There was an error loading the folder contents.')
    expect(errorItem).toBeInTheDocument()
  })

  it('Renders the ReposFileTreePane', async () => {
    await renderTreeComponent({
      '': {
        items: [src, readme],
        totalCount: 2,
      },
      src: {
        items: [app],
        totalCount: 1,
      },
    })
    expect(screen.getAllByRole('treeitem').length).toBe(3)
    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('readme')).toBeInTheDocument()
    expect(screen.getByText('app')).toBeInTheDocument()
  })

  it('Adds to the folders state when rerendering', async () => {
    const {rerender} = await renderTreeComponent({
      '': {
        items: [readme],
        totalCount: 1,
      },
    })
    rerender(
      buildTreeComponent({
        '': {
          items: [src],
          totalCount: 1,
        },
        src: {
          items: [app],
          totalCount: 1,
        },
      }),
    )
    expect(screen.getAllByRole('treeitem').length).toBe(3)
    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('readme')).toBeInTheDocument()
    expect(screen.getByText('app')).toBeInTheDocument()
  })

  it('shows results when finding files', async () => {
    const mock = mockFetch.mockRoute('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['a', 'b', 'c', 'd'],
    })

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(
        <WrapPane path="any" query="a">
          <ReposFileTreePane {...defaultPaneProps} fileTree={{'': {items: [src], totalCount: 0}}} />
        </WrapPane>,
      )
    })

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })
    await act(async () => {
      jest.runAllTimers()
    })

    expect(screen.queryAllByRole('treeitem')[0]?.getAttribute('aria-expanded')).toEqual('false')
    expect(screen.queryAllByRole('option')).toHaveLength(1)
  })

  it('calls setQuery', async () => {
    const mock = mockFetch.mockRoute('/owner/repo/tree-list/2dead2be?include_directories=true', {
      paths: ['a', 'b', 'c', 'd'],
    })

    const setQuery = jest.fn()

    const {user} = render(
      <WrapPane path="any" setQuery={setQuery}>
        <ReposFileTreePane {...defaultPaneProps} fileTree={{'': {items: [src], totalCount: 0}}} />
      </WrapPane>,
    )

    const findInput = screen.getByRole<HTMLInputElement>('textbox', {name: 'Go to file'})
    await act(async () => {
      user.type(findInput, 'a')
    })

    await waitFor(() => {
      expect(mock).toHaveBeenCalledTimes(1)
    })
    await act(async () => {
      jest.runAllTimers()
    })

    expect(setQuery).toHaveBeenCalledTimes(1)
  })

  it('incrementally shows items', async () => {
    const items: DirectoryItem[] = []
    for (let i = 0; i < 101; i++) {
      items.push({
        name: `file${i}`,
        contentType: 'file',
        hasSimplifiedPath: false,
        path: `src/file${i}`,
        totalCount: 0,
      })
    }
    render(
      <WrapPane path="">
        <ReposFileTreePane
          {...defaultPaneProps}
          fileTree={{
            '': {items: [src], totalCount: 1},
            src: {items, totalCount: 101},
          }}
        />
      </WrapPane>,
    )

    // click on the expand arrow
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(screen.getByRole('treeitem').querySelector('.PRIVATE_TreeView-item-toggle')!)

    expect(screen.getByText('file99')).toBeInTheDocument()
    expect(screen.queryByText('file100')).not.toBeInTheDocument()
    await act(async () => {
      jest.runAllTimers()
    })
    expect(screen.getByText('file100')).toBeInTheDocument()
  })

  it('shows an error if fetching folders fails', async () => {
    render(
      <WrapPane path="src/app">
        <ReposFileTreePane
          {...defaultPaneProps}
          fileTree={{'': {items: [src], totalCount: 1}}}
          foldersToFetch={['invalid/path']}
        />
      </WrapPane>,
    )

    mockFetch.rejectPendingRequest('/owner/repo/tree/main/invalid/path?noancestors=1', 'error')
    const errorElement = await screen.findByText('Some files could not be loaded.')
    expect(errorElement).toBeInTheDocument()
  })

  it('shows a spinner when fetching folders', () => {
    render(
      <WrapPane path="src/app">
        <ReposFileTreePane
          {...defaultPaneProps}
          fileTree={{'': {items: [src], totalCount: 1}}}
          foldersToFetch={['src']}
        />
      </WrapPane>,
    )
    expect(screen.getByLabelText('Loading file tree')).toBeInTheDocument()
  })

  it('cancels search if ESC is pressed', async () => {
    window.focus = jest.fn()

    const setQuery = jest.fn()

    const {user} = render(
      <WrapPane path="any" query="a" setQuery={setQuery}>
        <ReposFileTreePane {...defaultPaneProps} fileTree={{'': {items: [], totalCount: 0}}} />
      </WrapPane>,
    )

    expect(screen.queryAllByRole('treeitem')).toHaveLength(0)

    const searchInput = screen.getByRole<HTMLInputElement>('textbox', {name: 'Go to file'})

    await act(async () => {
      searchInput.focus()
      await user.keyboard('[Escape]')
    })

    expect(setQuery).toHaveBeenCalledWith('')

    expectAnalyticsEvents<RepositoryClickTarget>({
      type: 'repository.keydown',
      target: 'FILE_TREE.CANCEL_SEARCH',
    })
  })

  it('does not show the tree when the payload includes an invalid ref', async () => {
    const propsWithInvalidRef = {
      ...defaultPaneProps,
      refInfo: {
        name: 'main-invalid',
        canEdit: true,
        currentOid: '',
        listCacheKey: '',
      },
    }

    render(
      <WrapPane path="src/app">
        <ReposFileTreePane {...propsWithInvalidRef} fileTree={{'': {items: [src], totalCount: 1}}} />
      </WrapPane>,
    )

    expect(screen.getByText('Ref is invalid')).toBeInTheDocument()
  })

  it('shows file comment counts when available', async () => {
    function getFileTrailingVisual(item: DirectoryItem) {
      switch (item.path) {
        case 'readme':
          return {
            trailingVisual: (
              <span>
                2
                <CommentIcon />
              </span>
            ),
            screenReaderText: ', has 2 comments',
          }
        case 'src/app':
          return {
            trailingVisual: (
              <span>
                1
                <CommentIcon />
              </span>
            ),
            screenReaderText: ', has 1 comment',
          }
        default:
          return undefined
      }
    }

    await renderTreeComponent(
      {
        '': {
          items: [src, readme],
          totalCount: 2,
        },
        src: {
          items: [app],
          totalCount: 1,
        },
      },
      'src/app',
      {getFileTrailingVisual},
    )

    const readmeFile = screen.getByText('readme')
    const appFile = screen.getByText('app')

    expect(readmeFile).toBeInTheDocument()
    expect(appFile).toBeInTheDocument()

    expect(screen.getByText(', has 2 comments', {selector: '.sr-only'})).toBeInTheDocument()
    expect(screen.getByText(', has 1 comment', {selector: '.sr-only'})).toBeInTheDocument()
  })
})

async function renderTreeComponent(
  data: ReposFileTreeData,
  path = 'src/app',
  props: Partial<ComponentProps<typeof ReposFileTreePane>> = {},
) {
  // We need to wrap these renders in act because the mock fetch response fires as part of the render
  let r: ReturnType<typeof render>

  // eslint-disable-next-line testing-library/no-unnecessary-act
  await act(async () => {
    r = render(buildTreeComponent(data, path, props))
  })
  return r!
}

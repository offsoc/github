import type {DirectoryItem} from '@github-ui/code-view-types'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'

import {FileTreeRow, ReposFileTreeView, WrappedDirectoryTreeRow} from '../components/ReposFileTreeView'
import {FileTreeControlProvider} from '../contexts/FileTreeControlContext'
import {sampleItems, sampleTreeProps, Wrap} from './test-utils'

jest.mock('@github-ui/code-view-shared/hooks/use-repos-analytics', () => {
  return {
    __esModule: true,
    useReposAnalytics: () => ({sendRepoClickEvent: jest.fn()}),
  }
})

// eslint-disable-next-line compat/compat
window.requestIdleCallback = jest.fn()
window.open = jest.fn()
jest.useFakeTimers()

describe('ReposFileTreeView', () => {
  const child = {
    items: [],
    data: {contentType: 'file', name: 'child', path: 'parent/child'} as DirectoryItem,
  }
  const parent = {
    items: [child],
    data: {contentType: 'directory', name: 'parent', path: 'parent'} as DirectoryItem,
  }

  const directoryProps = {
    directory: parent,
    isActive: false,
    isSimplifiedPathActive: false,
    onItemSelected: () => undefined,
    onSelect: () => undefined,
    dispatchKnownFolders: () => undefined,
    getItemUrl: () => 'any-url',
    getFetchUrl: () => 'fetch-url',
    selectedItemRef: () => undefined,
    navigate: jest.fn(),
  }

  const fileProps = {
    ...directoryProps,
    file: child,
  }

  it('renders tree', () => {
    render(
      <Wrap path="any">
        <ReposFileTreeView {...sampleTreeProps} />
      </Wrap>,
    )
    expect(screen.getByText('readme')).toBeVisible()
  })

  //disabling this test because the method of making the fileTreeView not visible now exists externally to
  //the fileTreeView component through CSS classes
  it.skip('hides tree if not visible', () => {
    render(
      <Wrap path="any">
        <ReposFileTreeView {...sampleTreeProps} />
      </Wrap>,
    )
    expect(screen.queryByText('readme')).not.toBeVisible()
  })

  it('uses contains-intrinsic-size', () => {
    render(
      <Wrap path="any">
        <WrappedDirectoryTreeRow {...directoryProps} isAncestorOfActive={false} />
      </Wrap>,
    )
    const treeItem = screen.queryByRole('treeitem')
    expect(treeItem).toBeInTheDocument()
    // eslint-disable-next-line testing-library/no-node-access
    const container = treeItem!.querySelector('.PRIVATE_TreeView-item-container') as HTMLElement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((container.style as any)['containIntrinsicSize']).toEqual('auto 2rem')
  })

  it('shows a tooltip when focused and overflowing', async () => {
    render(
      <Wrap path="any">
        <WrappedDirectoryTreeRow {...directoryProps} isAncestorOfActive={false} />
      </Wrap>,
    )
    const treeItem = screen.queryByRole('treeitem')
    expect(treeItem).toBeInTheDocument()
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {configurable: true, value: 500})
    fireEvent.focus(treeItem!)
    const tooltip = await screen.findByTestId('parent-directory-item-tooltip')
    expect(tooltip).toBeInTheDocument()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (HTMLElement.prototype as any).scrollWidth
  })

  it('shows a tooltip when hovered and overflowing', async () => {
    render(
      <Wrap path="any">
        <FileTreeRow {...fileProps} />
      </Wrap>,
    )
    const treeItem = screen.queryByRole('treeitem')
    expect(treeItem).toBeInTheDocument()
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {configurable: true, value: 500})
    fireEvent.mouseEnter(treeItem!)
    const tooltip = await screen.findByTestId('child-item-tooltip')
    expect(tooltip).toBeInTheDocument()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (HTMLElement.prototype as any).scrollWidth
  })

  it('expands a DirectoryTreeRow when becoming active', () => {
    const {rerender} = render(
      <Wrap path="any">
        <WrappedDirectoryTreeRow {...directoryProps} isAncestorOfActive={false} />
      </Wrap>,
    )
    // Initially folder children are not loaded, so child cannot be present
    expect(screen.queryByText('child')).not.toBeInTheDocument()

    rerender(
      <Wrap path="parent/child">
        <WrappedDirectoryTreeRow {...directoryProps} isAncestorOfActive={true} />
      </Wrap>,
    )
    // When the node becomes active (perhaps programatically), it will get expanded
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('collapses a DirectoryTreeRow when removing children', () => {
    const {rerender} = render(
      <Wrap path="any">
        <WrappedDirectoryTreeRow {...directoryProps} isAncestorOfActive={true} />
      </Wrap>,
    )

    expect(screen.getByText('child')).toBeInTheDocument()

    const emptyParent = {
      ...parent,
      items: [],
    }

    rerender(
      <Wrap path="any">
        <WrappedDirectoryTreeRow {...directoryProps} directory={emptyParent} isAncestorOfActive={false} />
      </Wrap>,
    )

    expect(screen.queryByText('child')).not.toBeInTheDocument()
  })

  it('Does not select when clicking on active item', () => {
    const onItemSelectedMock = jest.fn()
    const {rerender} = render(
      <Wrap path="any">
        <FileTreeRow {...fileProps} isActive={false} onItemSelected={onItemSelectedMock} />
      </Wrap>,
    )

    const item = screen.getByRole('treeitem')
    fireEvent.click(item.childNodes[0]!)
    expect(onItemSelectedMock).toHaveBeenCalled()

    rerender(
      <Wrap path="any">
        <FileTreeRow {...fileProps} isActive={true} onItemSelected={onItemSelectedMock} />
      </Wrap>,
    )

    onItemSelectedMock.mockClear()
    fireEvent.click(item)
    expect(onItemSelectedMock).not.toHaveBeenCalled()
  })

  it('does not re-render rows on navigation', () => {
    const renderMock = jest.fn()

    const {rerender} = render(
      <Wrap path="src/app">
        <ReposFileTreeView {...sampleTreeProps} onRenderRow={renderMock} />
      </Wrap>,
    )

    // As the selected path is src/app, we expand src and render src, src/app, readme
    expect(renderMock).toHaveBeenCalledTimes(2)

    renderMock.mockClear()
    rerender(
      <Wrap path="none">
        <ReposFileTreeView {...sampleTreeProps} onRenderRow={renderMock} />
      </Wrap>,
    )

    // We re-render src/app that's not active anymore
    expect(renderMock).toHaveBeenCalledTimes(1)

    renderMock.mockClear()
    rerender(
      <Wrap path="readme">
        <ReposFileTreeView {...sampleTreeProps} onRenderRow={renderMock} />
      </Wrap>,
    )

    // We re-render readme which is the new active
    expect(renderMock).toHaveBeenCalledTimes(1)
  })

  it('Calls window.open when clicking with shortcut keys', () => {
    window.open = jest.fn()
    const onItemSelectedMock = jest.fn()
    render(
      <Wrap path="any">
        <FileTreeRow {...fileProps} isActive={false} onItemSelected={onItemSelectedMock} />
      </Wrap>,
    )

    const item = screen.getByRole('treeitem')
    fireEvent.click(item.childNodes[0]!, {metaKey: true})
    expect(onItemSelectedMock).not.toHaveBeenCalled()
    expect(window.open).toHaveBeenCalled()

    fireEvent.click(item.childNodes[0]!, {ctrlKey: true})
    expect(onItemSelectedMock).not.toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledTimes(2)

    fireEvent.click(item.childNodes[0]!, {button: 1})
    expect(onItemSelectedMock).not.toHaveBeenCalled()
    expect(window.open).toHaveBeenCalledTimes(3)
  })

  it('Correctly handles a tree refresh', () => {
    const {rerender} = render(
      <Wrap path="any">
        <ReposFileTreeView {...sampleTreeProps} />
      </Wrap>,
    )

    rerender(
      <Wrap path="any">
        <FileTreeControlProvider>
          <ReposFileTreeView
            {...sampleTreeProps}
            data={{
              '': {
                items: [sampleItems.src, sampleItems.readme],
                totalCount: 2,
              },
            }}
          />
        </FileTreeControlProvider>
      </Wrap>,
    )

    expect(screen.getByText('src')).toBeInTheDocument()
    expect(screen.getByText('readme')).toBeInTheDocument()
    expect(screen.queryByText('app')).not.toBeInTheDocument()
  })
})

import {useFilesPageInfo} from '@github-ui/code-view-shared/contexts/FilesPageInfoContext'
import {useReposAnalytics} from '@github-ui/code-view-shared/hooks/use-repos-analytics'
import {useUrlCreator} from '@github-ui/code-view-shared/hooks/use-url-creator'
import type {DirectoryItem, ReposFileTreeData} from '@github-ui/code-view-types'
import {PortalTooltip} from '@github-ui/portal-tooltip/portalled'
import {useFileTreeTooltip} from '@github-ui/use-file-tree-tooltip'
import {useNavigate} from '@github-ui/use-navigate'
import {AlertFillIcon, FileIcon, FileSubmoduleIcon} from '@primer/octicons-react'
import {Box, Octicon, Spinner, type SxProp, TreeView} from '@primer/react'
import React, {useEffect, useState} from 'react'
import type {NavigateOptions, To} from 'react-router-dom'

import {type dispatchKnownFoldersFunction, useFileTreeContext} from '../contexts/FileTreeContext'
import {useFileTreeControlContext} from '../contexts/FileTreeControlContext'
import useFetchFolder, {splitSimplifiedTreeItem} from '../hooks/use-fetch-folder'
import type {TreeItem} from '../types/tree-item'

export function buildReposFileTree(
  folders: ReposFileTreeData,
  knownFolders: Map<string, TreeItem<DirectoryItem>>,
  rootItems: Array<TreeItem<DirectoryItem>>,
  sortDirectoryItems?: (items: Array<TreeItem<DirectoryItem>>) => void,
) {
  if (!folders) return {newRootItems: rootItems, rootItemsUpdated: false}
  const rootItemsUpdated = folders[''] ? addFolder('', knownFolders, rootItems, folders[''].items) : false
  sortDirectoryItems?.(rootItems)
  for (const path of Object.keys(folders).sort()) {
    if (path) {
      const parent = knownFolders.get(path)
      if (parent) {
        addFolder(path, knownFolders, parent.items, folders[path]!.items, sortDirectoryItems)
        parent.data.totalCount = folders[path]!.totalCount
      }
    }
  }
  return {newRootItems: rootItems, rootItemsUpdated}
}

function addFolder(
  path: string,
  knownFolders: Map<string, TreeItem<DirectoryItem>>,
  parentItems: Array<TreeItem<DirectoryItem>>,
  items: DirectoryItem[],
  sortDirectoryItems?: (items: Array<TreeItem<DirectoryItem>>) => void,
) {
  let parentItemsUpdated = false
  for (const item of items) {
    const fullPath = path ? `${path}/${item.name}` : item.name
    if (!knownFolders.get(fullPath)) {
      const treeItem: TreeItem<DirectoryItem> = {items: [], data: {...item}}
      knownFolders.set(fullPath, treeItem)
      if (item.hasSimplifiedPath) {
        const topTreeItem = splitSimplifiedTreeItem(treeItem, item, knownFolders)
        const existingItemIndex = parentItems.findIndex(parentItem => parentItem.data.path === topTreeItem.data.path)
        if (existingItemIndex !== -1) {
          if (topTreeItem.items.length > parentItems[existingItemIndex]!.items.length) {
            parentItems[existingItemIndex] = topTreeItem
            parentItemsUpdated = true
          }
        } else {
          parentItems.push(topTreeItem)
          sortDirectoryItems?.(parentItems)
        }
      } else {
        parentItems.push(treeItem)
        sortDirectoryItems?.(parentItems)
      }
    }
  }
  return parentItemsUpdated
}

interface CommonProps {
  clientOnlyFilePaths?: string[]
  getItemUrl: (item: DirectoryItem) => string
  onItemSelected?(): void
  onRenderRow?(): void
  selectedItemRef?: React.Ref<HTMLElement>
  getFileTrailingVisual?: (item: DirectoryItem) =>
    | {
        trailingVisual: JSX.Element
        screenReaderText?: string
      }
    | undefined
  getFileIcon?: (item: DirectoryItem) => JSX.Element | null
}

interface ReposFileTreeViewProps extends CommonProps, SxProp {
  data: ReposFileTreeData
  rootItems: Array<TreeItem<DirectoryItem>>
  setRootItems: (rootItems: Array<TreeItem<DirectoryItem>>) => void
  processingTime: number
  loading: boolean
  fetchError: boolean
  directoryNavigateOnClick?: boolean
  sortDirectoryItems?: (items: Array<TreeItem<DirectoryItem>>) => void
}

interface FileTreeRowProps extends CommonProps {
  isActive: boolean
  file: TreeItem<DirectoryItem>
  navigate: (to: To, options?: NavigateOptions) => void
}

interface DirectoryTreeRowProps extends CommonProps {
  directory: TreeItem<DirectoryItem>
  depth?: number
  isActive: boolean
  isAncestorOfActive: boolean
  leadingPath?: string
  dispatchKnownFolders: dispatchKnownFoldersFunction
  navigate: (to: To, options?: NavigateOptions) => void
  navigateOnClick?: boolean
  getFetchUrl: (item: DirectoryItem) => string
}

interface DirectoryContentsProps extends CommonProps {
  directoryItems: Array<TreeItem<DirectoryItem>>
  leadingPath?: string
  inheritsActive?: boolean
  dispatchKnownFolders: dispatchKnownFoldersFunction
  directoryNavigateOnClick?: boolean
}

function WrappedFileTreeRow({
  isActive,
  file,
  onItemSelected,
  getItemUrl,
  selectedItemRef,
  navigate,
  onRenderRow,
  getFileTrailingVisual,
  getFileIcon,
}: FileTreeRowProps) {
  const {sendRepoClickEvent} = useReposAnalytics()
  const rowRef = React.useRef<HTMLElement>(null)
  const showTooltip = useFileTreeTooltip({focusRowRef: rowRef, mouseRowRef: rowRef})
  const isSubModule = file.data.contentType === 'submodule'
  const trailingVisualData = getFileTrailingVisual?.(file.data)

  const onSelect = React.useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>) => {
      if (isSubModule) {
        e.preventDefault()
        if (file.data.submoduleUrl) {
          window.location.href = file.data.submoduleUrl
        }
      } else {
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        if (e.metaKey || e.ctrlKey || (e as React.MouseEvent<HTMLElement, MouseEvent>).button === 1) {
          window.open(getItemUrl(file.data), '_blank')
          e.preventDefault()
        } else if (isActive) {
          e.preventDefault()
        } else {
          onItemSelected?.()
          sendRepoClickEvent('FILES_TREE.ITEM', {['item_path']: file.data.path})
          navigate(getItemUrl(file.data))
          e.stopPropagation()
        }
      }
    },
    [file.data, getItemUrl, isActive, isSubModule, navigate, onItemSelected, sendRepoClickEvent],
  )

  onRenderRow?.()

  // TODO: ideally we would pass as={Link} to the LinkItem if Primer supported it.
  return (
    <TreeView.Item
      ref={rowRef}
      onSelect={onSelect}
      current={isActive}
      id={`${file.data.path}-item`}
      containIntrinsicSize={!isActive ? 'auto 2rem' : undefined}
    >
      <TreeView.LeadingVisual>
        {getFileIcon ? getFileIcon(file.data) : isSubModule ? <FileSubmoduleIcon /> : <FileIcon />}
      </TreeView.LeadingVisual>
      <>
        <span
          ref={selectedItemRef}
          style={{color: isSubModule ? 'var(--fgColor-accent, var(--color-accent-fg))' : undefined}}
        >
          {file.data.name}
        </span>
        {showTooltip && (
          <PortalTooltip
            data-testid={`${file.data.name}-item-tooltip`}
            id={`${file.data.name}-item-tooltip`}
            contentRef={rowRef}
            aria-label={file.data.name}
            open={true}
            direction="ne"
          />
        )}
      </>
      {!!trailingVisualData?.screenReaderText && <span className="sr-only">{trailingVisualData.screenReaderText}</span>}
      {!!trailingVisualData?.trailingVisual && (
        <TreeView.TrailingVisual>{trailingVisualData.trailingVisual}</TreeView.TrailingVisual>
      )}
    </TreeView.Item>
  )
}

export const FileTreeRow = React.memo(WrappedFileTreeRow)

export function WrappedDirectoryTreeRow({
  clientOnlyFilePaths,
  directory,
  isActive,
  isAncestorOfActive,
  leadingPath = '',
  onItemSelected,
  dispatchKnownFolders,
  getItemUrl,
  getFetchUrl,
  selectedItemRef,
  navigate,
  onRenderRow,
  getFileTrailingVisual,
  getFileIcon,
  navigateOnClick = true,
}: DirectoryTreeRowProps): JSX.Element {
  const {expandAllFolders, shouldFetchFolders} = useFileTreeControlContext()
  const [isExpanded, setExpanded] = useState(expandAllFolders?.current || isAncestorOfActive)
  const {sendRepoClickEvent} = useReposAnalytics()
  const rowRef = React.useRef<HTMLElement | null>(null)
  const listItemRef = React.useRef<HTMLElement>(null)
  const showTooltip = useFileTreeTooltip({focusRowRef: listItemRef, mouseRowRef: rowRef})

  const [fetchFolder, incrementallyShowItems, items, loading, error, clearError, totalCount] = useFetchFolder(
    directory,
    dispatchKnownFolders,
    getFetchUrl,
  )
  const truncatedRows = totalCount - items.length
  const pathPrefix = leadingPath ? `${leadingPath}/` : ''

  useEffect(() => {
    if (expandAllFolders?.current && !isExpanded) {
      setExpanded(true)
    }
  }, [directory, expandAllFolders, isExpanded])

  const onToggleExpanded = React.useCallback(
    (expanded: boolean) => {
      if (expandAllFolders?.current) {
        expandAllFolders.current = false
      }
      const willExpand = expanded && !isExpanded
      if (willExpand && !loading && !error) {
        if (directory.items.length > 100) {
          incrementallyShowItems()
        } else if (
          directory.items.length === 0 &&
          !isActive &&
          !isAncestorOfActive &&
          shouldFetchFolders?.current !== false
        ) {
          fetchFolder(clientOnlyFilePaths)
        }
      }
      if (expanded !== isExpanded) {
        setExpanded(expanded)
      }
    },
    [
      expandAllFolders,
      isExpanded,
      loading,
      error,
      directory.items.length,
      isActive,
      isAncestorOfActive,
      shouldFetchFolders,
      incrementallyShowItems,
      fetchFolder,
      clientOnlyFilePaths,
    ],
  )

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>) => {
      if (
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        e.metaKey ||
        // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
        e.ctrlKey ||
        ((e as React.MouseEvent<HTMLElement, MouseEvent>).button === 1 && navigateOnClick)
      ) {
        window.open(getItemUrl(directory.data), '_blank')
        e.preventDefault()
      } else if (isActive) {
        e.preventDefault()
      } else {
        onItemSelected?.()
        sendRepoClickEvent('FILES_TREE.ITEM', {['item_path']: directory.data.path})
        if (navigateOnClick) {
          navigate(getItemUrl(directory.data))
        } else {
          onToggleExpanded?.(!isExpanded)
        }
        e.stopPropagation()
      }
    },
    [
      directory.data,
      getItemUrl,
      isActive,
      isExpanded,
      navigate,
      navigateOnClick,
      onItemSelected,
      onToggleExpanded,
      sendRepoClickEvent,
    ],
  )

  // Expand when becoming active, or being an ancestor of the active path
  React.useEffect(() => {
    if (isAncestorOfActive && !isExpanded) {
      onToggleExpanded?.(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We don't want to reevaluate when isExpanded changes
  }, [isAncestorOfActive])

  // Collapse when all items have been removed.
  React.useEffect(() => {
    if (directory.items.length === 0 && isExpanded) {
      onToggleExpanded?.(false)
    } else if (!isExpanded && directory.autoExpand) {
      onToggleExpanded?.(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- We don't want to reevaluate when isExpanded changes
  }, [directory.items.length])

  const setRowRef = React.useCallback(
    (refElem: HTMLElement) => {
      if (selectedItemRef && isActive) {
        ;(selectedItemRef as (item: HTMLElement) => void)(refElem)
      }
      rowRef.current = refElem
    },
    [selectedItemRef, isActive],
  )

  // combine this directory with its child if it has no files and only one child directory
  if (directory.items.length === 1 && directory.items[0]!.data.contentType === 'directory') {
    return (
      <DirectoryContents
        clientOnlyFilePaths={clientOnlyFilePaths}
        directoryItems={directory.items}
        leadingPath={pathPrefix + directory.data.name}
        inheritsActive={isActive}
        dispatchKnownFolders={dispatchKnownFolders}
        onItemSelected={onItemSelected}
        selectedItemRef={selectedItemRef}
        getItemUrl={getItemUrl}
        directoryNavigateOnClick={navigateOnClick}
        getFileTrailingVisual={getFileTrailingVisual}
        getFileIcon={getFileIcon}
      />
    )
  }

  onRenderRow?.()

  return (
    <TreeView.Item
      ref={listItemRef}
      expanded={isExpanded}
      onExpandedChange={onToggleExpanded}
      current={isActive}
      onSelect={onClick}
      id={`${directory.data.path}-item`}
      containIntrinsicSize={!isActive ? 'auto 2rem' : undefined}
    >
      <TreeView.LeadingVisual>
        <TreeView.DirectoryIcon />
      </TreeView.LeadingVisual>
      <>
        <span ref={setRowRef}>
          {pathPrefix}
          {directory.data.name}
        </span>
        {showTooltip && (
          <PortalTooltip
            data-testid={`${directory.data.name}-directory-item-tooltip`}
            id={`${directory.data.name}-directory-item-tooltip`}
            contentRef={listItemRef}
            aria-label={`${pathPrefix}${directory.data.name}`}
            open={true}
            direction="ne"
          />
        )}
      </>

      <TreeView.SubTree state={loading ? 'loading' : error ? 'error' : 'done'}>
        {error ? (
          <TreeView.ErrorDialog onRetry={fetchFolder} onDismiss={clearError}>
            There was an error loading the folder contents.
          </TreeView.ErrorDialog>
        ) : (
          <>
            <DirectoryContents
              clientOnlyFilePaths={clientOnlyFilePaths}
              directoryItems={items}
              dispatchKnownFolders={dispatchKnownFolders}
              onItemSelected={onItemSelected}
              selectedItemRef={selectedItemRef}
              getItemUrl={getItemUrl}
              directoryNavigateOnClick={navigateOnClick}
              getFileTrailingVisual={getFileTrailingVisual}
              getFileIcon={getFileIcon}
            />
            {truncatedRows > 0 && <ErrorTreeRow message={`${truncatedRows} entries not shown`} />}
          </>
        )}
      </TreeView.SubTree>
    </TreeView.Item>
  )
}

const DirectoryTreeRow = React.memo(WrappedDirectoryTreeRow)

function WrappedDirectoryContents({
  clientOnlyFilePaths,
  directoryItems,
  leadingPath,
  inheritsActive,
  onItemSelected,
  dispatchKnownFolders,
  selectedItemRef,
  onRenderRow,
  getItemUrl,
  getFileTrailingVisual,
  getFileIcon,
  directoryNavigateOnClick = true,
}: DirectoryContentsProps): JSX.Element {
  const {path} = useFilesPageInfo()
  const urlCreator = useUrlCreator()
  const navigate = useNavigate()
  // This prevents rerenders on soft navs, but may not be entirely safe. If the routes or history change
  // from the app context then we will not recalculate the function.
  const navigateRef = React.useRef(navigate)

  return (
    <>
      {directoryItems.map(item => {
        const isActive: boolean = path === item.data.path
        const isAncestorOfActive = isActive || path.startsWith(`${item.data.path}/`)
        return item.data.contentType === 'directory' ? (
          <DirectoryTreeRow
            clientOnlyFilePaths={clientOnlyFilePaths}
            isActive={inheritsActive || isActive}
            isAncestorOfActive={isAncestorOfActive}
            key={item.data.name}
            onItemSelected={onItemSelected}
            leadingPath={leadingPath}
            directory={item}
            dispatchKnownFolders={dispatchKnownFolders}
            getItemUrl={getItemUrl}
            getFetchUrl={urlCreator.getItemUrl}
            selectedItemRef={isAncestorOfActive ? selectedItemRef : undefined}
            navigate={navigateRef.current}
            onRenderRow={onRenderRow}
            navigateOnClick={directoryNavigateOnClick}
            getFileTrailingVisual={getFileTrailingVisual}
            getFileIcon={getFileIcon}
          />
        ) : (
          <FileTreeRow
            key={item.data.name}
            onItemSelected={onItemSelected}
            file={item}
            isActive={isActive}
            getItemUrl={getItemUrl}
            selectedItemRef={isActive ? selectedItemRef : undefined}
            navigate={navigateRef.current}
            onRenderRow={onRenderRow}
            getFileTrailingVisual={getFileTrailingVisual}
            getFileIcon={getFileIcon}
          />
        )
      })}
    </>
  )
}

const DirectoryContents = React.memo(WrappedDirectoryContents)

export function ReposFileTreeView(props: ReposFileTreeViewProps) {
  const {
    clientOnlyFilePaths,
    data,
    rootItems,
    setRootItems,
    fetchError,
    processingTime,
    loading,
    onRenderRow,
    getItemUrl,
    getFileTrailingVisual,
    getFileIcon,
    sortDirectoryItems,
  } = props
  const {knownFolders, dispatchKnownFolders} = useFileTreeContext()
  const {refreshTree} = useFileTreeControlContext()

  React.useEffect(() => {
    if (loading) {
      return
    }
    let newKnownFolders = new Map()
    let newKnownRootItems: Array<TreeItem<DirectoryItem>> = []

    if (!refreshTree?.current) {
      newKnownFolders = new Map(knownFolders)
      newKnownRootItems = rootItems.slice()
    }

    const {newRootItems, rootItemsUpdated} = buildReposFileTree(
      data,
      newKnownFolders,
      newKnownRootItems,
      sortDirectoryItems,
    )
    if (newRootItems.length > rootItems.length || rootItemsUpdated || refreshTree?.current) {
      setRootItems(newRootItems)
    }
    if (newKnownFolders.size > knownFolders.size || refreshTree?.current) {
      dispatchKnownFolders({type: 'set', folders: newKnownFolders, processingTime})
    }

    if (refreshTree?.current) {
      refreshTree.current = false
    }
    // Only run when the data or loading props change to bring the known folders up to date.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading])

  const onMouseDown = React.useCallback((event: React.MouseEvent) => {
    // Prevent middle click from performing a scroll so it can activate the link.
    if (event.button === 1) {
      event.preventDefault()
    }
  }, [])

  return (
    <Box
      onMouseDown={onMouseDown}
      sx={{
        px: 3,
        pb: 2,
        ...props.sx,
      }}
      data-testid="repos-file-tree-container"
    >
      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
          <Spinner aria-label="Loading file tree" />
        </Box>
      ) : (
        <nav aria-label="File Tree Navigation">
          <TreeView aria-label="Files">
            {fetchError && <ErrorTreeRow message="Some files could not be loaded." />}
            <DirectoryContents
              clientOnlyFilePaths={clientOnlyFilePaths}
              directoryItems={rootItems}
              onItemSelected={props.onItemSelected}
              dispatchKnownFolders={dispatchKnownFolders}
              selectedItemRef={props.selectedItemRef}
              onRenderRow={onRenderRow}
              directoryNavigateOnClick={props.directoryNavigateOnClick}
              getItemUrl={getItemUrl}
              getFileTrailingVisual={getFileTrailingVisual}
              getFileIcon={getFileIcon}
            />
          </TreeView>
        </nav>
      )}
    </Box>
  )
}

function ErrorTreeRow({message}: {message?: string}) {
  const errorMessage = message || "Couldn't load."
  return (
    <TreeView.Item id="error-tree-row">
      <TreeView.LeadingVisual>
        <Octicon icon={AlertFillIcon} sx={{color: 'attention.fg'}} />
      </TreeView.LeadingVisual>
      <Box sx={{color: 'fg.muted'}}>{errorMessage}</Box>
    </TreeView.Item>
  )
}

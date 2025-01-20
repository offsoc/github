import {FileQueryProvider} from '@github-ui/code-view-shared/contexts/FileQueryContext'
import {useCanonicalObject} from '@github-ui/code-view-shared/hooks/use-canonical-object'
import type {DirectoryItem} from '@github-ui/code-view-types'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {ReposFileTreePane, type TreePane, useFileTreeControlContext} from '@github-ui/repos-file-tree-view'
import {ScreenSize} from '@github-ui/screen-size'
import {useNavigate} from '@github-ui/use-navigate'
import {FileStatusIcon} from '@github-ui/web-commit-dialog/FileStatusIcon'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useLocation} from 'react-router-dom'

import {useFilesContext} from '../contexts/FilesContext'
import {useIsFileEditorPage} from '../hooks/path-match-hooks'
import {type CopilotTaskBasePayload, FileFilter} from '../utilities/copilot-task-types'
import {isAdded, isModified} from '../utilities/file-status-helpers'
import {treeHeightSx} from '../utilities/layout'
import {compareDirectoryItems} from '../utilities/tree-helpers'
import {fileUrl} from '../utilities/urls'
import {FileTreeHeader} from './FileTreeHeader'

interface FileTreeProps extends TreePane {
  textAreaId: string
  offsetTop?: number
}

export function FileTree(props: FileTreeProps) {
  const {
    isTreeExpanded,
    treeToggleRef,
    treeToggleElement,
    searchBoxRef,
    expandTree,
    collapseTree,
    textAreaId,
    offsetTop = 0,
  } = props
  const payload = useRoutePayload<CopilotTaskBasePayload>()
  const {getFileStatuses, getFileTreeData, getNewFilePaths} = useFilesContext()
  const repo = useCurrentRepository()
  const {fileStatuses = {}, path, pullRequest} = payload
  const refInfo = useCanonicalObject(payload.refInfo)
  const fileTreeId = 'repos-file-tree'
  const [currentFilter, setCurrentFilter] = useState<FileFilter>(FileFilter.PR)
  const showAllFiles = currentFilter === FileFilter.All
  const isFileEditor = useIsFileEditorPage()

  const {setExpandAllFolders, setShouldFetchFolders} = useFileTreeControlContext()
  setShouldFetchFolders?.(showAllFiles)
  setExpandAllFolders?.(!showAllFiles)

  const filteredFileTree = getFileTreeData(currentFilter)
  const newFilePaths = useMemo(() => getNewFilePaths(), [getNewFilePaths])

  const navigate = useNavigate()
  const getFileIcon = useCallback(
    (item: DirectoryItem) => {
      const localStatuses = getFileStatuses()
      const fileStatus =
        isAdded(fileStatuses[item.path]) && isModified(localStatuses[item.path])
          ? 'A'
          : localStatuses[item.path] ?? fileStatuses[item.path]
      return <FileStatusIcon status={fileStatus} />
    },
    [fileStatuses, getFileStatuses],
  )

  // When a tree item is selected, collapse the tree if the screen is small
  const onTreeItemSelected = useCallback(() => {
    if (window.innerWidth < ScreenSize.large) {
      collapseTree({focus: null})
    }
  }, [collapseTree])

  const onFindFilesShortcut = useCallback(() => {
    if (window.innerWidth < ScreenSize.large) {
      expandTree({focus: 'search'})
    }
  }, [expandTree])

  const location = useLocation()
  const getItemUrl = useCallback(
    (item: DirectoryItem) => {
      return fileUrl({
        owner: repo.ownerLogin,
        repo: repo.name,
        path: item.path,
        pullNumber: pullRequest.number,
        location,
      })
    },
    [pullRequest.number, repo.name, repo.ownerLogin, location],
  )

  const tryNavigateToFirstFile = useCallback(
    (filter: FileFilter) => {
      const paths = getFileTreeData(filter)
      if (!paths) return

      const flattenedDiffPaths = Object.keys(paths)
        .map((key: string) => paths[key]!.items)
        .flat()

      if (!flattenedDiffPaths.some((item: DirectoryItem) => item.path === path)) {
        const firstPath = flattenedDiffPaths.find((item: DirectoryItem) => item.contentType === 'file')?.path
        if (firstPath) {
          const url = fileUrl({
            owner: repo.ownerLogin,
            repo: repo.name,
            pullNumber: pullRequest.number,
            path: firstPath,
            location,
          })
          navigate(url)
        }
      }
    },
    [getFileTreeData, location, navigate, path, pullRequest.number, repo.name, repo.ownerLogin],
  )

  useEffect(() => {
    if (!isFileEditor) return

    // If the page loads with a path that is not in the tree, navigate to the first file in the tree.
    // This can happen if the user resets changes, switches between PR and All files, etc.
    tryNavigateToFirstFile(currentFilter)
  }, [currentFilter, tryNavigateToFirstFile, isFileEditor])

  const treeHeaderComponent = (
    <FileTreeHeader
      additionalSearchableFiles={newFilePaths}
      currentFilter={currentFilter}
      isTreeExpanded={isTreeExpanded}
      onAddFileClick={onTreeItemSelected}
      onSetCurrentFilter={setCurrentFilter}
      treeToggleElement={treeToggleElement}
    />
  )

  return (
    <FileQueryProvider>
      <ReposFileTreePane
        id={fileTreeId}
        repo={repo}
        path={path}
        isFilePath={true}
        refInfo={refInfo}
        clientOnlyFilePaths={newFilePaths}
        collapseTree={collapseTree}
        showTree={isTreeExpanded}
        fileTree={filteredFileTree ?? {}}
        onItemSelected={onTreeItemSelected}
        processingTime={payload.fileTreeProcessingTime}
        treeToggleRef={treeToggleRef}
        searchBoxRef={searchBoxRef}
        foldersToFetch={payload.foldersToFetch}
        onFindFilesShortcut={onFindFilesShortcut}
        textAreaId={textAreaId}
        showFindFile={false}
        directoryNavigateOnClick={false}
        getItemUrlOverride={getItemUrl}
        showRefSelectorRow={false}
        headerContent={treeHeaderComponent}
        headerSx={{p: 0}}
        paneContentsSx={treeHeightSx(offsetTop)}
        paneSx={treeHeightSx(offsetTop)}
        treeContainerSx={{py: 2, pl: 3, pr: 0}}
        getFileIcon={getFileIcon}
        sortDirectoryItems={directoryItems => directoryItems.sort((a, b) => compareDirectoryItems(a.data, b.data))}
      />
    </FileQueryProvider>
  )
}

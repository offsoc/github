import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {useFileTreeControlContext} from '@github-ui/repos-file-tree-view'
import {createContext, type PropsWithChildren, useCallback, useContext, useMemo} from 'react'

import {useLocalFileData} from '../hooks/use-local-file-data'
import type {CodeEditorPayload, FileDataStore} from '../utilities/copilot-task-types'
import {isAdded, isDeleted} from '../utilities/file-status-helpers'
import {removePathFromTree} from '../utilities/tree-helpers'

export type FilesContextData = {
  getNewFilePaths(): string[]
} & FileDataStore

export const FilesContext = createContext<FilesContextData | undefined>(undefined)

export function FilesContextProvider({children}: PropsWithChildren<unknown>) {
  const payload = useRoutePayload<CodeEditorPayload>()
  const {
    addFile,
    applySuggestionsToContent,
    editFile,
    getAppliedSuggestions,
    getChangedFiles,
    getCurrentFileContent,
    getFileStatuses,
    getFileTreeData,
    markFilesCommitted,
    renameFile,
    resetFiles,
  } = useLocalFileData()
  const {setRefreshTree} = useFileTreeControlContext()

  const renameFileWrapped = useCallback(
    ({
      oldFilePath,
      newFilePath,
      originalContent,
    }: {
      oldFilePath: string
      newFilePath: string
      originalContent: string | undefined
    }) => {
      // file tree is additive so we need to reset the tree to remove deleted files in the case where a file is renamed
      // multiple times in the same session - we don't want to continue showing intermediary files that are now gone.
      setRefreshTree?.(true)
      renameFile({oldFilePath, newFilePath, originalContent})

      // update the path in the payload so any re-renders triggered by the update will have the correct path
      payload.path = newFilePath
    },
    [payload, renameFile, setRefreshTree],
  )

  const markFilesCommittedWrapped = useCallback(
    (files: Iterable<string>) => {
      // file tree is additive so we need to reset the tree to remove deleted files
      setRefreshTree?.(true)

      const fileStatuses = getFileStatuses()
      const deletedFiles = Object.keys(fileStatuses).filter(path => isDeleted(fileStatuses[path]))

      // remove the old file from the tree payloads so the old item doesn't appear in the tree
      for (const deletedFile of deletedFiles) {
        removePathFromTree(payload.fileTree, deletedFile)
        payload.diffPaths && removePathFromTree(payload.diffPaths, deletedFile)
      }

      markFilesCommitted(files)
    },
    [getFileStatuses, markFilesCommitted, payload.diffPaths, payload.fileTree, setRefreshTree],
  )

  const resetFilesWrapped = useCallback(() => {
    // file tree is additive so we need to reset the tree to remove local-only files that are gone
    setRefreshTree?.(true)
    resetFiles()
  }, [resetFiles, setRefreshTree])

  const getNewFilePaths = useCallback(() => {
    const fileStatuses = getFileStatuses()
    return Object.keys(fileStatuses).filter(path => isAdded(fileStatuses[path]))
  }, [getFileStatuses])

  const filesContextData = useMemo(
    () => ({
      addFile,
      applySuggestionsToContent,
      editFile,
      getAppliedSuggestions,
      getChangedFiles,
      getCurrentFileContent,
      getFileStatuses,
      getFileTreeData,
      getNewFilePaths,
      markFilesCommitted: markFilesCommittedWrapped,
      renameFile: renameFileWrapped,
      resetFiles: resetFilesWrapped,
    }),
    [
      addFile,
      applySuggestionsToContent,
      editFile,
      getAppliedSuggestions,
      getChangedFiles,
      getCurrentFileContent,
      getFileStatuses,
      getFileTreeData,
      getNewFilePaths,
      markFilesCommittedWrapped,
      renameFileWrapped,
      resetFilesWrapped,
    ],
  )

  return <FilesContext.Provider value={filesContextData}>{children}</FilesContext.Provider>
}

export function useFilesContext() {
  const context = useContext(FilesContext)
  if (!context) {
    throw new Error('useFilesContext must be used within a FilesContextProvider')
  }

  return context
}

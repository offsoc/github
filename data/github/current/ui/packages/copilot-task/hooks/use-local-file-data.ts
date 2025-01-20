import {useCurrentRepository} from '@github-ui/current-repository'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {clearLocalStorage, useLocalStorage} from '@github-ui/use-safe-storage/local-storage'
import type {FileStatuses} from '@github-ui/web-commit-dialog'
import {applyPatch, type ParsedDiff, structuredPatch} from 'diff'
import {useCallback, useRef, useState} from 'react'

import {type BlobPayload, type CodeEditorPayload, type FileDataStore, FileFilter} from '../utilities/copilot-task-types'
import {isAdded} from '../utilities/file-status-helpers'
import {applySuggestions, problemWithSuggestion} from '../utilities/suggestion-helpers'
import {addPathToTree} from '../utilities/tree-helpers'

type FileData = {
  oldFilePath: string
  newFilePath: string
  oldContents: string
  newContents: string
}

/**
 * Returns a stable callback that will not change between renders but always calls the latest version of the function.
 * This is useful when we don't want changes in a function to trigger re-renders in consumers.
 */
const useStableCallback = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => {
  const trackingRef = useRef<(...args: A) => R>(fn)
  trackingRef.current = fn

  return useCallback((...args: A) => trackingRef.current(...args), [])
}

function areFileStatusesEqual(a: FileStatuses, b: FileStatuses): boolean {
  if (Object.keys(a).length !== Object.keys(b).length) return false
  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) return false
  }

  return true
}

function getFileStatusesFromPatches(patches: {[filePath: string]: ParsedDiff}): FileStatuses {
  return Object.keys(patches).reduce((result, path) => {
    const patch = patches[path]

    if (!patch || (!patch.oldFileName && !patch.newFileName)) return result

    if (!patch.oldFileName && patch.newFileName) {
      result[patch.newFileName] = 'A'
    } else if (patch.oldFileName && !patch.newFileName) {
      result[patch.oldFileName] = 'D'
    } else if (patch.oldFileName !== patch.newFileName) {
      result[patch.oldFileName!] = 'R'
    } else if (patch.oldFileName === patch.newFileName) {
      result[path] = 'M'
    }

    return result
  }, {} as FileStatuses)
}

function buildPatchesStorageKey(org: string, repoName: string, entityId: string) {
  return `hadron-editor-file-deltas/${org}/${repoName}/${entityId}`
}

function buildSuggestionsStorageKey(org: string, repoName: string, entityId: string) {
  return `hadron-editor-suggestions/${org}/${repoName}/${entityId}`
}

/**
 * Use browser local storage state to manage file data. Returned functions remain stable through edits except for the
 * `getFileStatuses` function. We don't want to trigger updates to consumers every time the file content changes.
 * Monaco handles updating the editor content for us and we don't want to re-render
 * every consumer of this data every time a character is entered.
 *
 * @returns FileDataStore implementation that uses browser local storage to manage file data
 */
export function useLocalFileData(): FileDataStore {
  const {diffPaths, focusedTask, fileTree, pullRequest} = useRoutePayload<CodeEditorPayload>()
  const {name, ownerLogin} = useCurrentRepository()
  const [patches, setPatches] = useLocalStorage<{[filePath: string]: ParsedDiff}>(
    buildPatchesStorageKey(ownerLogin, name, pullRequest.number),
    {},
  )
  const [appliedSuggestions, setAppliedSuggestions] = useLocalStorage<number[]>(
    buildSuggestionsStorageKey(ownerLogin, name, pullRequest.number),
    [],
  )
  const [fileStatuses, setFileStatuses] = useState<FileStatuses>(() => getFileStatusesFromPatches(patches))

  const updatePatchesAndStatuses = useStableCallback((newPatches: {[filePath: string]: ParsedDiff}) => {
    setPatches(newPatches)
    setFileStatuses(prevFileStatuses => {
      const newFileStatuses = getFileStatusesFromPatches(newPatches)
      if (!areFileStatusesEqual(prevFileStatuses, newFileStatuses)) {
        return newFileStatuses
      }

      return prevFileStatuses
    })
  })

  const formatPatches = useStableCallback((fileData: FileData[]) => {
    const patchesToWrite = fileData.map(({oldFilePath, oldContents, newFilePath, newContents}) => {
      const patch = structuredPatch(oldFilePath, newFilePath, oldContents, newContents)

      // this is to work around a bug in jsdiff itself - see https://github.com/kpdecker/jsdiff/issues/228
      for (const diff of patch.hunks) {
        diff.linedelimiters = Array(diff.lines.length).fill('\n')
      }

      return patch
    })

    const newPatches = {...patches}
    for (const patchToWrite of patchesToWrite) {
      const path = patchToWrite.newFileName || patchToWrite.oldFileName || ''
      newPatches[path] = patchToWrite
    }
    return newPatches
  })

  const applySuggestionsToContent = useStableCallback((originals: BlobPayload[]) => {
    const problem = problemWithSuggestion(appliedSuggestions, fileStatuses, focusedTask)
    if (problem) {
      alert(problem)
      return
    }

    // Tally up all the diffs we want for the current suggestion
    let newPatches = {...patches}
    for (const {path: filePath, blobContents: originalContent} of originals) {
      const currentContent = getCurrentFileContent(filePath, originalContent)
      const contents = applySuggestions(filePath, currentContent, focusedTask)
      const nextPatch = calculatePatches({filePath, originalContent, newFileContent: contents})
      newPatches = Object.assign(newPatches, nextPatch)
    }

    updatePatchesAndStatuses(newPatches)
    if (!appliedSuggestions.includes(focusedTask!.sourceId)) {
      setAppliedSuggestions([...appliedSuggestions, focusedTask!.sourceId])
    }
  })

  const getAppliedSuggestions = useCallback(() => {
    return appliedSuggestions
  }, [appliedSuggestions])

  /**
   * Returns the contents of the file as the editor should currently have -- i.e.
   * the original blob from server + any diffs that have been generated locally.
   *
   * It doesn't rely on the blobContents from the current route because that's tied
   * to the currently viewed file, and we want to use this with other files when
   * applying suggestions.
   */
  const getCurrentFileContent = useStableCallback((filePath: string, originalContent: string | undefined) => {
    const patch = patches[filePath]
    if (!patch) {
      return originalContent
    }

    const patchResult = applyPatch(originalContent ?? '', patch)

    // applyPatch returns false if the patch could not be applied so we only compare to false,
    // because we don't want empty string to be to be considered a failure
    // TODO: what should the behavior be if the patch can't be applied due to the underlying blob changing?
    return patchResult === false ? originalContent : patchResult
  })

  const getChangedFiles = useStableCallback(() => {
    const changedFiles = Object.keys(fileStatuses).map(path => {
      return {
        path,
        status: fileStatuses[path]!,
        patch: patches[path]!,
      }
    })
    return changedFiles
  })

  const getFileStatuses = useCallback(() => {
    return fileStatuses
  }, [fileStatuses])

  const getFileTreeData = useCallback(
    (mode: FileFilter) => {
      const localTree = {...(mode === FileFilter.PR ? diffPaths : fileTree)}
      for (const filePath of Object.keys(fileStatuses)) {
        // add files that only exist locally to the tree
        if (isAdded(fileStatuses[filePath])) {
          if (mode === FileFilter.PR) {
            addPathToTree(localTree, filePath, true)
          } else {
            addPathToTree(localTree, filePath)
          }
        }
      }

      return localTree
    },
    [diffPaths, fileStatuses, fileTree],
  )

  // Pure calculation of diff for cases where we want to generate more than one patch at a time
  const calculatePatches = useStableCallback(
    ({
      filePath,
      originalContent,
      newFileContent,
    }: {
      filePath?: string
      originalContent?: string
      newFileContent?: string
    }) => {
      if (!filePath) return

      // try to carry over the previous file path data to the new patch object
      let oldFilePath: string
      let newFilePath: string
      const prevPatch = patches[filePath]
      if (prevPatch) {
        oldFilePath = prevPatch.oldFileName ?? ''
        newFilePath = prevPatch.newFileName ?? ''
      } else {
        oldFilePath = filePath ?? ''
        newFilePath = oldFilePath
      }

      const oldContents = originalContent ?? ''
      const newContents = newFileContent ?? oldContents

      if (oldFilePath === newFilePath && oldContents === newContents) {
        // if the file is reverting back to an unmodified state, just delete the patch
        if (prevPatch) {
          const newPatches = {...patches}
          delete newPatches[filePath]
          return newPatches
        }
      } else {
        const patch = {oldContents, oldFilePath, newContents, newFilePath}
        const newPatches = formatPatches([patch])
        return newPatches
      }
    },
  )

  // Calculate diffs for new content and persist it to local storage
  const editFile = useStableCallback(
    ({
      filePath,
      originalContent,
      newFileContent,
    }: {
      filePath?: string
      originalContent?: string
      newFileContent?: string
    }) => {
      const newPatches = calculatePatches({filePath, originalContent, newFileContent})
      if (newPatches) {
        updatePatchesAndStatuses(newPatches)
      }
    },
  )

  const addFile = useStableCallback((filePath: string) => {
    const patch = {oldContents: '', oldFilePath: '', newContents: '', newFilePath: filePath}
    const newPatches = formatPatches([patch])
    updatePatchesAndStatuses(newPatches)
  })

  const renameFile = useStableCallback(
    ({
      oldFilePath,
      newFilePath,
      originalContent,
    }: {
      oldFilePath: string
      newFilePath: string
      originalContent: string | undefined
    }) => {
      if (oldFilePath === newFilePath) return

      const currentFileContent = getCurrentFileContent(oldFilePath, originalContent) ?? ''
      const currentFileStatus = fileStatuses[oldFilePath]

      if (isAdded(currentFileStatus)) {
        // if the renamed file only exists locally, just update the patch object
        const newPatches = {...patches}
        const patch = newPatches[oldFilePath]
        if (patch) {
          delete newPatches[oldFilePath]
          newPatches[newFilePath] = {...patch, newFileName: newFilePath}
          updatePatchesAndStatuses(newPatches)
        }
      } else {
        // renames are treated as a deletion of the previous file and an addition of a new file for files
        // that exist on the server
        const deletedPatch = {oldContents: '', oldFilePath, newContents: '', newFilePath: ''}
        const addedPatch = {oldContents: '', oldFilePath: '', newContents: currentFileContent, newFilePath}
        const newPatches = formatPatches([deletedPatch, addedPatch])
        updatePatchesAndStatuses(newPatches)
      }
    },
  )

  const markFilesCommitted = useStableCallback((files: Iterable<string>) => {
    const newPatches = {...patches}
    for (const file of files) {
      delete newPatches[file]
    }

    updatePatchesAndStatuses(newPatches)
  })

  const resetFiles = useStableCallback(() => {
    // We clear local storage directly to avoid leaving any any unneeded data behind
    // (i.e. if we called updatePatchesAndStatuses({}), we store that empty object
    // which is functionally the same but wastes space for the user)
    const storageKey = buildPatchesStorageKey(ownerLogin, name, pullRequest.number)
    const suggestionKey = buildSuggestionsStorageKey(ownerLogin, name, pullRequest.number)
    clearLocalStorage([storageKey, suggestionKey])
    setFileStatuses({})
  })

  return {
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
  }
}

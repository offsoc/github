import {type FilePagePayload, isBlobPayload, isTreePayload} from '@github-ui/code-view-types'
import type {PageError} from '@github-ui/react-core/app-routing-types'

export function makePermalinkPayload<T extends FilePagePayload>(payload: T): T {
  const newPayload = {
    ...payload,
    refInfo: {
      ...payload.refInfo,
      name: payload.refInfo.currentOid,
      refType: undefined, // We don't have a type for commits
      canEdit: false,
    },
  }

  if (isBlobPayload(payload)) {
    const {blob} = payload
    // If the ref is a SHA, we cannot edit nor delete.
    return {
      ...newPayload,
      blob: {...blob, headerInfo: {...blob.headerInfo, deleteInfo: {}, editInfo: {}}},
    }
  }

  return newPayload
}

/**
 * Get all the folders from the payload to display in the tree.
 * The current folder was not included in the fileTree, as a optimization to save bandwidth.
 * This function puts all together again.
 */
export function extractFileTree(payload: FilePagePayload) {
  return isTreePayload(payload)
    ? {
        ...payload.fileTree,
        [payload.path]: {items: payload.tree.items, totalCount: payload.tree.totalCount},
      }
    : payload.fileTree
}

/**
 * This function is used to create a new payload when an error occurs.
 * It does not contain page-specific information, such as the blob or tree,
 * but with frame data for rendering the error in CodeView
 */
export function makeErrorPayload(payload: FilePagePayload, error: PageError | null, path: string) {
  return {
    path,
    repo: payload.repo,
    refInfo: payload.refInfo,
    currentUser: payload.currentUser,
    fileTree: extractFileTree(payload),
    fileTreeProcessingTime: payload.fileTreeProcessingTime,
    foldersToFetch: payload.foldersToFetch,
    allShortcutsEnabled: payload.allShortcutsEnabled,
    treeExpanded: payload.treeExpanded,
    symbolsExpanded: payload.symbolsExpanded,
    codeLineWrapEnabled: payload.codeLineWrapEnabled,
    error: error || undefined,
  }
}

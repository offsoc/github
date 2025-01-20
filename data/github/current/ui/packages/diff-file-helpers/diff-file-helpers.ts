/**
 * All possible statuses for a file in a diff. Type 'string' is included to allow for future statuses to be added
 * without breaking the current typing.
 */
export type PatchStatus = 'ADDED' | 'CHANGED' | 'COPIED' | 'DELETED' | 'REMOVED' | 'MODIFIED' | 'RENAMED' | string

/**
 * Patch represents data about single file diff. This type mirrors the structure of a Patch in the GraphQL API.
 */
export interface Patch {
  /**
   * Git status of the patch and the change it represents.
   */
  status: PatchStatus
  /**
   * Data on the file before the change.
   */
  oldTreeEntry?: {mode: number} | null
  /**
   * Data on the file after the change.
   */
  newTreeEntry?: {mode: number; isGenerated?: boolean} | null
  /**
   * Number of lines changed in the file.
   */
  linesChanged?: number
  /**
   * Reason why the patch was truncated.
   */
  truncatedReason?: string | null
}

function hasChanges(patchData: Patch) {
  return patchData.linesChanged !== undefined && patchData.linesChanged !== 0
}

export function fileModeChangedOnly(status: PatchStatus, oldMode?: number, newMode?: number): boolean {
  return status === 'MODIFIED' && oldMode !== newMode
}

export function fileCopiedOnly(patchData: Patch): boolean {
  return patchData.status === 'COPIED' && !hasChanges(patchData)
}

export function fileRenamedOnly(patchData: Patch): boolean {
  return patchData.status === 'RENAMED' && !hasChanges(patchData)
}

export function fileWasDeleted(patchData: Patch): boolean {
  return !!patchData.oldTreeEntry && patchData.newTreeEntry === null
}

export function fileTruncated(patchData: Patch): boolean {
  return !!patchData.truncatedReason
}

const truncationReasonLiterals = ['maximum diff size exceeded.', 'maximum number of lines exceeded.']
const maxFilesRexExp = /^maximum file count exceeded/

export function truncatedReason(reason: string) {
  let output = reason
  if (truncationReasonLiterals.includes(reason)) {
    output =
      'Sorry, we could not display the changes to this file because there were too many other changes to display.'
  } else if (maxFilesRexExp.test(reason)) {
    output = 'Sorry, we could not display the changes to this file because there were too many other files to display.'
  }

  return output
}

export function fileWasGenerated(patch: Patch): boolean {
  return !!patch.newTreeEntry?.isGenerated
}

export function whitespaceChangedOnly(patchData: Patch): boolean {
  return patchData.linesChanged === 0
}

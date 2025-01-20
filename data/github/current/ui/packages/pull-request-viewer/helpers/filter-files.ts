import type {FilterState} from '../contexts/FilteredFilesContext'
import {getFileExtension} from './get-file-extension'

/**
 * Returns true if search term matches file's path
 */
function compareFilePathToTermExpression(file: FileData, searchTerm: string) {
  return !!file.oldPath?.toLowerCase().includes(searchTerm) || !!file.newPath?.toLowerCase().includes(searchTerm)
}

/**
 * Contract for comparing a diff file to a query
 */
export interface FileData {
  codeowners?: string[]
  isOwnedByViewer?: boolean | null
  newPath?: string | null
  oldPath?: string | null
  pathDigest?: string | null
  viewed?: boolean | null
}

export interface FilterData {
  files: FileData[]
  fileExtensions: string[]
}

const viewerCodeownerMacro = 'me'

/**
 * Returns true if the file should be shown.
 * It filters the list of diffs by
 * * viewed
 * * files codeowned by the user
 * * file extension
 * * query text
 */
export function filterFiles(filterState: FilterState, queryText: string, file: FileData): boolean {
  if (!filterState.showViewed) {
    if (file.viewed) {
      return false
    }
  }

  if (filterState.showOnlyFilesCodeownedByUser) {
    if (!file.isOwnedByViewer && !file.codeowners?.some(owner => owner === viewerCodeownerMacro)) {
      return false
    }
  }

  const fileExtension = getFileExtension(file)
  if (filterState.unselectedFileExtensions.has(fileExtension)) {
    return false
  }

  if (queryText) {
    return compareFilePathToTermExpression(file, queryText)
  }

  return true
}

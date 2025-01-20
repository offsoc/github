import type {SafeHTMLString} from '@github-ui/safe-html'

import type {ReposFileTreeData} from './tree-types'
import type {WebCommitInfo} from './edit-types'
import type {FilePagePayload} from './file-page-types'

export function isDeletePayload(payload: FilePagePayload): payload is DeletePagePayload {
  return 'deleteInfo' in payload && 'webCommitInfo' in payload
}

export interface DeletePagePayload extends FilePagePayload {
  deleteInfo: DeleteInfo
  fileTree: ReposFileTreeData
  webCommitInfo: WebCommitInfo
}

export interface DeleteInfo {
  diffs: DeletedDiff[]
  isBlob: boolean
  truncated: boolean
}

export interface DeletedDiff {
  deletions: number
  diffHTML?: SafeHTMLString
  loadDiffPath?: string
  path: string
}

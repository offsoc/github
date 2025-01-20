import type {BlobPayload} from './blob-types'
import type {FilePagePayload} from './code-view-types'

export type ReposFileTreeData = Record<string, {items: DirectoryItem[]; totalCount: number}>

export interface FileTreePagePayload extends FilePagePayload {
  tree: TreePayload
}

export function isTreePayload(payload: FilePagePayload): payload is FileTreePagePayload {
  return 'tree' in payload
}

export interface TreePayload {
  items: DirectoryItem[]

  /**
   * If the directory has a readme file, this is the blob payload containing a preview.
   */
  readme?: ReadmeBlobPayload
  totalCount: number
  /**
   * If provided, a banner suggestion to configure issue templates will be displayed,
   * and this URL will be used for the Learn more link.
   */
  templateDirectorySuggestionUrl?: string
  /**
   * Indicates whether branch info bar should be displayed. This is true if the current branch is not the default branch
   * or the repository is a fork. Details will be retrieved asynchronously.
   */
  showBranchInfobar: boolean
}

export interface DirectoryItem {
  name: string
  contentType: 'directory' | 'submodule' | 'symlink_directory' | 'symlink_file' | 'file'
  path: string
  hasSimplifiedPath?: boolean
  totalCount?: number
  submoduleUrl?: string
  submoduleDisplayName?: string
  isClientOnly?: boolean
}

export interface BranchInfoBar {
  refComparison?: RefComparison
  /**
   * Pull request number, if the current branch has a pull request.
   */
  pullRequestNumber?: number
}

export interface RefComparison {
  ahead: number
  behind: number
  baseBranch: string
  baseBranchRange: string
  currentRef: string
  isTrackingBranch: boolean
}

export interface ReadmeBlobPayload extends Pick<BlobPayload, 'displayName' | 'richText' | 'errorMessage' | 'timedOut'> {
  headerInfo: Pick<BlobPayload['headerInfo'], 'siteNavLoginPath' | 'toc'>
}

export type ExpandTreeFunction = (options?: {focus?: 'toggleButton' | 'search' | null; setCookie?: boolean}) => void
export type CollapseTreeFunction = (options?: {
  focus?: 'toggleButton' | null
  when?: 'medium'
  setCookie?: boolean
}) => void

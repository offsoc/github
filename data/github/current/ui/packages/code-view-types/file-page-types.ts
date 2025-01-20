import type {CopilotInfo} from '@github-ui/copilot-common-types'
import type {Repository} from '@github-ui/current-repository'
import type {PageError} from '@github-ui/react-core/app-routing-types'

import type {CurrentUser, RefInfo} from '@github-ui/repos-types'
import type {ReposFileTreeData} from './tree-types'

export interface FilePagePayload {
  allShortcutsEnabled: boolean
  path: string
  repo: Repository
  refInfo: RefInfo
  currentUser?: CurrentUser
  fileTree: ReposFileTreeData
  fileTreeProcessingTime: number
  foldersToFetch: string[]
  treeExpanded: boolean
  symbolsExpanded: boolean
  codeLineWrapEnabled: boolean
  copilotInfo?: CopilotInfo
  copilotAccessAllowed?: boolean
  error?: PageError
}

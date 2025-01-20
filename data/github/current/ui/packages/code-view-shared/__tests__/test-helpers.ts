import type {FilePagePayload, FileTreePagePayload} from '@github-ui/code-view-types'
import type {Repository} from '@github-ui/current-repository'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import type {RefInfo} from '@github-ui/repos-types'

const repo: Repository = createRepository()

export const basePayload: FilePagePayload = {
  path: 'test.txt',
  refInfo: {
    name: 'main',
    listCacheKey: 'key',
    canEdit: true,
    currentOid: 'abcd12345face398f34f3b7b7db142a0724fa958',
  } as RefInfo,
  repo,
  fileTree: {'': {items: [], totalCount: 0}},
  fileTreeProcessingTime: 1,
  foldersToFetch: [],
  allShortcutsEnabled: true,
  treeExpanded: true,
  symbolsExpanded: true,
  codeLineWrapEnabled: false,
  copilotAccessAllowed: true,
}

export const testTreePayload: FileTreePagePayload = {
  ...basePayload,
  path: 'src/app',
  tree: {
    totalCount: 0,
    items: [],
    showBranchInfobar: false,
  },
}

export const forkRepoPayload: FileTreePagePayload = {
  ...testTreePayload,
  repo: {...testTreePayload.repo, isFork: true},
}

export const cannotEditTreePayload = {
  ...testTreePayload,
  repo: {...basePayload.repo, currentUserCanPush: false},
  refInfo: {...basePayload.refInfo, canEdit: false},
}

export const oneItemPayload: FileTreePagePayload = {
  ...testTreePayload,
  tree: {
    totalCount: 1,
    items: [
      {
        name: 'folderA',
        contentType: 'directory',
        hasSimplifiedPath: false,
        path: 'folderA',
      },
    ],
    showBranchInfobar: false,
  },
}

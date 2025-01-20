import type {DirectoryItem} from '@github-ui/code-view-types'
import {getRepositoryMock} from '@github-ui/copilot-chat/test-utils/mock-data'
import type {Repository} from '@github-ui/current-repository'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import type {RefInfo} from '@github-ui/repos-types'
import type {SafeHTMLString} from '@github-ui/safe-html'

import type {
  CodeEditorPayload,
  CopilotTaskBasePayload,
  FocusedGenerativeTaskData,
  OverviewPayload,
} from '../utilities/copilot-task-types'

export function getCopilotTaskRoutePayload(): CopilotTaskBasePayload {
  const repo: Repository = createRepository()
  const readme: DirectoryItem = {
    name: 'readme',
    contentType: 'file',
    hasSimplifiedPath: false,
    path: 'readme',
  }

  return {
    currentUser: {
      id: 1,
      login: 'monalisa',
      userEmail: 'monalisa@github.com',
    },
    fileTree: {'': {items: [readme], totalCount: 1}},
    diffPaths: {'': {items: [readme], totalCount: 1}},
    fileTreeProcessingTime: 1,
    foldersToFetch: [],
    path: '',
    refInfo: {
      name: 'main',
      listCacheKey: 'key',
      canEdit: true,
      currentOid: 'abcd12345face398f34f3b7b7db142a0724fa958',
    } as RefInfo,
    repo,
    copilotAccessAllowed: true,
    pullRequest: {
      number: '1',
      title: 'PR title',
      headBranch: 'feature-branch',
      headSHA: 'abcd12345face398f34f3b7b7db142a0724fa958',
      baseBranch: 'main',
    },
    findFileWorkerPath: 'mock',
    webCommitInfo: {
      authorEmails: [],
      canCommitStatus: 'blocked',
      commitOid: '',
      dcoSignoffEnabled: false,
      defaultEmail: '',
      defaultNewBranchName: '',
      lockedOnMigration: false,
      pr: '',
      repoHeadEmpty: false,
      saveUrl: '',
      shouldFork: false,
      shouldUpdate: false,
      suggestionsUrlIssue: '/issue',
      suggestionsUrlEmoji: '/emoji',
      suggestionsUrlMention: '/mention',
    },
    helpUrl: '/help',
    copilot: {
      ssoOrganizations: [],
      agentsPath: '/agents',
      apiURL: '/api',
      currentUserLogin: 'monalisa',
      currentTopic: getRepositoryMock(),
      optedInToUserFeedback: true,
      reviewLab: false,
    },
  }
}

export function getCopilotTaskOverviewPayload(): OverviewPayload {
  return {
    ...getCopilotTaskRoutePayload(),
    pullRequest: {
      number: '1',
      title: 'PR title',
      baseBranch: 'main-branch',
      headBranch: 'feature-branch',
      headSHA: 'abcd12345face398f34f3b7b7db142a0724fa958',
      bodyHtml: 'PR body',
      titleHtml: 'PR title',
      labels: [{color: '000000', name: 'my label'}],
    },
  }
}

export function getCopilotTaskCodeEditorPayload(): CodeEditorPayload {
  const basePayload = getCopilotTaskRoutePayload()
  return {
    ...basePayload,
    blobContents: '',
    path: 'readme',
  }
}

export function getGenerativeTaskData(): FocusedGenerativeTaskData {
  return {
    comments: [
      {
        author: {
          avatarUrl: '',
          login: 'monalisa',
        },
        body: 'comment 1 body',
        createdAt: '2022-02-02T00:00:00Z',
        id: 1,
      },
      {
        author: {
          avatarUrl: '',
          login: 'contributor',
        },
        body: 'comment 2 body',
        createdAt: '2022-02-02T00:00:00Z',
        id: 2,
      },
      {
        author: {
          avatarUrl: '',
          login: 'rando',
        },
        body: 'comment 3 body',
        createdAt: '2022-02-02T00:00:00Z',
        id: 3,
      },
    ],
    html: '' as SafeHTMLString,
    sourceId: 1,
    sourceType: 'pull_request_review_comment',
    suggestions: [],
    type: 'generative',
  }
}

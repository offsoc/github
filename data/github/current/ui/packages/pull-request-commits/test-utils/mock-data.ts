import {createRepository} from '@github-ui/current-repository/test-helpers'
import {generateCommitGroups} from '@github-ui/commits/test-helpers'
import {signChannel} from '@github-ui/use-alive/test-utils'
import type {CommitsRoutePayload} from '../routes/Commits'
import type {HeaderPageData} from '../page-data/payloads/header'
import type {SafeHTMLString} from '@github-ui/safe-html'

const mockBanners = {
  banners: {
    pausedDependabotUpdate: {render: false},
    hiddenCharacterWarning: {render: false},
  },
}

export function getHeaderPageData(): HeaderPageData {
  return {
    bannersData: mockBanners,
    pullRequest: {
      author: 'monalisa',
      baseBranch: 'main',
      commitsCount: 1,
      headBranch: 'feature-branch',
      headRepositoryOwnerLogin: 'monalisa',
      headRepositoryName: 'smile',
      isInAdvisoryRepo: false,
      number: 12345,
      state: 'open',
      title: 'This is my PR title :)',
      titleHtml: 'This is my PR title :)' as SafeHTMLString,
      url: '/monalisa/smile/pull/1',
    },
    repository: {
      ...createRepository(),
      codespacesEnabled: true,
      copilotEnabled: false,
      editorEnabled: false,
      isEnterprise: false,
    },
    urls: {
      conversation: '/monalisa/smile/pull/1',
      commits: '/monalisa/smile/pull/1/commits',
      checks: '/monalisa/smile/pull/1/checks',
      files: '/monalisa/smile/pull/1/files',
    },
    user: {
      canChangeBase: true,
      canEditTitle: true,
    },
  }
}

export function getCommitsPageData() {
  return {
    commitGroups: generateCommitGroups(1, 1),
    metadata: {
      deferredCommitsDataUrl: '/monalisa/smile/pull/1/deferred_commits_data',
      aliveChannel: signChannel('commits-alive-channel'),
    },
    repository: createRepository(),
    timeOutMessage: '',
    truncated: false,
  }
}

export function getCodeButtonPageData() {
  return {
    contactPath: '/contact',
    currentUserIsEnterpriseManaged: false,
    enterpriseManagedBusinessName: '',
    hasAccessToCodespaces: true,
    isLoggedIn: true,
    newCodespacePath: '/new-codespace',
    repoPolicyInfo: {
      allowed: true,
      canBill: true,
      changesWouldBeSafe: true,
      disabledByBusiness: false,
      disabledByOrganization: false,
      hasIpAllowLists: false,
    },
  }
}

export function getCommitsRoutePayload(): CommitsRoutePayload {
  return {...getCommitsPageData(), ...getHeaderPageData()}
}

export function getAppPayload() {
  return {
    helpUrl: 'https://help.github.com',
    refListCacheKey: 'v0:123',
  }
}

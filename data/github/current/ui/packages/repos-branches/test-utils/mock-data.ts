import type {CreateBranchButtonProps} from '@github-ui/create-branch-button'
import type {OverviewPayload} from '../routes/Overview'
import type {Repository} from '@github-ui/current-repository'
import type {ListPayload} from '../routes/List'
import type {Author, Branch, BranchMetadata, PullRequest, RenameBranchEffects} from '../types'
import {createRepository} from '@github-ui/current-repository/test-helpers'

export function getRepository(): Repository {
  return createRepository({
    id: 1,
    defaultBranch: 'main',
    ownerLogin: 'monalisa',
    name: 'smile',
    ownerAvatar: '',
    private: true,
    public: false,
    isEmpty: false,
    isFork: false,
    isOrgOwned: false,
    createdAt: new Date().toLocaleString(),
    currentUserCanPush: true,
  })
}

export function getUser(): Author {
  return {
    login: 'monalisa',
    name: 'Mona Lisa',
    path: '/monalisa',
    avatarUrl: `https://avatars.githubusercontent.com/mona`,
  }
}

export function getBranches(): Branch[] {
  return [
    {
      name: 'collaborator/feature-b',
      isDefault: false,
      mergeQueueEnabled: false,
      path: '/monalisa/smile/tree/collaborator/feature-b',
      authoredDate: new Date().toLocaleString(),
      author: getUser(),
      rulesetsPath: '/monalisa/smile/rules/1',
      deleteable: true,
    },
    {
      name: 'monalisa/feature-a',
      isDefault: false,
      mergeQueueEnabled: false,
      path: '/monalisa/smile/tree/monalisa/feature-a',
      authoredDate: new Date().toLocaleString(),
      author: getUser(),
      rulesetsPath: '/monalisa/smile/rules/1',
    },
    {
      name: 'collaborator/feature-b/name-that-should-get-truncated-but-then-even-more-longer',
      isDefault: false,
      mergeQueueEnabled: false,
      path: '/monalisa/smile/tree/collaborator/feature-b/name-that-should-get-truncated-but-then-even-more-longer',
      authoredDate: new Date().toLocaleString(),
      author: getUser(),
      rulesetsPath: '/monalisa/smile/rules/1',
    },
  ]
}

export function getOverviewRoutePayload(): OverviewPayload {
  return {
    branches: {
      default: {
        name: 'main',
        isDefault: true,
        mergeQueueEnabled: true,
        path: '/monalisa/smile',
        authoredDate: new Date().toLocaleString(),
      },
      yours: [getBranches()[1]!],
      active: getBranches(),
    },
    hasMore: {
      yours: false,
      active: false,
    },
    protectThisBranchBanner: {
      dismissed: false,
      isSecurityAdvisory: false,
    },
  }
}

export function getListRoutePayload(): ListPayload {
  return {
    current_page: 1,
    per_page: 20,
    has_more: false,
    branches: getBranches(),
  }
}

export function getCreateBranchButtonOptions({repository}: {repository: Repository}): CreateBranchButtonProps {
  return {
    repository,
    repositoryParent: undefined,
    branchListCacheKey: `branches_${new Date().toLocaleString()}`,
    createUrl: '/monalisa/smile/branches/create',
    helpUrl: 'https://docs.github.com',
  }
}

export function getPullRequest(): PullRequest {
  return {
    title: 'Update README.md',
    number: 12345,
    permalink: '/monalisa/smile/pull/12345',
    state: 'open',
    reviewableState: 'draft',
    merged: false,
    isPullRequest: true,
  }
}

export function getDeferredMetadata(): Map<string, BranchMetadata> {
  const map = new Map()
  const branches = getBranches()

  for (const branch of branches) {
    map.set(branch.name, {
      oid: 'fb615b19155df485b8b4baa4ed0df303fff2dca6',
      aheadBehind: [1, 1],
      statusCheckRollup: {
        state: 'pending',
        shortText: '1/2 checks OK',
      },
      pullRequest: getPullRequest(),
      mergeQueue: undefined,
    })
  }

  return map
}

export function getRenameEffects(): RenameBranchEffects {
  return {
    prRetargetCount: 1,
    prRetargetRepoCount: 0,
    prClosureCount: 1,
    draftReleaseCount: 1,
    protectedBranchCount: 1,
    willPagesChange: true,
  }
}

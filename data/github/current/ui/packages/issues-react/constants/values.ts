import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {
  GitMergeIcon,
  GitMergeQueueIcon,
  GitPullRequestClosedIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from '@primer/octicons-react'

import type {SearchShortcutType} from '../components/sidebar/__generated__/SavedViewsQuery.graphql'
import type {AppPayload} from '../types/app-payload'

enum IS_FILTER_PROVIDER_VALUES_ENUM {
  closed = 'closed',
  draft = 'draft',
  issue = 'issue',
  locked = 'locked',
  merged = 'merged',
  open = 'open',
  pr = 'pr',
  unlocked = 'unlocked',
}

enum STATE_FILTER_PROVIDER_VALUES_ENUM {
  open = 'open',
  closed = 'closed',
  draft = 'draft',
  merged = 'merged',
}

export const IS_FILTER_PROVIDER_VALUES: Array<keyof typeof IS_FILTER_PROVIDER_VALUES_ENUM> =
  Object.values(IS_FILTER_PROVIDER_VALUES_ENUM)

export const STATE_FILTER_PROVIDER_VALUES: Array<keyof typeof STATE_FILTER_PROVIDER_VALUES_ENUM> = Object.values(
  STATE_FILTER_PROVIDER_VALUES_ENUM,
)

export const VALUES = {
  repositoriesPreloadCount: 5,
  issuesPageSizeDefault: 25,
  issuesPageSizeMax: 100,
  issuesPageSize: () => {
    const urlSearchParams = new URLSearchParams(ssrSafeLocation.search)

    const pageSize = urlSearchParams.get('pageSize')
    return Math.min(pageSize ? parseInt(pageSize) : 25, VALUES.issuesPageSizeMax)
  },
  pullRequestsMaxPageSize: 50,
  labelPageSize: 20,
  assigneePageSize: 20,
  viewsPageSize: 25,
  viewLoadingSize: 6,
  teamsMaxPreloadCount: 100,
  teamsPageSize: 25,
  searchUrlParameterName: 'q',
  selectedTeamsPageSize: 25,
  selectedTeamsLoadingSize: 8,
  teamViewPageSize: 25,
  maxBulkUpdateIssues: 1000,
  // Limitation enforced by Elasticsearch
  maxIssuesListItems: 1000,
  localStorageKeyBulkUpdateIssues: 'repo.bulkUpdateIssues',
  storageKeyPrefix: (appPayload: AppPayload) => appPayload.scoped_repository?.id || 'hyperlist',
  defaultViewIcon: 'BOOKMARK',
  defaultViewColor: 'GRAY',
  defaultQueryForNewView: '',
  viewTypes: ['ISSUES', 'PULL_REQUESTS'] as SearchShortcutType[],
  issueIcons: {
    OPEN: {
      color: 'open.fg',
      icon: IssueOpenedIcon,
      description: 'Open issue',
    },
    CLOSED: {
      color: 'done.fg',
      icon: IssueClosedIcon,
      description: 'Closed issue (completed)',
    },
    NOT_PLANNED: {
      color: 'fg.muted',
      icon: SkipIcon,
      description: 'Closed issue (not planned)',
    },
  },
  serviceOwners: {
    notification: 'github/notifications',
    pullRequests: 'github/pull_requests',
    hyperlist: 'github/hyperlist_web',
  },
  pullRequestIcons: {
    MERGED: {
      color: 'done.fg',
      icon: GitMergeIcon,
    },
    IN_MERGE_QUEUE: {
      color: 'attention.fg',
      icon: GitMergeQueueIcon,
    },
    OPEN: {
      color: 'open.fg',
      icon: GitPullRequestIcon,
    },
    CLOSED: {
      color: 'closed.fg',
      icon: GitPullRequestClosedIcon,
    },
    DRAFT: {
      color: 'fg.muted',
      icon: GitPullRequestDraftIcon,
    },
  },
}

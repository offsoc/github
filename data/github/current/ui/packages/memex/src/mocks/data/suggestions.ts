import {IssueState, IssueStateReason, PullRequestState} from '../../client/api/common-contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import type {RepositoryItem, SuggestedRepository} from '../../client/api/repository/contracts'
import {mockRepos} from './repositories'

export const DefaultSuggestedRepositories = new Array<SuggestedRepository>(...mockRepos)

export const DefaultSuggestedRepositoryItems = new Array<RepositoryItem>(
  {
    id: 1000,
    number: 1000,
    state: IssueState.Closed,
    title: 'A closed issue that can be added',
    type: ItemType.Issue,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 1001,
    number: 1001,
    state: IssueState.Open,
    title: 'I am an integration test fixture',
    type: ItemType.Issue,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 1002,
    number: 1002,
    state: PullRequestState.Open,
    title: 'Here is an open Pull Request that you could add',
    type: ItemType.PullRequest,
    isDraft: false,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 1003,
    number: 1003,
    state: PullRequestState.Open,
    title: 'Draft PRs will look good here as well',
    type: ItemType.PullRequest,
    isDraft: true,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 1004,
    number: 1004,
    state: PullRequestState.Merged,
    title: "Add me to a memex, even though I've already been merged",
    type: ItemType.PullRequest,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 1005,
    number: 1005,
    state: PullRequestState.Closed,
    title: 'Would someone still want a closed PR here?',
    type: ItemType.PullRequest,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 1006,
    number: 1006,
    state: IssueState.Closed,
    stateReason: IssueStateReason.NotPlanned,
    title: 'A closed as not planned issue that can be added',
    type: ItemType.Issue,
    lastInteractionAt: new Date(),
    updatedAt: new Date(),
  },
)

export const SuggestedRepositoryItemsForMemex = DefaultSuggestedRepositoryItems.slice(
  0,
  DefaultSuggestedRepositoryItems.length - 1,
)

// to create a repo with more than 25 items
const createManyItems = () => {
  const manyItems = []
  for (let i = 0; i < 4; i++) {
    manyItems.push(...DefaultSuggestedRepositoryItems)
  }
  return manyItems
}

export const SuggestedRepoItemsForManyBulkAdd = createManyItems()

type SuggestedReferenceType =
  | 'discussion'
  | 'issue_open'
  | 'issue_closed'
  | 'pull_request'
  | 'pull_request_closed'
  | 'pull_request_draft'
  | 'skip'

export type SuggestedIssueIconsMap = {[key in SuggestedReferenceType]: string}

export interface MarkdownSuggestedReference {
  id: number
  number: number
  /** Item title as HTML (can include, for example, emoji and `<code>` tags). */
  title: string
  type: SuggestedReferenceType
}

export const DefaultMarkdownReferenceSuggestions: Array<MarkdownSuggestedReference> = [
  {
    id: 1192110767,
    number: 9254,
    title:
      '[<g-emoji class="g-emoji" alias="earth_americas" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f30e.png">🌎</g-emoji> Intent to Ship] Explorable Archive',
    type: 'issue_open',
  },
  {
    id: 1193209857,
    number: 9278,
    title: 'QA Checklist for Release: v0.11.0',
    type: 'issue_open',
  },
  {
    id: 1193170724,
    number: 9276,
    title: 'Set up workflows for playwright tests on <code>main</code> vs PRs',
    type: 'pull_request_draft',
  },
  {
    id: 1157394902,
    number: 8418,
    title: '[experiment] use <code>MemexColumn</code> everywhere, but have more granular field types',
    type: 'pull_request_closed',
  },
  {
    id: 1161646704,
    number: 8558,
    title: 'Tag <code>failbotg.apps.needles</code> Datadog metrics for Memex related exceptions with deployment ring',
    type: 'issue_open',
  },
  {
    id: 1158912365,
    number: 8491,
    title: 'Add command_palette_on_memex feature flag support',
    type: 'discussion',
  },
  {
    id: 1159670788,
    number: 8503,
    title: 'Bump css-loader from 6.6.0 to 6.7.0',
    type: 'pull_request',
  },
  {
    id: 1159711810,
    number: 11,
    title: 'remove unused <code>css-loader</code> and <code>style-loader</code> packages',
    type: 'pull_request',
  },
  {
    id: 1160394699,
    number: 8546,
    title: 'Staging/Test - Serve only local assets',
    type: 'pull_request',
  },
  {
    id: 1157422889,
    number: 8419,
    title: 'Create Datadog Event to Overlay onto Dashboard whenever a new version is deployed, promoted, or demoted',
    type: 'issue_open',
  },
  {
    id: 1036318262,
    number: 5812,
    title:
      '<g-emoji class="g-emoji" alias="bug" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f41b.png">🐛</g-emoji> User is able to convert to issue with archived repository, but <g-emoji class="g-emoji" alias="boom" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4a5.png">💥</g-emoji> occurs',
    type: 'issue_open',
  },
  {
    id: 1122432132,
    number: 7727,
    title:
      'Determine whether or not we can reconsider 2FA requirement for <code>promote</code>/<code>demote</code> chatops',
    type: 'skip',
  },
  {
    id: 1139130012,
    number: 8086,
    title:
      '<g-emoji class="g-emoji" alias="pick" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/26cf.png">⛏️</g-emoji> [SPIKE] iFrame Issue View',
    type: 'issue_closed',
  },
  {
    id: 974645744,
    number: 4489,
    title: 'Control ReactDOM rendering for Memex from Dotcom (passing json island data as props)',
    type: 'issue_open',
  },
  {
    id: 1158658931,
    number: 8472,
    title: '[Experiment] Refactoring tests for <code>updateColumnValueAndPriority</code> hook usage',
    type: 'pull_request',
  },
]

export const MarkdownSuggestionIcons: SuggestedIssueIconsMap = {
  pull_request:
    '<svg class="octicon octicon-git-pull-request" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"></path></svg>',
  pull_request_closed:
    '<svg class="octicon octicon-git-pull-request-closed" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M10.72 1.227a.75.75 0 011.06 0l.97.97.97-.97a.75.75 0 111.06 1.061l-.97.97.97.97a.75.75 0 01-1.06 1.06l-.97-.97-.97.97a.75.75 0 11-1.06-1.06l.97-.97-.97-.97a.75.75 0 010-1.06zM12.75 6.5a.75.75 0 00-.75.75v3.378a2.251 2.251 0 101.5 0V7.25a.75.75 0 00-.75-.75zm0 5.5a.75.75 0 100 1.5.75.75 0 000-1.5zM2.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.25 1a2.25 2.25 0 00-.75 4.372v5.256a2.251 2.251 0 101.5 0V5.372A2.25 2.25 0 003.25 1zm0 11a.75.75 0 100 1.5.75.75 0 000-1.5z"></path></svg>',
  pull_request_draft:
    '<svg class="octicon octicon-git-pull-request-draft" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M2.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.25 1a2.25 2.25 0 00-.75 4.372v5.256a2.251 2.251 0 101.5 0V5.372A2.25 2.25 0 003.25 1zm0 11a.75.75 0 100 1.5.75.75 0 000-1.5zm9.5 3a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0-3a.75.75 0 100 1.5.75.75 0 000-1.5z"></path><path d="M14 7.5a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zm0-4.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"></path></svg>',
  issue_open:
    '<svg class="octicon octicon-issue-opened open" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path><path fill-rule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"></path></svg>',
  issue_closed:
    '<svg class="octicon octicon-issue-closed closed" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M11.28 6.78a.75.75 0 00-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3.5-3.5z"></path><path fill-rule="evenodd" d="M16 8A8 8 0 110 8a8 8 0 0116 0zm-1.5 0a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"></path></svg>',
  skip: '<svg class="octicon octicon-skip color-fg-muted" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm3.28 5.78a.75.75 0 00-1.06-1.06l-5.5 5.5a.75.75 0 101.06 1.06l5.5-5.5z"></path></svg>',
  discussion:
    '<svg class="octicon octicon-comment-discussion" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 2.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-3.5a.75.75 0 00-.53.22L3.5 11.44V9.25a.75.75 0 00-.75-.75h-1a.25.25 0 01-.25-.25v-5.5zM1.75 1A1.75 1.75 0 000 2.75v5.5C0 9.216.784 10 1.75 10H2v1.543a1.457 1.457 0 002.487 1.03L7.061 10h3.189A1.75 1.75 0 0012 8.25v-5.5A1.75 1.75 0 0010.25 1h-8.5zM14.5 4.75a.25.25 0 00-.25-.25h-.5a.75.75 0 110-1.5h.5c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0114.25 12H14v1.543a1.457 1.457 0 01-2.487 1.03L9.22 12.28a.75.75 0 111.06-1.06l2.22 2.22v-2.19a.75.75 0 01.75-.75h1a.25.25 0 00.25-.25v-5.5z"></path></svg>',
}

export type MarkdownSuggestedMention = MarkdownSuggestedTeam | MarkdownSuggestedUser

export interface MarkdownSuggestedTeam {
  type: 'team'
  id: number
  name: string
  description: string
  participant?: boolean
}

export interface MarkdownSuggestedUser {
  type: 'user'
  id: number
  login: string
  name: string
  participant?: boolean
}

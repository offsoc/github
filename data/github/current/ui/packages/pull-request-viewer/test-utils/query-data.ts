import {
  type Author,
  type Comment,
  type DiffAnnotation,
  DiffAnnotationLevels,
  type DiffAnnotationLocation,
  type Thread,
  type ThreadSubject,
} from '@github-ui/conversations'
import type {DiffLine} from '@github-ui/diff-lines'
import type {AssigneePickerAssignee$data} from '@github-ui/item-picker/AssigneePicker.graphql'
import type {LabelPickerLabel$data} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {signChannel} from '@github-ui/use-alive/test-utils'

import type {FilesChangedRow_pullRequestSummaryDelta$data} from '../components/__generated__/FilesChangedRow_pullRequestSummaryDelta.graphql'
import type {PullRequestSummaryViewerContentQuery$data} from '../components/__generated__/PullRequestSummaryViewerContentQuery.graphql'
import type {ActivityView_pullRequest_backwardPagination$data} from '../components/activity/__generated__/ActivityView_pullRequest_backwardPagination.graphql'
import type {ActivityView_pullRequest_forwardPagination$data} from '../components/activity/__generated__/ActivityView_pullRequest_forwardPagination.graphql'
import type {PullRequestReview_pullRequestReview$data} from '../components/activity/timeline-items/__generated__/PullRequestReview_pullRequestReview.graphql'
import type {PullRequestReviewHeaderAndComment_pullRequestReview$data} from '../components/activity/timeline-items/pull-request-review/__generated__/PullRequestReviewHeaderAndComment_pullRequestReview.graphql'
import type {ReviewComment_pullRequestReviewComment$data} from '../components/activity/timeline-items/pull-request-review/__generated__/ReviewComment_pullRequestReviewComment.graphql'
import type {Thread_pullRequestThread$data} from '../components/activity/timeline-items/pull-request-review/__generated__/Thread_pullRequestThread.graphql'
import type {ActionSection_pullRequest$data} from '../components/details-pane/__generated__/ActionSection_pullRequest.graphql'
import type {DetailsPane_pullRequest$data} from '../components/details-pane/__generated__/DetailsPane_pullRequest.graphql'
import type {FileViewedState} from '../components/diffs/__generated__/Diff_diffEntry.graphql'
import type {DiffLines_diffEntry$data} from '../components/diffs/__generated__/DiffLines_diffEntry.graphql'
import type {FilesChangedHeading_pullRequest$data} from '../components/diffs/__generated__/FilesChangedHeading_pullRequest.graphql'
import type {BlobActionsMenu_pullRequest$data} from '../components/diffs/diff-file-header-list-view/__generated__/BlobActionsMenu_pullRequest.graphql'
import type {CodeownersBadge_pathOwnership$data} from '../components/diffs/diff-file-header-list-view/__generated__/CodeownersBadge_pathOwnership.graphql'
import type {
  DiffFileHeaderListView_diffEntry$data,
  PatchStatus,
} from '../components/diffs/diff-file-header-list-view/__generated__/DiffFileHeaderListView_diffEntry.graphql'
import type {HeaderMetadata_pullRequest$data} from '../components/header/__generated__/HeaderMetadata_pullRequest.graphql'
import type {
  PullRequestState,
  RepositoryPermission,
  ReviewMenu_pullRequest$data,
} from '../components/header/__generated__/ReviewMenu_pullRequest.graphql'
import type {CodeownersToBeAssigned_pullRequest$data} from '../components/reviewers/__generated__/CodeownersToBeAssigned_pullRequest.graphql'
import type {PullRequestReviewState} from '../components/reviewers/__generated__/ReviewDetails_pullRequest.graphql'
import type {Reviewers_pullRequest$data} from '../components/reviewers/__generated__/Reviewers_pullRequest.graphql'
import type {ReviewersPickerCandidateReviewers_pullRequest$data} from '../components/reviewers/__generated__/ReviewersPickerCandidateReviewers_pullRequest.graphql'
import type {ReviewersPickerSuggestedReviewers_pullRequest$data} from '../components/reviewers/__generated__/ReviewersPickerSuggestedReviewers_pullRequest.graphql'

const userAvatarUrl = 'http://alambic.github.localhost/avatars/u/2'
const teamAvatarUrl = 'http://alambic.github.localhost/avatars/t/1'

export function mockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function wrapListAsEdges<T>(list: T[], connectionId = mockUUID(), totalCommentsCount?: number) {
  const wrappedItems = list.map(item => ({node: item}))
  return {__id: connectionId, edges: wrappedItems, totalCount: wrappedItems.length, totalCommentsCount}
}

const DefaultDiffAnnotationData = {
  FAILURE: {
    annotationLevel: DiffAnnotationLevels.Failure,
    message:
      'Minitest::Assertion:\n\n        The following CSS classes were used in class attributes but have no style rules referencing them:\n\n        Class name                     Seen in\n        ======================================\n        text-mono                      app/views/checks/_checks_summary.html.erb\n        /github/file.rb:84\n',
    title: 'QueryContext test succeeds',
  },
  NOTICE: {
    annotationLevel: DiffAnnotationLevels.Notice,
    message: 'An interesting thing about this is X.',
    title: 'RenderContext test renders correct object',
  },
  WARNING: {
    annotationLevel: DiffAnnotationLevels.Warning,
    message: 'This might be problematic in the future because X.',
    title: 'MemberContext test does not include member',
  },
}

export function buildDiffAnnotation({
  annotationLevel,
  path,
  location,
  message,
  title,
  checkRun,
  checkSuite,
}: {
  annotationLevel?: DiffAnnotationLevels
  path?: string
  location?: DiffAnnotationLocation
  message?: string
  title?: string
  checkRun?: {
    name: string
    detailsUrl: string
  }
  checkSuite?: {
    name: string
    app: {
      name: string
      logoUrl: string
    }
  }
}): DiffAnnotation {
  const diffAnnotationLevels = [DiffAnnotationLevels.Failure, DiffAnnotationLevels.Notice, DiffAnnotationLevels.Warning]
  const randomIndex = Math.floor(Math.random() * diffAnnotationLevels.length)
  const diffAnnotationLevel = annotationLevel ?? diffAnnotationLevels[randomIndex]!
  const defaultDiffAnnotationData = DefaultDiffAnnotationData[diffAnnotationLevel]
  const id = mockUUID()
  return {
    id,
    __id: id,
    annotationLevel: annotationLevel ?? defaultDiffAnnotationData['annotationLevel'],
    databaseId: Math.floor(Math.random() * 1000),
    checkRun: checkRun ?? {
      name: 'enterprise-lint-schema',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: checkSuite ?? {
      name: 'github-lint',
      app: {
        name: 'octobot',
        logoUrl: 'http://alambic.github.localhost/avatars/u/3',
      },
    },
    location: {
      start: {
        line: location?.start?.line ?? 0,
      },
      end: {
        line: location?.end?.line ?? 0,
      },
    },
    message: message ?? defaultDiffAnnotationData['message'],
    path: path ?? 'README.md',
    pathDigest: mockUUID(),
    rawDetails: null,
    title: title ?? defaultDiffAnnotationData['title'],
  }
}

type PullRequestThreads = NonNullable<NonNullable<DiffLines_diffEntry$data['diffLines']>[number]>['threads']
export type PullRequestThread = NonNullable<NonNullable<NonNullable<PullRequestThreads>['edges']>[number]>['node']

type TestDiffLine = DiffLine & {
  threads: {
    totalCount: number
    edges: ReadonlyArray<{node: PullRequestThread}> | null
  }
}

type DiffEntry = WithoutFragments<DiffFileHeaderListView_diffEntry$data> & {
  diffLines: TestDiffLine[]
  viewerViewedState: FileViewedState
} & WithoutFragments<CodeownersBadge_pathOwnership$data>

type ReviewRequest = {
  asCodeOwner: boolean
  assignedFromReviewRequest: {
    asCodeOwner: boolean
    requestedReviewer: {
      __typename: 'Team'
      name: string
    } | null
  } | null
  requestedReviewer: RequestedReviewer
}

type RequestedReviewer =
  | {
      asCodeOwner: boolean
      avatarUrl: string
      login: string
      url: string
      id: string
      __typename: 'User'
    }
  | {
      teamAvatarUrl: string
      combinedSlug: string
      name: string
      url: string
      id: string
      asCodeOwner: boolean
      assignedFromReviewRequest: {
        name?: string
        __typename?: string
        asCodeOwner: boolean
      }
      organization: {
        name: string
      }
      __typename: 'Team'
    }

type OnBehalfOfReviewer = {
  reviewer:
    | {
        __typename: 'Team'
        combinedSlug: string
      }
    | {
        __typename: 'User'
        login: string
      }
  asCodeowner: boolean
}

type CommentAuthor = {
  avatarUrl: string
  login: string
}

type TimelineThread = WithoutFragments<Omit<Thread_pullRequestThread$data, 'comments' | 'subject'>> & {
  subject: ThreadSubject | null
  comments: {
    totalCount: number
    nodes?: Array<{author: CommentAuthor | null}>
  }
}

type WithoutFragments<T> = Omit<T, ' $fragmentSpreads' | ' $fragmentType'>
type TimelineComment = WithoutFragments<ReviewComment_pullRequestReviewComment$data>
type TimelineThreadOrComment = TimelineThread | TimelineComment
type Review = WithoutFragments<Omit<PullRequestReview_pullRequestReview$data, 'pullRequestThreadsAndReplies'>> &
  WithoutFragments<
    Omit<PullRequestReviewHeaderAndComment_pullRequestReview$data, 'pullRequestThreadsAndReplies' | 'author'>
  > & {
    author: {
      avatarUrl: string
      login: string
      url: string
    }
    id: string
    state: PullRequestReviewState
    onBehalfOfReviewers: OnBehalfOfReviewer[]
    pullRequestThreadsAndReplies: {edges: Array<{node: TimelineThreadOrComment}>}
  }

type Assignee = WithoutFragments<AssigneePickerAssignee$data>
type CandidateReviewers = NonNullable<ReviewersPickerCandidateReviewers_pullRequest$data['candidateReviewers']>
type CandidateReviewer = NonNullable<NonNullable<CandidateReviewers['edges']>[number]>['node']
type SuggestedReviewers = ReviewersPickerSuggestedReviewers_pullRequest$data['suggestedReviewers']
type SuggestedReviewer = NonNullable<SuggestedReviewers[number]>
type Label = WithoutFragments<LabelPickerLabel$data>

type ConnectionFragment<T, keyname extends string> = {
  [key in keyname]: {
    edges: ReadonlyArray<{node: T}> | null
    totalCount: number
  }
}

type PullRequestSummaryDelta = NonNullable<WithoutFragments<FilesChangedRow_pullRequestSummaryDelta$data>>

type Codeowner = NonNullable<CodeownersToBeAssigned_pullRequest$data['codeowners']>[number]
type PullRequestData = NonNullable<PullRequestSummaryViewerContentQuery$data['repository']>['pullRequest']
type PullRequestResponse = ConnectionFragment<Label, 'labels'> &
  WithoutFragments<Omit<PullRequestData, 'diff'>> &
  WithoutFragments<Omit<HeaderMetadata_pullRequest$data, 'pullRequestId'>> &
  WithoutFragments<FilesChangedHeading_pullRequest$data> &
  WithoutFragments<ReviewMenu_pullRequest$data> &
  WithoutFragments<BlobActionsMenu_pullRequest$data> &
  WithoutFragments<DetailsPane_pullRequest$data> &
  WithoutFragments<Reviewers_pullRequest$data> &
  WithoutFragments<ReviewersPickerSuggestedReviewers_pullRequest$data> &
  WithoutFragments<ReviewersPickerCandidateReviewers_pullRequest$data> &
  WithoutFragments<CodeownersToBeAssigned_pullRequest$data> &
  WithoutFragments<ActivityView_pullRequest_backwardPagination$data> &
  WithoutFragments<ActivityView_pullRequest_forwardPagination$data> &
  WithoutFragments<ActionSection_pullRequest$data> & {
    allThreads: {
      edges: ReadonlyArray<{node: PullRequestThread}>
      totalCommentsCount: number
    }
    assignees: {
      nodes: Assignee[]
    }
    author: {
      id?: string
      avatarUrl?: string
      login: string
      // required by IssueBodyHeaderAuthor in @github-ui/issue-body package
      __typename: 'User'
    }
    baseRepository: {
      name: string
      nameWithOwner: string
      defaultBranchRef: {
        name: string
      }
      owner: {
        login: string
      }
    }
    baseRef: {
      repository: {
        defaultBranch: string
        name: string
        nameWithOwner: string
        owner: {
          avatarUrl: string
          login: string
        }
      }
    }
    baseRefName: string
    baseRefOid: string
    body: string
    bodyHTML: string
    changedFiles: number
    commits: {
      totalCount: number
      edges?: ReadonlyArray<{
        node?: {
          commit?: {
            messageHeadline: string
            abbreviatedOid: string
            oid: string
            committedDate: string | Date
            author: {
              actor: {
                login: string
              }
            }
          }
        }
      }>
    }
    comparison: {
      diffEntries: {
        edges: Array<{node: DiffEntry}> | null
        nodes: DiffEntry[]
        totalCount: number
      }
      linesAdded: number
      linesDeleted: number
      linesChanged: number
      summary: PullRequestSummaryDelta[]
    }
    createdAt: string
    headRefName: string
    headRepository: {
      nameWithOwner: string
      name: string
      owner: {
        login: string
      }
      isFork: boolean
    }
    headRefOid: string
    id: string
    mergedAt: string | null
    repository: {
      databaseId: number
      id: string
      viewerPermission: string
      nameWithOwner: string
    }
    threads: {
      edges: ReadonlyArray<{node: PullRequestThread}>
      totalCommentsCount: number
    }
    viewerCanAddAndRemoveFromMergeQueue: boolean
    viewerCanClose?: boolean
    viewerCanComment: boolean
    viewerCanReopen?: boolean
    viewerViewedFiles: number
    websocket: string
    projectCards?: {
      edges?: ReadonlyArray<{
        node?: {
          id: string
          project?: {
            id: string
            name: string
            title: string
          }
        }
      }>
    }
    stateChannel: string | null | undefined
    deployedChannel: string | null | undefined
    reviewStateChannel: string | null | undefined
    workflowsChannel: string | null | undefined
    mergeQueueChannel: string | null | undefined
    headRefChannel: string | null | undefined
    baseRefChannel: string | null | undefined
    commitHeadShaChannel: string | null | undefined
    gitMergeStateChannel: string | null | undefined
  }

interface Viewer {
  id: string
  email: string
  login: string
  isSiteAdmin: boolean
  pullRequestUserPreferences: {
    diffView: string
    ignoreWhitespace: boolean
    tabSize?: number
  }
}

export function buildReviewRequest(data: {
  login: string
  isTeam?: boolean
  assignedFromTeam?: string
  assignedFromTeamIsCodeowner?: boolean
  id?: string
  isCodeowner?: boolean
}): ReviewRequest {
  const requestedReviewer = data.isTeam
    ? {
        name: data.login,
        teamAvatarUrl,
        url: `http://github.localhost/${data.login}`,
        id: data.id || data.login,
        organization: {
          name: 'testorg',
        },
        combinedSlug: data.login,
        __typename: 'Team',
      }
    : {
        login: data.login,
        avatarUrl: userAvatarUrl,
        url: `http://github.localhost/${data.login}`,
        id: data.id || data.login,
        asCodeOwner: data.isCodeowner ?? false,
        organization: {
          name: 'testorg',
        },
        __typename: 'User',
      }
  return {
    asCodeOwner: data.isCodeowner ?? false,
    assignedFromReviewRequest: {
      asCodeOwner: data.assignedFromTeamIsCodeowner ?? false,
      requestedReviewer: {
        __typename: 'Team',
        name: data.assignedFromTeam ?? '',
      },
    },
    requestedReviewer: requestedReviewer as RequestedReviewer,
  }
}

type BuildReviewInput = Partial<Review> & {
  avatarUrl?: string
  login?: string
  threadsAndReplies?: TimelineThreadOrComment[]
}

export function buildReview(data: BuildReviewInput): Review {
  return {
    __id: mockUUID(),
    authorAssociation: data.authorAssociation ?? 'CONTRIBUTOR',
    author: buildCommentAuthor({
      avatarUrl: data.avatarUrl ?? userAvatarUrl,
      login: data.login,
    }),
    bodyHTML: data.bodyHTML ?? '',
    bodyText: data.bodyText ?? '',
    createdAt: data.createdAt ?? new Date().toString(),
    databaseId: data.databaseId ?? 1,
    dismissedReviewState: data.dismissedReviewState,
    id: data.id ?? mockUUID(),
    onBehalfOf: data.onBehalfOf || {edges: null},
    onBehalfOfReviewers: data.onBehalfOfReviewers ?? [],
    pullRequestThreadsAndReplies: wrapListAsEdges(data.threadsAndReplies ?? []),
    state: data.state ?? 'APPROVED',
    url: data.url ?? '',
    pullRequest: data.pullRequest ?? {
      number: 1,
      author: {
        login: 'monalisa',
      },
    },
    repository: data.repository ?? {
      id: mockUUID(),
      isPrivate: false,
      name: 'smile',
      owner: {login: 'monalisa', url: '', id: mockUUID()},
    },
    viewerCanDelete: !!data.viewerCanDelete,
    viewerCanReport: !!data.viewerCanReport,
    viewerCanReportToMaintainer: !!data.viewerCanReportToMaintainer,
    viewerCanUpdate: !!data.viewerCanUpdate,
    viewerCanBlockFromOrg: !!data.viewerCanBlockFromOrg,
    viewerCanUnblockFromOrg: !!data.viewerCanUnblockFromOrg,
  }
}

export function buildCandidateReviewer(data: {name: string; kind: 'User' | 'Team'}): CandidateReviewer {
  if (data.kind === 'User') {
    return {
      reviewer: {
        __typename: 'User',
        avatarUrl: userAvatarUrl,
        id: data.name,
        login: data.name,
        name: data.name,
      },
    }
  } else {
    return {
      reviewer: {
        __typename: 'Team',
        combinedSlug: data.name,
        id: data.name,
        teamAvatarUrl,
        teamName: data.name,
      },
    }
  }
}

export function buildCodeowner(data: {id?: string; name: string; kind: 'User' | 'Team'}): Codeowner {
  if (data.kind === 'User') {
    return {
      __typename: 'User',
      avatarUrl: userAvatarUrl,
      id: data.id ?? mockUUID(),
      login: data.name,
      url: `http://github.localhost/${data.name}`,
    }
  } else {
    return {
      __typename: 'Team',
      combinedSlug: data.name,
      id: data.id ?? mockUUID(),
      teamAvatarUrl,
      name: data.name,
      url: `http://github.localhost/${data.name}`,
      organization: {
        name: 'testorg',
      },
    }
  }
}

export function buildLabel(data: {id?: string; name?: string; nameHTML?: string; color?: string; url?: string}): Label {
  return {
    id: data.id ?? mockUUID(),
    name: data.name ?? 'bug',
    nameHTML: data.nameHTML || data.name || 'bug',
    color: data.color ?? 'FFFFFF',
    url: data.url ?? 'https://www.example.com',
    description: 'A bug',
  }
}

export function buildSuggestedReviewer(data: {login: string; role?: 'author' | 'commenter'}): SuggestedReviewer {
  return {
    isAuthor: data.role === 'author' || false,
    isCommenter: data.role === 'commenter' || false,
    reviewer: {
      id: data.login,
      login: data.login,
      name: data.login,
      avatarUrl: userAvatarUrl,
    },
  }
}

export function buildOnBehalfOfReviewer({
  asCodeowner = false,
  name,
  kind = 'Team',
}: {
  asCodeowner?: boolean
  name: string
  kind?: 'User' | 'Team'
}): OnBehalfOfReviewer {
  const reviewer = kind === 'Team' ? {__typename: 'Team', combinedSlug: name} : {__typename: 'User', login: name}
  return {
    asCodeowner,
    reviewer: reviewer as OnBehalfOfReviewer['reviewer'],
  }
}

export function buildPullRequest(
  data: {
    id?: string
    changedFiles?: number
    codeowners?: Codeowner[]
    comparison?: {
      linesAdded?: number
      linesDeleted?: number
      linesChanged?: number
      summary?: PullRequestSummaryDelta[]
    }
    viewerViewedFiles?: number
    createdAt?: string
    diffEntries?: DiffEntry[]
    singleFile?: DiffEntry
    state?: PullRequestState
    isInMergeQueue?: boolean
    viewerCanAddAndRemoveFromMergeQueue?: boolean
    isDraft?: boolean
    combinedSlug?: string
    mergedAt?: string
    titleHTML?: string
    title?: string
    number?: number
    baseRefOid?: string
    baseRef?: {
      name: string
      repository: {
        defaultBranch: string
        name: string
        nameWithOwner: string
        owner: {
          avatarUrl: string
          login: string
        }
      }
    } | null
    baseRepository?: {
      nameWithOwner: string
      planSupportsDraftPullRequests?: boolean
    }
    body?: string
    bodyHTML?: string
    headRefName?: string
    headRefOid?: string
    headRepository?: {
      nameWithOwner?: string
      owner?: {
        login: string
      }
      name?: string
      isFork?: boolean
    }
    repository?: {
      databaseId: number
      id: string
      viewerPermission: RepositoryPermission
      nameWithOwner?: string
    }
    comments?: {
      totalCount: number
      nodes?: Array<{author: CommentAuthor | null}>
    }
    commits?: {
      totalCount: number
      edges?: ReadonlyArray<{
        node?: {
          commit?: {
            messageHeadline: string
            abbreviatedOid: string
            oid: string
            committedDate: string | Date
            author: {
              actor: {
                login: string
              }
            }
          }
        }
      }>
    }
    projectCards?: {
      edges?: ReadonlyArray<{
        node?: {
          id: string
          project?: {
            id: string
            name: string
            title: string
          }
        }
      }>
    }
    author?: {
      id?: string
      login: string
      avatarUrl?: string
    } | null
    statusCheckRollup?: {
      readonly contexts: {
        readonly totalCount: number
      }
    }
    latestReviews?: Review[]
    labels?: Label[]
    candidateReviewers?: CandidateReviewer[]
    reviewRequests?: ReviewRequest[]
    suggestedReviewers?: SuggestedReviewers
    assignees?: {nodes: Assignee[]}
    resourcePath?: string
    threads?: {
      threads: PullRequestThread[]
      totalCommentsCount?: number
    }
    allThreads?: {
      threads: PullRequestThread[]
      totalCommentsCount: number
    }
    totalCommentsCount?: number
    url?: string
    viewerCanEditFiles?: boolean
    viewerCanChangeBaseBranch?: boolean
    viewerCanClose?: boolean
    viewerCanReopen?: boolean
    viewerCanComment?: boolean
    viewerCanDeleteHeadRef?: boolean
    viewerCanRestoreHeadRef?: boolean
    viewerCanUpdate?: boolean
    viewerCanUpdateBranch?: boolean
    viewerCanLeaveNonCommentReviews?: boolean
    viewerHasViolatedPushPolicy?: boolean
    viewerPendingReview?: {
      id: string
      comments: {
        totalCount: number
      }
    }
    websocket?: string
    backwardTimeline?: WithoutFragments<ActivityView_pullRequest_backwardPagination$data['backwardTimeline']>
    forwardTimeline?: WithoutFragments<ActivityView_pullRequest_forwardPagination$data['forwardTimeline']>
  } = {},
): PullRequestResponse {
  const diffEntries = data.diffEntries ?? []
  const diffLinesAdded =
    data.comparison?.linesAdded === 0 || data.comparison?.linesAdded ? data.comparison.linesAdded : 1
  const diffLinesDeleted =
    data.comparison?.linesDeleted === 0 || data.comparison?.linesDeleted ? data.comparison.linesDeleted : 0
  const diffLinesChanged =
    data.comparison?.linesChanged === 0 || data.comparison?.linesChanged ? data.comparison.linesChanged : 1

  return {
    id: data.id || 'fakeId',
    createdAt: data.createdAt || twoDaysAgoDateTime(),
    titleHTML: data.titleHTML || 'Update Packages and README',
    title: data.title || 'Update Packages and README',
    isDraft: data.isDraft || false,
    number: data.number || 1,
    mergedAt: data.mergedAt || null,
    state: data.state || ('OPEN' as PullRequestState),
    isInMergeQueue: data.isInMergeQueue || false,
    viewerCanAddAndRemoveFromMergeQueue: data.viewerCanAddAndRemoveFromMergeQueue || false,
    baseRefOid: data.baseRefOid ?? 'fakeBaseRefOid',
    baseRef: {
      repository: {
        defaultBranch: 'main',
        name: 'smile',
        nameWithOwner: 'monalisa/smile',
        owner: {
          login: 'monalisa',
          avatarUrl: userAvatarUrl,
          ...data.baseRef?.repository?.owner,
        },
        ...data.baseRef?.repository,
      },
      ...data.baseRef,
    },
    baseRefName: data.baseRef?.name || 'main',
    baseRepository: {
      name: 'smile',
      nameWithOwner: 'monalisa/smile',
      defaultBranchRef: {
        name: 'main',
      },
      owner: {
        login: 'monalisa',
      },
      planSupportsDraftPullRequests: data.baseRepository?.planSupportsDraftPullRequests || false,
    },
    body: data.body || '',
    bodyHTML: data.bodyHTML || data.body || '',
    headRefName: data.headRefName || 'update-packages-and-readme-ref',
    headRepository: {
      nameWithOwner: data.headRepository?.nameWithOwner || 'monalisa/smile',
      name: data.headRepository?.name || 'smile',
      owner: data.headRepository?.owner || {
        login: 'monalisa',
      },
      isFork: data.headRepository?.isFork || false,
    },
    headRefOid: data.headRefOid || 'fakeHeadRefOid',
    repository: {
      databaseId: data.repository?.databaseId ?? 1,
      id: data.repository?.id ?? mockUUID(),
      viewerPermission: data.repository?.viewerPermission ?? 'ADMIN',
      nameWithOwner: data.repository?.nameWithOwner ?? 'testname/testowner',
    },
    commits: data.commits || {
      totalCount: 1,
    },
    author: {
      id: data.author?.id || mockUUID(),
      login: data.author?.login || 'janedoe',
      avatarUrl: data.author?.avatarUrl || userAvatarUrl,
      // required by IssueBodyHeaderAuthor in @github-ui/issue-body package
      __typename: 'User',
    },
    changedFiles: data.changedFiles || 0,
    codeowners: data.codeowners || [],
    comparison: {
      diffEntries: {
        edges: diffEntries.map(node => ({node})),
        nodes: diffEntries,
        totalCount: diffEntries.length,
      },
      linesAdded: diffLinesAdded,
      linesDeleted: diffLinesDeleted,
      linesChanged: diffLinesChanged,
      newCommit: {
        oid: 'mock-head-oid',
      },
      oldCommit: {
        oid: 'mock-base-oid',
      },
      summary:
        data.comparison?.summary ??
        diffEntries.map(node => ({
          path: node.path,
          pathDigest: node.pathDigest,
          additions: node.linesAdded,
          deletions: node.linesDeleted,
          changeType: node.status,
          unresolvedCommentCount: 0,
        })),
    },
    viewerViewedFiles: data.viewerViewedFiles || 0,
    reviewRequests: wrapListAsEdges(data.reviewRequests ?? []),
    latestReviews: wrapListAsEdges(data.latestReviews ?? []),
    candidateReviewers: wrapListAsEdges(data.candidateReviewers ?? []),
    suggestedReviewers: data.suggestedReviewers || [],
    assignees: data.assignees || {nodes: []},
    labels: wrapListAsEdges(data.labels ?? []),
    threads: {
      ...wrapListAsEdges(data.threads?.threads ?? []),
      totalCommentsCount: data.threads?.totalCommentsCount || 0,
    },
    allThreads: {
      ...wrapListAsEdges(data.allThreads?.threads ?? []),
      totalCommentsCount: data.allThreads?.totalCommentsCount || 0,
    },
    viewerCanComment: data.viewerCanComment || false,
    viewerCanClose: data.viewerCanClose || false,
    viewerCanReopen: data.viewerCanReopen || false,
    viewerCanEditFiles: data.viewerCanEditFiles || false,
    viewerCanUpdate: data.viewerCanUpdate || false,
    viewerCanLeaveNonCommentReviews: data.viewerCanLeaveNonCommentReviews || true,
    viewerHasViolatedPushPolicy: data.viewerHasViolatedPushPolicy || false,
    viewerPendingReview: data.viewerPendingReview || {
      id: mockUUID(),
      comments: {
        totalCount: 5,
      },
    },
    stateChannel: signChannel('fake-state-channel'),
    deployedChannel: signChannel('fake-deployed-channel'),
    reviewStateChannel: signChannel('fake-review-state-channel'),
    workflowsChannel: signChannel('fake-workflows-channel'),
    mergeQueueChannel: signChannel('fake-merge-queue-channel'),
    headRefChannel: signChannel('fake-head-ref-channel'),
    baseRefChannel: signChannel('fake-base-ref-channel'),
    commitHeadShaChannel: signChannel('fake-commit-head-sha-channel'),
    gitMergeStateChannel: signChannel('fake-git-merge-state-channel'),
    projectCards: {
      edges: [
        {
          node: {
            id: 'classic_project_item1',
            project: {
              id: 'classic_project1',
              name: 'Classic Project 1',
              title: 'Classic Project 1',
            },
          },
        },
      ],
    },
    websocket: data.websocket || signChannel('fake-websocket-channel'),
    forwardTimeline: data.forwardTimeline || {
      edges: [],
      totalCount: 0,
      __id: mockUUID(),
    },
    backwardTimeline: data.backwardTimeline || {
      edges: [],
      __id: mockUUID(),
    },
  }
}

export function buildDiffEntry(
  data: {
    isTooBig?: boolean
    isSubmodule?: boolean
    isBinary?: boolean
    isLfsPointer?: boolean
    diffEntryId?: string
    path?: string
    pathOwnership?: {
      pathOwners:
        | [
            {
              name: string
            },
          ]
        | []
      ruleLineNumber?: number
      ruleUrl?: string
      isOwnedByViewer: boolean
    }
    pathDigest?: string
    viewerViewedState?: FileViewedState
    oldTreeEntry?: {
      mode?: number
      path: string
    }
    oid?: string
    newTreeEntry?: {
      lineCount?: number
      mode?: number
      path: string
      isGenerated?: boolean
    } | null
    linesAdded?: number
    linesDeleted?: number
    linesChanged?: number
    diffLines?: TestDiffLine[]
    isCollapsed?: boolean
    status?: PatchStatus
    truncatedReason?: string | null
    outdatedThreads?: {
      threads?: PullRequestThread[]
      totalCommentsCount?: number
    }
    threads?: {
      threads?: PullRequestThread[]
      totalCommentsCount?: number
    }
  } = {},
): DiffEntry {
  const diffEntryId = mockUUID()
  const linesAdded = data.linesAdded === 0 || data.linesAdded ? data.linesAdded : 1
  const linesDeleted = data.linesDeleted === 0 || data.linesDeleted ? data.linesDeleted : 0
  const linesChanged = data.linesChanged === 0 || data.linesChanged ? data.linesChanged : 1

  return {
    id: data.diffEntryId || diffEntryId,
    isSubmodule: data.isSubmodule || false,
    isTooBig: data.isTooBig ?? false,
    isBinary: data.isBinary || false,
    isLfsPointer: data.isLfsPointer || false,
    oid: data.oid || 'fakeOid',
    diffEntryId: data.diffEntryId || diffEntryId,
    path: data.path || 'README.md',
    pathDigest: data.pathDigest || mockUUID(),
    pathOwnership: data.pathOwnership || {
      pathOwners: [{}],
      ruleLineNumber: 1,
      ruleUrl: 'http://github.localhost/monalisa/smile/blob/main/CODEOWNERS#L1',
      isOwnedByViewer: false,
    },
    viewerViewedState: data.viewerViewedState || ('UNVIEWED' as FileViewedState),
    oldTreeEntry: {
      path: data.oldTreeEntry?.path || data.path || 'README.md',
      mode: data.oldTreeEntry?.mode || 100644,
    },
    newTreeEntry:
      data.newTreeEntry === null
        ? null
        : {
            lineCount: data.newTreeEntry?.lineCount || data.diffLines?.length || 0,
            mode: data.newTreeEntry?.mode || 100644,
            path: data.newTreeEntry?.path || data.path || 'README.md',
            isGenerated: data.newTreeEntry?.isGenerated || false,
          },
    linesAdded,
    linesDeleted,
    linesChanged,
    isCollapsed: data.isCollapsed || true,
    diffLines:
      data.diffLines ||
      ([
        buildDiffLine({
          __id: `diff-${mockUUID()}`,
          left: 0,
          right: 0,
          blobLineNumber: 0,
          type: 'HUNK',
          //eslint-disable-next-line github/unescaped-html-literal
          html: `<td class="blob-code blob-code-inner blob-code-hunk">@@ -1,15 +1,15 @@</td>`,
          text: '@@ -1,15 +1,15 @@',
        }),
        buildDiffLine({
          __id: `diff-${mockUUID()}`,
          left: 0,
          right: 1,
          blobLineNumber: 1,
          type: 'ADDITION',
          //eslint-disable-next-line github/unescaped-html-literal
          html: `<span class="blob-code-inner blob-code-marker js-code-nav-pass " data-code-marker="+">  <span class="pl-en x x-first x-last">establcsh_connectcon</span> <span class="pl-pds">adapter</span>: <span class="pl-s">"<span class="x x-first x-last">sqlcte3</span>"</span><span>,</span> <span class="pl-pds">database</span>: <span class="pl-s">"foobar.db"</span></span>`,
          text: '+ establcsh_connectcon adapter: "sqlcte3", database: "foobar.db"',
        }),
      ] as TestDiffLine[]),
    status: data.status || ('ADDED' as PatchStatus),
    truncatedReason: data.truncatedReason ?? null,
    threads: {
      ...wrapListAsEdges(data.threads?.threads ?? []),
      totalCommentsCount: data.threads?.totalCommentsCount || 0,
    },
    outdatedThreads: {
      ...wrapListAsEdges(data.outdatedThreads?.threads ?? []),
      totalCommentsCount: data.outdatedThreads?.totalCommentsCount || 0,
    },
  } as unknown as DiffEntry
}

export function buildViewer(data: Partial<Viewer> = {}): Viewer {
  return {
    id: data.id || mockUUID(),
    email: data.email || 'test@test.com',
    isSiteAdmin: data.isSiteAdmin || false,
    login: data.login || 'monalisa',
    pullRequestUserPreferences: data.pullRequestUserPreferences || {
      diffView: 'unified',
      ignoreWhitespace: false,
      tabSize: 4,
    },
  }
}

type BuildDiffLineInput = Partial<
  Omit<TestDiffLine, 'threads'> & {
    threads: PullRequestThread[]
    threadConnectionId?: string
    totalCommentsCount?: number
  }
>

export function buildDiffLine({
  blobLineNumber,
  left,
  right,
  html = '@@ -1,15 +1,15 @@',
  text = '@@ -1,15 +1,15 @@',
  threads,
  type = 'INJECTED_CONTEXT',
  threadConnectionId = mockUUID(),
  totalCommentsCount,
  __id,
}: Partial<BuildDiffLineInput>): TestDiffLine {
  totalCommentsCount = totalCommentsCount ?? threads?.flatMap(thread => thread?.comments.edges ?? []).length ?? 0
  return {
    left: left || blobLineNumber,
    right: right || blobLineNumber,
    blobLineNumber,
    html,
    text,
    type,
    __id: __id || mockUUID(),
    threads: wrapListAsEdges(threads ?? [], threadConnectionId, totalCommentsCount),
  } as TestDiffLine
}

export function twoDaysAgoDateTime() {
  const date = new Date()
  date.setDate(date.getDate() - 2)
  return date.toISOString()
}

export function buildComment({
  id = mockUUID(),
  author = buildCommentAuthor({}),
  authorAssociation = 'OWNER',
  // eslint-disable-next-line github/unescaped-html-literal
  bodyHTML = '<p dir="auto">This is a test comment with <strong>Markdown</strong> code enabled for testing links at <a href="github.com">github</a> and stuff</p>',
  body = 'test comment',
  createdAt = twoDaysAgoDateTime(),
  currentDiffResourcePath = '/monalisa/smile/pull/4/files#discussion_r3',
  databaseId = null,
  isHidden = false,
  lastUserContentEdit = {
    __typename: 'UserContentEdit',
    id: mockUUID(),
    editor: {
      login: 'monalisa',
      url: '#',
      id: mockUUID(),
      __typename: 'Author',
    },
  },
  minimizedReason = null,
  outdated = false,
  publishedAt = twoDaysAgoDateTime(),
  // reference is the associated PullRequest
  reference = {
    number: 4,
    author: {
      login: 'monalisa',
    },
  },
  repository = {
    id: mockUUID(),
    isPrivate: false,
    name: 'smile',
    owner: {
      id: mockUUID(),
      login: 'monalisa',
      url: '/monalisa',
    },
  },
  stafftoolsUrl = '/stafftools/repositories/monalisa/smile/pull_requests/4/review_comments/3',
  state = 'SUBMITTED',
  url = '/monalisa/smile/pull/4/files#discussion_r3',
  viewerRelationship = 'OWNER',
  viewerCanBlockFromOrg = true,
  viewerCanDelete = true,
  viewerCanMinimize = true,
  viewerCanReport = true,
  viewerCanReportToMaintainer = true,
  viewerCanSeeMinimizeButton = true,
  viewerCanSeeUnminimizeButton = true,
  viewerCanUnblockFromOrg = true,
  viewerCanUpdate = true,
  viewerDidAuthor = true,
  subjectType = 'LINE',
}: Partial<Comment>): Required<Comment> {
  return {
    id,
    author,
    authorAssociation,
    bodyHTML,
    body,
    createdAt,
    currentDiffResourcePath,
    databaseId,
    isHidden,
    lastUserContentEdit,
    minimizedReason,
    outdated,
    publishedAt,
    reference,
    repository,
    stafftoolsUrl,
    state,
    subjectType,
    url,
    viewerRelationship,
    viewerDidAuthor,
    viewerCanBlockFromOrg,
    viewerCanDelete,
    viewerCanMinimize,
    viewerCanReport,
    viewerCanReportToMaintainer,
    viewerCanSeeMinimizeButton,
    viewerCanSeeUnminimizeButton,
    viewerCanUnblockFromOrg,
    viewerCanUpdate,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    ' $fragmentSpreads': [] as any,
  }
}

export function buildCommentAuthor({
  id = mockUUID(),
  login = 'monalisa',
  avatarUrl = userAvatarUrl,
  url = '/monalisa',
}): Author {
  return {
    id,
    login,
    avatarUrl,
    url,
    __typename: 'Author',
  }
}

export function buildRepository({labels}: {labels?: Label[]}) {
  return {
    labels: {nodes: labels ?? []},
  }
}

type BuildThreadInput = Partial<
  Omit<Thread & NonNullable<PullRequestThread> & TimelineThread, 'comments'> & {
    comments: Comment[]
    firstComment?: Comment
    threadPreviewComments?: Comment[]
    commentsConnectionId: string
  }
>

export function buildReviewThread(thread: BuildThreadInput = {}) {
  return {
    id: thread.id ?? mockUUID(),
    comments: wrapListAsEdges(thread.comments ?? [], thread.commentsConnectionId),
    firstComment: wrapListAsEdges([thread.firstComment] ?? []),
    threadPreviewComments: wrapListAsEdges(thread.threadPreviewComments ?? []),
    currentDiffResourcePath: thread.currentDiffResourcePath ?? '/monalisa/smile/pull/1#r1',
    diffSide: thread.diffSide ?? 'RIGHT',
    startDiffSide: thread.startDiffSide ?? 'RIGHT',
    isResolved: thread.isResolved ?? true,
    isOutdated: thread.isOutdated ?? false,
    line: thread.line ?? 1,
    startLine: thread.startLine ?? 1,
    path: thread.path ?? 'README.md',
    subject: thread.subject ?? null,
    subjectType: thread.subjectType ?? 'LINE',
    viewerCanReply: thread.viewerCanReply ?? true,
  }
}

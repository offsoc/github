type PullRequestReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED' | 'REVIEW_REQUIRED'

function mockRelayId(): string {
  return 'x_xxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function buildSearchShortcut({query}: {query: string}) {
  return {
    __id: 'SSC_asdkasd',
    id: 'SSC_asdkasd',
    __typename: 'SearchShortcut',
    name: 'My Shortcuts',
    query,
    scopingRepository: null,
    description: 'My Shortcuts',
    icon: 'PEOPLE',
    color: 'GRAY',
  }
}

export function buildRepository({name, owner}: {name: string; owner: string}) {
  return {
    id: mockRelayId(),
    name,
    owner: {
      login: owner,
    },
    isPrivate: false,
    isArchived: false,
    __typename: 'Repository',
  }
}

export function buildRepositoryWithIssueTypes({name, owner}: {name: string; owner: string}) {
  return {
    id: mockRelayId(),
    name,
    owner: {
      login: owner,
    },
    isPrivate: false,
    isArchived: false,
    __typename: 'Repository',
    issueTypes: {
      edges: [
        {
          node: {
            name: 'Bug',
            id: mockRelayId(),
          },
        },
        {
          node: {
            name: 'Feature',
            id: mockRelayId(),
          },
        },
      ],
    },
  }
}

const labelNodes = [
  {
    name: 'bug',
    nameHTML: 'bug',
    color: 'd73a4a',
    description: "Something isn't working",
    id: 'LA_kwAEHA',
  },
]

const actionLabelEdges = [
  {
    node: {
      name: 'bug',
      nameHTML: 'bug',
      color: 'd73a4a',
      description: "Something isn't working",
      id: 'LA_kwAEHA',
    },
  },
]

const issueType = {
  __id: 'ittestid',
  id: 'ittestid',
  name: 'Bug',
  isEnabled: true,
  __typename: 'IssueType',
}

export function buildIssues({
  title,
  number,
  state,
  start,
}: {
  title: string
  number: number
  state?: string
  start?: number
}) {
  const issues = []
  const from = start ?? 0
  for (let i = from; i < number + from; i++) {
    issues.push({node: buildIssue({title: `${title} ${i}`, state, index: i})})
  }

  return issues
}

export function buildIssue({
  title,
  state,
  index,
  owner,
  repo,
}: {title?: string; state?: string; index?: number; owner?: string; repo?: string} = {}) {
  const ownerName = owner ?? 'monalisa'
  const repoName = repo ?? 'smiles'
  const assigneeEdges = [
    {
      node: {
        id: 'testassignee1',
        name: 'testassignee1name',
        login: 'testassignee1login',
      },
    },
  ]
  const linkedPullRequestsEdges = [
    {
      node: {
        id: 'testpr1',
        title: 'testpr1title',
        number: 1,
        url: '#',
        merged: false,
        closed: false,
        isDraft: false,
        repository: {
          name: repoName,
          nameWithOwner: `${ownerName}/${repoName}`,
          __id: 'R_kwAEHB',
          id: 'R_kwAEHB',
          owner: {
            login: ownerName,
            __id: 'U_kwAEHA',
            id: 'U_kwAEHA',
            __typename: 'User',
          },
        },
      },
    },
  ]

  return {
    id: index ? `issue_${index}` : 'I_kwAEHA',
    __id: index ? `issue_${index}` : 'I_kwAEHA',
    __typename: 'Issue',
    totalCommentsCount: 2,
    number: 1,
    repository: {
      id: 'R_kwAEHB',
      __id: 'R_kwAEHB',
      name: repoName,
      owner: {
        login: ownerName,
        __typename: 'User',
        __id: 'U_kwAEHA',
        id: 'U_kwAEHA',
      },
      nameWithOwner: `${ownerName}/${repoName}`,
      issueTypes: {
        edges: {
          node: issueType,
        },
      },
      viewerCanPush: true,
      isDisabled: false,
      isLocked: false,
      isArchived: false,
    },
    state: state || 'OPEN',
    title: title || 'Issue 1',
    titleHtml: title || 'Issue 1',
    milestone: {
      id: 'mtestid',
      title: 'milestone1',
      closed: false,
    },
    labels: {
      nodes: labelNodes,
    },
    actionLabels: {
      edges: actionLabelEdges,
    },
    actionAssignees: {
      edges: assigneeEdges,
    },
    actionMilestone: {
      id: 'mtestid',
      title: 'milestone1',
      closed: false,
    },
    assignees: {
      edges: assigneeEdges,
    },
    closedByPullRequestsReferences: {
      edges: linkedPullRequestsEdges,
    },
    author: {
      id: 'author-id-2',
      login: 'monalisa',
      avatarUrl: '/monalisa.png',
      __typename: 'User',
      __id: 'U_kwAEHA',
    },
    updatedAt: '2021-01-01T00:00:00Z',
    createdAt: '2021-01-01T00:00:00Z',
    issueType,
    // We need to mock the named/alias'd field in ApplyIssueTypeAction to prevent a conflic in mocked ids
    actionIssueType: issueType,
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
      pageInfo: {
        hasNextPage: false,
        endCursor: 'd',
      },
    },
  }
}

export function buildPullRequest({
  author,
  body,
  reviewDecision,
  title,
  viewerDidAuthor,
  viewerLatestReviewRequest,
  viewerLatestReview,
}: {
  author?: {id?: string; login: string; avatarUrl: string}
  reviewDecision?: PullRequestReviewDecision | null
  body?: string
  title?: string
  viewerDidAuthor?: boolean
  viewerLatestReviewRequest?: {
    id: string
  }
  viewerLatestReview?: {
    state: PullRequestReviewDecision
  }
} = {}) {
  return {
    id: mockRelayId(),
    __typename: 'PullRequest',
    repository: {
      name: 'rando-repo',
      owner: {
        login: 'rando-owner',
      },
      nameWithOwner: 'rando-owner/rando-repo',
    },
    headCommit: {
      commit: {
        statusCheckRollup: {
          state: 'PENDING',
          contexts: {
            checkRunCount: 10,
            checkRunCountsByState: [
              {
                count: 5,
                state: 'PENDING',
              },
              {
                count: 5,
                state: 'SUCCESS',
              },
            ],
          },
        },
      },
    },
    author: author || {id: 'author-id-1', login: 'rando', avatarUrl: '/rando-assignee.png'},
    reactionGroups: {
      content: 'THUMBS_UP',
      reactors: {
        totalCount: 2,
      },
    },
    number: 2,
    pullRequestState: 'OPEN',
    createdAt: '2020-01-01',
    url: '/rando-owner/rando-repo/pull/2',
    updatedAt: '2020-01-01',
    body: body === null ? 'Description' : String(body),
    bodyHTML: body === null ? 'Description' : String(body),
    title: title || 'Pull Request 1',
    titleHTML: title || 'Pull Request 1',
    totalCommentsCount: 2,
    assignees: {
      edges: [
        {
          node: {
            login: 'rando assignee',
            avatarUrl: '/rando-assignee.png',
          },
        },
      ],
    },
    labels: {
      nodes: labelNodes,
    },
    reviewDecision: reviewDecision || null,
    viewerDidAuthor: viewerDidAuthor || false,
    viewerLatestReviewRequest: viewerLatestReviewRequest || null,
    viewerLatestReview: viewerLatestReview || null,
  }
}

// This is required in the setup for filter bar tests to work
// Taken from ui/packages/filter/utils/test-utils.ts
export const setupExpectedAsyncErrorHandlerForFilterBar = () => {
  jest.spyOn(console, 'error').mockImplementation((message: string) => {
    // * Because Filter is asynchronous, there are console errors that are thrown, but expected. This will rethrow
    // * any errors that are not related to the async nature of the component.
    if (!message.includes('wrapped in act(')) {
      // eslint-disable-next-line no-console
      console.warn(message)
    }
  })
}

import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {IssueTitleValue} from '../../client/api/columns/contracts/title'
import {
  type ExtendedRepository,
  IssueState,
  IssueStateReason,
  type Label,
  type Milestone,
  type ParentIssue,
  PullRequestState,
  StateReason,
  type User,
} from '../../client/api/common-contracts'
import type {Issue} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {
  CommentAuthorAssociation,
  ItemKeyType,
  type Reactions,
  type SidePanelMetadata,
} from '../../client/api/side-panel/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {
  ConfidenceColumnId,
  CustomDateColumnId,
  CustomNumberColumnId,
  CustomSingleSelectColumnId,
  CustomTextColumnId,
  EffortColumnId,
  ImpactColumnId,
  StageColumnId,
  TeamColumnId,
  ThemeColumnId,
} from '../data/columns'
import {todayISOString, yesterdayISOString} from '../data/dates'
import {mockIssueTypes} from '../data/issue-types'
import {mockLabels} from '../data/labels'
import {getMilestoneByRepository} from '../data/milestones'
import {mockLinkedPullRequests} from '../data/pull-requests'
import {mockPublicRepo} from '../data/repositories'
import {getSingleSelectOptionValueFromName, statusOptions} from '../data/single-select'
import {getReviewerTeam} from '../data/teams'
import {DefaultSuggestedAssignees, getReviewerUser, getUser, mockUsers} from '../data/users'
import {DefaultDraftIssue} from './draft-issues'
import {ComplexFeatureTrackedItem, OldBugTrackedItem, StyleNitpickTrackedItem} from './tracked-issues'

function mustExist<T>(item: T | null | undefined) {
  if (item == null) throw new Error('Unable to find user')
  return item
}

const restOfTheContent = {
  user: mustExist(mockUsers.find(u => u.login === 'abdelhamid-attaby')),
  globalRelayId: '',
  body: ``,
  bodyHtml: ``,
  createdAt: '2021-11-16',
}

export const DefaultClosedIssue: Issue = {
  id: 2,
  contentType: ItemType.Issue,
  content: {
    id: 2,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 1,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  issueCreatedAt: '2022-02-01T00:00:00Z',
  issueClosedAt: '2022-03-02T00:00:00Z',
  state: 'closed',
  stateReason: StateReason.NotPlanned,
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: createIssueTitle({
        number: 2,
        state: IssueState.Closed,
        title:
          "This is the title for my closed issue. Now that I've closed it, the text is really and long and should elide!",
      }),
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: mockUsers.slice(0, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [not_typesafe_nonNullAssertion(mockLabels[0]), not_typesafe_nonNullAssertion(mockLabels[1])],
    },
    {
      memexProjectColumnId: SystemColumnId.LinkedPullRequests,
      value: mockLinkedPullRequests.slice(3),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [],
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: getSingleSelectOptionValueFromName('Done', statusOptions),
    },
    {
      memexProjectColumnId: CustomNumberColumnId,
      value: {
        value: 10,
      },
    },
    {
      memexProjectColumnId: TeamColumnId,
      value: {
        raw: 'Novelty Aardvarks',
        html: 'Novelty Aardvarks',
      },
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: {value: todayISOString},
    },
  ],
}

export const OverflowingClosedIssue: Issue = {
  ...DefaultClosedIssue,
  memexProjectColumnValues: [
    not_typesafe_nonNullAssertion(DefaultClosedIssue.memexProjectColumnValues[0]),
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: DefaultSuggestedAssignees,
    },
    not_typesafe_nonNullAssertion(DefaultClosedIssue.memexProjectColumnValues[2]),
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: mockLabels,
    },
    not_typesafe_nonNullAssertion(DefaultClosedIssue.memexProjectColumnValues[4]),
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: 'Really, really, really, really, really, really, really, really, really, really, really, really, really, really long custom text value',
        html: 'Really, really, really, really, really, really, really, really, really, really, really, really, really, really long custom text value',
      },
    },
  ],
}

export const DefaultOpenIssue: Issue = {
  id: 3,
  contentType: ItemType.Issue,
  content: {
    id: 3,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 3,
        state: IssueState.Open,
        title: {raw: 'Fix this `issue` please!', html: 'Fix this <code>issue</code> please!'},
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [getUser('traumverloren')],
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 4),
    },
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [not_typesafe_nonNullAssertion(mockLabels[0])],
    },
    {
      memexProjectColumnId: SystemColumnId.LinkedPullRequests,
      value: mockLinkedPullRequests.slice(0, 3),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [],
    },
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: 'Really really, really, really, really, really long custom text value',
        html: 'Really really, really, really, really, really long custom text value',
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: getSingleSelectOptionValueFromName('Backlog', statusOptions),
    },
    {
      memexProjectColumnId: CustomNumberColumnId,
      value: {
        value: 1,
      },
    },
    {
      memexProjectColumnId: StageColumnId,
      value: null,
    },
    {
      memexProjectColumnId: ThemeColumnId,
      value: null,
    },
    {
      memexProjectColumnId: ImpactColumnId,
      value: null,
    },
    {
      memexProjectColumnId: ConfidenceColumnId,
      value: null,
    },
    {
      memexProjectColumnId: EffortColumnId,
      value: null,
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: null,
    },
    {
      memexProjectColumnId: CustomSingleSelectColumnId,
      value: null,
    },
    {
      memexProjectColumnId: TeamColumnId,
      value: {
        raw: 'Novelty Aardvarks',
        html: 'Novelty Aardvarks',
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Tracks,
      value: {total: 11, completed: 7, percent: 64},
    },
    {
      memexProjectColumnId: SystemColumnId.TrackedBy,
      value: [
        {
          key: {ownerId: 1, itemId: 2, primaryKey: {uuid: '1234-5678-9012-3456'}},
          title: 'memex issue',
          url: 'https://github.com/github/memex/issues/335',
          state: IssueState.Open,
          repoName: 'memex',
          repoId: 1,
          userName: 'github',
          number: 335,
          labels: [],
          assignees: [],
          completion: {total: 10, completed: 5, percent: 50},
        },
      ],
    },
    {
      memexProjectColumnId: SystemColumnId.ParentIssue,
      value: {
        id: 1,
        globalRelayId: 'I_kwARTg',
        number: 10,
        title: 'Parent One',
        state: 'open',
        nwoReference: 'github/sriracha-4#10',
        url: 'http://github.localhost:80/github/sriracha-4/issues/14',
        owner: 'github',
        repository: 'sriracha-4',
        subIssueList: {
          total: 1,
          completed: 0,
          percentCompleted: 0,
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.SubIssuesProgress,
      value: {id: 1, total: 6, completed: 2, percentCompleted: 33},
    },
    {
      memexProjectColumnId: SystemColumnId.IssueType,
      value: not_typesafe_nonNullAssertion(mockIssueTypes[1]),
    },
  ],
}

export const IssueWithMultipleLinkedPullRequests: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.LinkedPullRequests,
      value: [
        {
          id: 123,
          isDraft: false,
          number: 123,
          state: PullRequestState.Merged,
          url: 'https://github.com/github/memex/issues/123',
        },
        {
          id: 1,
          isDraft: false,
          number: 1,
          state: PullRequestState.Open,
          url: 'https://github.com/github/memex/issues/1',
        },
        {
          id: 500,
          isDraft: false,
          number: 500,
          state: PullRequestState.Open,
          url: 'https://github.com/github/memex/issues/500',
        },
      ],
    },
  ],
}

export const DefaultOpenIssueWithStatusNoLabels: Issue = {
  id: 3,
  contentType: ItemType.Issue,
  content: {
    id: 3,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 3,
        state: IssueState.Open,
        title: {raw: 'Fix this issue please!', html: 'Fix this issue please!'},
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [getUser('iulia-b')],
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 3),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: {...not_typesafe_nonNullAssertion(statusOptions[0])},
    },
    {
      memexProjectColumnId: CustomTextColumnId,
      value: {
        raw: 'Really really, really, really, really, really long custom text value',
        html: 'Really really, really, really, really, really long custom text value',
      },
    },
    {
      memexProjectColumnId: CustomNumberColumnId,
      value: {
        value: 1,
      },
    },
  ],
}

export const IssueWithAFixedAssignee: Issue = {
  id: 4,
  contentType: ItemType.Issue,
  content: {
    id: 4,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 3,
        state: IssueState.Open,
        title: {raw: 'Fix this issue please!', html: 'Fix this issue please!'},
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [not_typesafe_nonNullAssertion(mockUsers[0])],
    },
  ],
}

export const IssueWithAssigneeMatt: Issue = {
  id: 4,
  contentType: ItemType.Issue,
  content: {
    id: 4,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 3,
        state: IssueState.Open,
        title: {raw: 'Fix this issue please! @azenMatt', html: 'Fix this issue please! @azenMatt'},
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [not_typesafe_nonNullAssertion(mockUsers.find(u => u.login === 'azenMatt'))],
    },
  ],
}

export const IssueWithLabels: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [
        {
          color: 'd73a4a',
          id: 1672383158,
          name: 'bug',
          nameHtml: 'bug',
          url: 'https://github.com/github/memex/labels/bug',
        },
        {
          color: 'ffffff',
          id: 1672383159,
          name: 'zebra',
          nameHtml: 'zebra',
          url: 'https://github.com/github/memex/labels/zebra',
        },
        {
          color: '3370C4',
          id: 2648860752,
          name: '🏓 layout:table',
          nameHtml:
            '\u003cg-emoji class="g-emoji" alias="ping_pong" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f3d3.png"\u003e🏓\u003c/g-emoji\u003e layout:table',
          url: 'https://github.com/github/memex/labels/%F0%9F%8F%93%20layout%3Atable',
        },
      ],
    },
  ],
}

export const IssueWithParentIssue: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.ParentIssue,
      value: {
        id: 71,
        number: 14,
        state: 'open',
        title: 'That Good Night',
        url: 'http://github.localhost:80/github/sriracha-4/issues/14',
      } as ParentIssue,
    },
  ],
}

export const IssueWithType: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.IssueType,
      value: not_typesafe_nonNullAssertion(mockIssueTypes[1]),
    },
  ],
}

export const IssueWithMultipleAssignees: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [
        {
          id: 2,
          global_relay_id: '2',
          login: 'second',
          name: 'second',
          avatarUrl: '/assets/avatars/u/0.png',
        } as User,
        {
          id: 1,
          global_relay_id: '1',
          login: 'first',
          name: 'first',
          avatarUrl: '/assets/avatars/u/0.png',
        } as User,
      ],
    },
  ],
}

export const IssueWithMultipleReviewers: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: [{reviewer: getReviewerTeam('Memex Team 1')}, {reviewer: getReviewerUser('dmarcey')}],
    },
  ],
}

export const IssueWithDueDate: Issue = {
  id: 5,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: CustomDateColumnId,
      value: {value: '2021-04-23'},
    },
  ],
}

export const IssueWithoutDueDate: Issue = {
  id: 60,
  contentType: ItemType.Issue,
  content: {
    id: 5,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 2,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [],
}

export const IssueInPublicRepositoryWithCustomColumns: Issue = {
  id: 53,
  contentType: ItemType.Issue,
  content: {
    id: 53,
    url: 'https://github.com/github/memex/pull/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 8,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 53,
        state: IssueState.Closed,
        title: {raw: 'Account for multiple assignees', html: 'Account for multiple assignees'},
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: CustomSingleSelectColumnId,
      value: {id: '1'},
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: null,
    },
  ],
}

export const SecondIssueInPublicRepositoryWithCustomColumns: Issue = {
  id: 54,
  contentType: ItemType.Issue,
  content: {
    id: 54,
    url: 'https://github.com/github/memex/issues/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 8,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 53,
        state: IssueState.Open,
        title: {
          raw: 'send new memex_group_by_repository feature flag to client',
          html: 'send new memex_group_by_repository feature flag to client',
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: CustomSingleSelectColumnId,
      value: {id: '3'},
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: null,
    },
  ],
}

export const ThirdIssueInPublicRepositoryWithCustomColumns: Issue = {
  id: 55,
  contentType: ItemType.Issue,
  content: {
    id: 55,
    url: 'https://github.com/github/memex/issues/555',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 8,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 53,
        state: IssueState.Open,
        title: {
          raw: 'enable memex_hide_empty_groups by default and update impacted tests',
          html: 'enable memex_hide_empty_groups by default and update impacted tests',
        },
      },
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    // no custom single select field to ensure default group is rendered
    {
      memexProjectColumnId: CustomDateColumnId,
      value: null,
    },
  ],
}

export const IssueInPublicRepositoryWithPartialColumns: Issue = {
  id: 53,
  contentType: ItemType.Issue,
  content: {
    id: 53,
    url: 'https://github.com/github/memex/issue/53',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 1,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: {
        number: 53,
        state: IssueState.Closed,
        title: {raw: 'Account for multiple assignees', html: 'Account for multiple assignees'},
      },
    },
  ],
}

export const DefaultCopyIssue: Issue = {
  id: 54,
  contentType: ItemType.Issue,
  content: {
    id: 54,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 1,
  updatedAt: '2022-03-01T00:00:00Z',
  createdAt: '2022-03-01T00:00:00Z',
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: createIssueTitle({
        number: 2,
        state: IssueState.Closed,
        title: 'This is the title for my copy issue.',
      }),
    },
    {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: [getUser('traumverloren')],
    },
    {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: getMilestoneByRepository(mockPublicRepo.id, 2),
    },
    {
      memexProjectColumnId: SystemColumnId.Labels,
      value: [not_typesafe_nonNullAssertion(mockLabels[0]), not_typesafe_nonNullAssertion(mockLabels[1])],
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: {...mockPublicRepo},
    },
    {
      memexProjectColumnId: SystemColumnId.Status,
      value: getSingleSelectOptionValueFromName('Done', statusOptions),
    },
    {
      memexProjectColumnId: SystemColumnId.TrackedBy,
      value: [
        {
          key: {ownerId: 1, itemId: 2, primaryKey: {uuid: '1234-5678-9012-3456'}},
          title: 'memex issue',
          url: 'https://github.com/github/memex/issues/335',
          state: IssueState.Open,
          repoName: 'memex',
          repoId: 1,
          userName: 'github',
          number: 335,
          labels: [],
          assignees: [],
          completion: {total: 10, completed: 2, percent: 20},
        },
      ],
    },
    {
      memexProjectColumnId: CustomNumberColumnId,
      value: {
        value: 10,
      },
    },
    {
      memexProjectColumnId: TeamColumnId,
      value: {
        raw: 'Novelty Aardvarks',
        html: 'Novelty Aardvarks',
      },
    },
    {
      memexProjectColumnId: CustomDateColumnId,
      value: {value: todayISOString},
    },
  ],
}

const repository: ExtendedRepository = {
  id: 242424,
  name: 'memex',
  nameWithOwner: 'github/memex',
  url: 'https://github.com/github/memex',
  hasIssues: true,
  isArchived: false,
  isForked: false,
  isPublic: false,
}

export const DefaultTrackedByIssue: Issue = {
  id: 55,
  contentType: ItemType.Issue,
  content: {
    id: 55,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 1,
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: createIssueTitle({
        number: 2,
        state: IssueState.Open,
        title: 'This is the title for my tracked-by issue.',
      }),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: repository,
    },
    {
      memexProjectColumnId: SystemColumnId.TrackedBy,
      value: [ComplexFeatureTrackedItem, StyleNitpickTrackedItem],
    },
  ],
}

const parentIssue: ParentIssue = {
  id: 57,
  globalRelayId: 'I_r2d2c3po4lom',
  number: 100,
  owner: 'github',
  state: 'open',
  title: 'Parent Issue',
  repository: 'github/memex',
  nwoReference: 'github/memex#100',
  url: 'https://github.com/github/memex/issues/100',
  subIssueList: {
    total: 1,
    completed: 0,
    percentCompleted: 0,
  },
}

export const DefaultSubIssue: Issue = {
  id: 57,
  contentType: ItemType.Issue,
  content: {
    id: 57,
    url: 'https://github.com/github/memex/issues/336',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 1,
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: createIssueTitle({
        number: 2,
        state: IssueState.Open,
        title: 'This is the title for my sub-issue.',
      }),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: repository,
    },
    {
      memexProjectColumnId: SystemColumnId.ParentIssue,
      value: parentIssue,
    },
  ],
}

const githubRepository: ExtendedRepository = {
  id: 4444444,
  name: 'github',
  nameWithOwner: 'github/github',
  url: 'https://github.com/github/github',
  hasIssues: true,
  isArchived: false,
  isForked: false,
  isPublic: false,
}

export const ClosedTrackedByIssue: Issue = {
  id: 56,
  contentType: ItemType.Issue,
  content: {
    id: 56,
    url: 'https://github.com/github/memex/issues/337',
    ...restOfTheContent,
  },
  contentRepositoryId: mockPublicRepo.id,
  priority: 1,
  memexProjectColumnValues: [
    {
      memexProjectColumnId: SystemColumnId.Title,
      value: createIssueTitle({
        number: 2,
        state: IssueState.Closed,
        title: 'This is the title for a closed tracked-by issue.',
      }),
    },
    {
      memexProjectColumnId: SystemColumnId.Repository,
      value: githubRepository,
    },
    {
      memexProjectColumnId: SystemColumnId.TrackedBy,
      value: [OldBugTrackedItem],
    },
  ],
}

type IssueTitleParams = Pick<IssueTitleValue, 'number' | 'state' | 'stateReason'> & {title: string}

export function createIssueTitle(items: IssueTitleParams): IssueTitleValue {
  const {number, state, stateReason, title} = items
  return {
    number,
    state,
    stateReason,
    title: {raw: title, html: title},
    issueId: 2524242,
  }
}

export const DefaultOpenSidePanelMetadata: SidePanelMetadata = {
  itemKey: {
    kind: ItemKeyType.ISSUE,
    itemId: DefaultOpenIssue.id,
    repositoryId: DefaultOpenIssue.contentRepositoryId,
  },
  title: {
    raw: '',
    html: '',
  },
  description: {
    body: 'Hi there, this is a issue body',
    bodyHtml: '<p>Hi there, this is a issue body</p>',
    editedAt: yesterdayISOString,
  },
  createdAt: todayISOString,
  updatedAt: todayISOString,
  user: not_typesafe_nonNullAssertion(mockUsers[0]),
  state: {
    state: IssueState.Open,
  },
  comments: [
    {
      id: 1729,
      createdAt: '2022-03-01T00:00:00Z',
      updatedAt: '2022-03-01T00:00:00Z',
      description: {
        body: 'Hi there, this is a comment',
        bodyHtml: '<p>Hi there, this is a comment</p>',
        editedAt: '2022-03-02T00:00:00Z',
      },
      issueId: DefaultOpenIssue.id,
      repositoryId: DefaultOpenIssue.contentRepositoryId,
      user: getUser('tylerdixon'),
      authorAssociation: CommentAuthorAssociation.COLLABORATOR,
      viewerCanReact: true,
      reactions: {
        heart: ['tylerdixon', 'ayy-bc'],
      },
      capabilities: ['editDescription', 'react'],
    },
  ],
  reactions: {
    rocket: ['tylerdixon'],
  },
  liveUpdateChannel: '',
  capabilities: ['close', 'comment', 'editDescription', 'editTitle', 'react', 'reopen'],
  projectItemId: DefaultOpenIssue.id,
  labels: not_typesafe_nonNullAssertion(
    DefaultOpenIssue.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Labels),
  ).value as Array<Label>,
  assignees: not_typesafe_nonNullAssertion(
    DefaultOpenIssue.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Assignees),
  ).value as Array<User>,
  milestone: not_typesafe_nonNullAssertion(
    DefaultOpenIssue.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Milestone),
  ).value as Milestone,
  url: '',
  issueNumber: 0,
  repository: mockPublicRepo,
}

export const DefaultClosedSidePanelMetadata: SidePanelMetadata = {
  itemKey: {
    kind: ItemKeyType.ISSUE,
    itemId: DefaultOpenIssue.id,
    repositoryId: DefaultOpenIssue.contentRepositoryId,
  },
  title: {
    raw: '',
    html: '',
  },
  description: {
    body: '',
    bodyHtml: '',
  },
  createdAt: todayISOString,
  updatedAt: todayISOString,
  user: getUser('UnicodeRogue'),
  state: {
    state: IssueState.Closed,
    stateReason: IssueStateReason.Completed,
  },
  comments: [
    {
      id: 8675309,
      createdAt: '2022-03-11T00:00:00Z',
      updatedAt: '2022-03-11T00:00:00Z',
      description: {
        body: 'Hi there, this is another comment.',
        bodyHtml: '<p>Hi there, this is another comment.</p>',
      },
      issueId: DefaultClosedIssue.id,
      repositoryId: DefaultClosedIssue.contentRepositoryId,
      user: getUser('traumverloren'),
      authorAssociation: CommentAuthorAssociation.COLLABORATOR,
      viewerCanReact: true,
      reactions: {heart: ['tylerdixon'], rocket: ['tylerdixon', 'ayy-bc']},
      capabilities: ['editDescription', 'react'],
    },
  ],
  reactions: {
    heart: ['tylerdixon', 'ayy-bc'],
  },
  liveUpdateChannel: '',
  capabilities: ['close', 'comment', 'editDescription', 'editTitle', 'react', 'reopen'],
  projectItemId: DefaultOpenIssue.id,
  labels: not_typesafe_nonNullAssertion(
    DefaultClosedIssue.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Labels),
  ).value as Array<Label>,
  assignees: not_typesafe_nonNullAssertion(
    DefaultClosedIssue.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Assignees),
  ).value as Array<User>,
  milestone: not_typesafe_nonNullAssertion(
    DefaultClosedIssue.memexProjectColumnValues.find(v => v.memexProjectColumnId === SystemColumnId.Milestone),
  ).value as Milestone,
  url: '',
  issueNumber: 0,
  repository: mockPublicRepo,
}

export const DefaultDraftSidePanelMetadata: SidePanelMetadata = {
  itemKey: {
    kind: ItemKeyType.PROJECT_DRAFT_ISSUE,
    projectItemId: DefaultDraftIssue.id,
  },
  title: {
    raw: '',
    html: '',
  },
  description: {
    body: 'Hi there, this is a issue body',
    bodyHtml: '<p>Hi there, this is a issue body</p>',
    editedAt: yesterdayISOString,
  },
  createdAt: todayISOString,
  updatedAt: todayISOString,
  user: not_typesafe_nonNullAssertion(mockUsers[0]),
  state: {
    state: IssueState.Open,
  },
  liveUpdateChannel: '',
  capabilities: ['editDescription', 'editTitle'],
  projectItemId: DefaultDraftIssue.id,
}

export const DefaultIssueCommentReaction: Reactions = {
  heart: ['tylerdixon'],
  rocket: ['tylerdixon', 'ayy-bc'],
  '+1': ['maxbeizer', 'ayy-bc'],
  '-1': ['shiftkey'],
}

export const AllIssueCommentReactions: Reactions = {
  heart: ['tylerdixon'],
  rocket: ['tylerdixon', 'ayy-bc'],
  '+1': ['maxbeizer', 'ayy-bc'],
  '-1': ['shiftkey'],
  tada: ['aricwalker', 'lerebear'],
  smile: ['stephenotalora'],
  eyes: ['olivia'],
  thinking_face: ['japf'],
}

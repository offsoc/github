import {MemexColumnDataType, SystemColumnId} from '../client/api/columns/contracts/memex-column'
import {type PageView, ViewTypeParam} from '../client/api/view/contracts'
import {
  assigneesColumn,
  autoFillColumnServerProps,
  confidenceColumn,
  createColumn,
  customDateColumn,
  customIterationColumn,
  customNumberColumn,
  customReasonColumn,
  customSingleSelectColumn,
  customTextColumn,
  effortColumn,
  endDateColumn,
  impactColumn,
  issueTypeColumn,
  labelsColumn,
  linkedPullRequestsColumn,
  milestoneColumn,
  multiWordSingleSelectColumn,
  parentIssueColumn,
  repositoryColumn,
  reviewersColumn,
  secondaryIterationColumn,
  stageColumn,
  startDateColumn,
  statusColumn,
  subIssuesProgressColumn,
  teamColumn,
  themeColumn,
  titleColumn,
  trackedByColumn,
  tracksColumn,
  xssTextColumn,
} from './data/columns'
import {aardvarkOptions, statusOptions} from './data/single-select'
import {autoFillViewServerProps, createView} from './data/views'

export const ProductionDefaultColumns = autoFillColumnServerProps([
  createColumn({
    dataType: MemexColumnDataType.Title,
    id: SystemColumnId.Title,
    name: 'Title',
    userDefined: false,
  }),
  createColumn({
    dataType: MemexColumnDataType.Assignees,
    id: SystemColumnId.Assignees,
    name: 'Assignees',
    userDefined: false,
  }),
  createColumn({
    dataType: MemexColumnDataType.SingleSelect,
    id: SystemColumnId.Status,
    name: 'Status',
    userDefined: false,
    settings: {
      options: statusOptions,
    },
  }),
  createColumn({
    dataType: MemexColumnDataType.Labels,
    id: SystemColumnId.Labels,
    name: 'Labels',
    userDefined: false,
    defaultColumn: false,
  }),
  createColumn({
    dataType: MemexColumnDataType.LinkedPullRequests,
    id: SystemColumnId.LinkedPullRequests,
    name: 'Linked pull requests',
    userDefined: false,
    defaultColumn: false,
  }),
  createColumn({
    dataType: MemexColumnDataType.Repository,
    id: SystemColumnId.Repository,
    name: 'Repository',
    userDefined: false,
    defaultColumn: false,
  }),
  createColumn({
    dataType: MemexColumnDataType.Milestone,
    id: SystemColumnId.Milestone,
    name: 'Milestone',
    userDefined: false,
    defaultColumn: false,
  }),
  createColumn({
    dataType: MemexColumnDataType.IssueType,
    id: SystemColumnId.IssueType,
    name: 'Type',
    userDefined: false,
    defaultColumn: false,
  }),
])

export const P50Columns = autoFillColumnServerProps(
  ProductionDefaultColumns.map(c => ({...c, defaultColumn: true})).concat([
    createColumn({
      dataType: MemexColumnDataType.Text,
      id: 1,
      name: 'Text',
      userDefined: true,
      defaultColumn: true,
    }),
    createColumn({
      dataType: MemexColumnDataType.Number,
      id: 2,
      name: 'Number',
      userDefined: true,
      defaultColumn: true,
    }),
    createColumn({
      dataType: MemexColumnDataType.Date,
      id: 3,
      name: 'Date',
      userDefined: true,
      defaultColumn: true,
    }),
    createColumn({
      dataType: MemexColumnDataType.SingleSelect,
      id: 4,
      name: 'Single-Select',
      userDefined: true,
      defaultColumn: true,
      settings: {
        options: aardvarkOptions,
      },
    }),
  ]),
)

export const P99Columns = P50Columns

export const DefaultColumns = autoFillColumnServerProps([
  titleColumn,
  assigneesColumn,
  statusColumn,
  labelsColumn,
  repositoryColumn,
  milestoneColumn,
  linkedPullRequestsColumn,
  tracksColumn,
  trackedByColumn,
  issueTypeColumn,
  reviewersColumn,
  stageColumn,
  teamColumn,
  themeColumn,
  impactColumn,
  confidenceColumn,
  effortColumn,
  customTextColumn,
  customNumberColumn,
  customDateColumn,
  customSingleSelectColumn,
  multiWordSingleSelectColumn,
])

export const DefaultViews: Array<PageView> = autoFillViewServerProps([
  createView({
    name: '',
    filter: '',
    layout: ViewTypeParam.Table,
    groupBy: [],
    verticalGroupBy: [],
    sortBy: [],
    priority: null,
    visibleFields: DefaultColumns.filter(c => c.defaultColumn).map(c => c.databaseId),
    aggregationSettings: {hideItemsCount: false, sum: []},
    layoutSettings: {},
    sliceBy: {},
    sliceValue: '',
  }),
])

export const DateDemoColumns = autoFillColumnServerProps(
  ProductionDefaultColumns.concat({...customDateColumn, defaultColumn: true}),
)

export const SingleSelectDemoColumns = autoFillColumnServerProps([
  ...ProductionDefaultColumns.map(col => (col.id === 'Title' ? col : {...col, defaultColumn: false})),
  {...customDateColumn, defaultColumn: true},
  {...customSingleSelectColumn, defaultColumn: true},
])

export const PartialDataColumns = autoFillColumnServerProps([
  ...ProductionDefaultColumns.map(col => ({...col, defaultColumn: true})),
  {...reviewersColumn, defaultColumn: true},
  {...customTextColumn, defaultColumn: true},
  {...customDateColumn, defaultColumn: true},
  {...customSingleSelectColumn, defaultColumn: true},
  {...customNumberColumn, defaultColumn: true},
  {...customIterationColumn, defaultColumn: true},
])

export const TitleColumnHiddenDefaultColumns = ProductionDefaultColumns.map(col =>
  col.id === 'Title' ? {...col, defaultColumn: false} : col,
)

export const OnlyTitleVisibleColumns = autoFillColumnServerProps([
  titleColumn,
  {...assigneesColumn, defaultColumn: false},
  {...statusColumn, defaultColumn: false},
  {...labelsColumn, defaultColumn: false},
  {...repositoryColumn, defaultColumn: false},
  {...milestoneColumn, defaultColumn: false},
  {...linkedPullRequestsColumn, defaultColumn: false},
  {...reviewersColumn, defaultColumn: false},
])

export const IterationDemoColumns = autoFillColumnServerProps([
  ...ProductionDefaultColumns,
  {...customIterationColumn, defaultColumn: true},
])

export const ReasonDemoColumns = autoFillColumnServerProps([
  ...ProductionDefaultColumns,
  {...customReasonColumn, defaultColumn: true},
])

export const XssTestColumns = autoFillColumnServerProps([
  titleColumn,
  {...xssTextColumn, defaultColumn: true},
  {...statusColumn, defaultColumn: false},
])

export const RoadmapTestColumns = autoFillColumnServerProps([
  ...ProductionDefaultColumns,
  {...customIterationColumn, defaultColumn: true},
  startDateColumn,
  endDateColumn,
  customDateColumn,
  secondaryIterationColumn,
])

export const TrackedByDemoColumns = autoFillColumnServerProps([
  titleColumn,
  {...trackedByColumn, defaultColumn: true},
  {...repositoryColumn, defaultColumn: true},
  {...statusColumn, defaultColumn: false},
])

export const SubIssueDemoColumns = autoFillColumnServerProps([
  titleColumn,
  {...statusColumn, defaultColumn: false},
  {...parentIssueColumn, defaultColumn: true},
  {...subIssuesProgressColumn, defaultColumn: true},
  {...repositoryColumn, defaultColumn: true},
])

export const getItemsBlockLabelSuggestionsResponse = {
  data: {
    repository: {
      labels: {
        edges: [
          {
            node: {
              id: 'LA_kwAPAw',
              color: 'fef2c0',
              name: ':cactus: deferred timeline',
              nameHTML:
                '<g-emoji class="g-emoji" alias="cactus" fallback-src="/images/icons/emoji/unicode/1f335.png">🌵</g-emoji> deferred timeline',
              description: 'This issue or pull request already exists',
              __typename: 'Label',
            },
            cursor: 'MQ',
          },
          {
            node: {
              id: 'LA_kwAPAQ',
              color: 'efe24f',
              name: 'bug :bug:',
              nameHTML:
                'bug <g-emoji class="g-emoji" alias="bug" fallback-src="/images/icons/emoji/unicode/1f41b.png">🐛</g-emoji>',
              description: "Something isn't working",
              __typename: 'Label',
            },
            cursor: 'Mg',
          },
          {
            node: {
              id: 'LA_kwAPAg',
              color: 'c64345',
              name: 'documentation :memo:',
              nameHTML:
                'documentation <g-emoji class="g-emoji" alias="memo" fallback-src="/images/icons/emoji/unicode/1f4dd.png">📝</g-emoji>',
              description: 'Improvements or additions to documentation',
              __typename: 'Label',
            },
            cursor: 'Mw',
          },
          {
            node: {
              id: 'LA_kwAPBA',
              color: 'e81086',
              name: 'enhancement :clock1:',
              nameHTML:
                'enhancement <g-emoji class="g-emoji" alias="clock1" fallback-src="/images/icons/emoji/unicode/1f550.png">🕐</g-emoji>',
              description: 'New feature or request',
              __typename: 'Label',
            },
            cursor: 'NA',
          },
          {
            node: {
              id: 'LA_kwAPBQ',
              color: 'f29c24',
              name: 'fun size 🍫',
              nameHTML:
                'fun size <g-emoji class="g-emoji" alias="chocolate_bar" fallback-src="/images/icons/emoji/unicode/1f36b.png">🍫</g-emoji>',
              description: 'Extra attention is needed',
              __typename: 'Label',
            },
            cursor: 'NQ',
          },
          {
            node: {
              id: 'LA_kwAPBg',
              color: '7057ff',
              name: 'good first issue :mountain:',
              nameHTML:
                'good first issue <g-emoji class="g-emoji" alias="mountain" fallback-src="/images/icons/emoji/unicode/26f0.png">⛰️</g-emoji>',
              description: 'Good for newcomers',
              __typename: 'Label',
            },
            cursor: 'Ng',
          },
          {
            node: {
              id: 'LA_kwAPBw',
              color: 'f9b8d8',
              name: ':open_mouth: question',
              nameHTML:
                '<g-emoji class="g-emoji" alias="open_mouth" fallback-src="/images/icons/emoji/unicode/1f62e.png">😮</g-emoji> question',
              description: 'Further information is requested',
              __typename: 'Label',
            },
            cursor: 'Nw',
          },
          {
            node: {
              id: 'LA_kwAPCA',
              color: '5891ce',
              name: '🚒 wontfix',
              nameHTML:
                '<g-emoji class="g-emoji" alias="fire_engine" fallback-src="/images/icons/emoji/unicode/1f692.png">🚒</g-emoji> wontfix',
              description: 'This will not be worked on',
              __typename: 'Label',
            },
            cursor: 'OA',
          },
          {
            node: {
              id: 'LA_kwAPIQ',
              color: 'd73a4a',
              name: 'bug',
              nameHTML: 'bug',
              description: "Something isn't working",
              __typename: 'Label',
            },
            cursor: 'OQ',
          },
          {
            node: {
              id: 'LA_kwAPIg',
              color: '0075ca',
              name: 'documentation',
              nameHTML: 'documentation',
              description: 'Improvements or additions to documentation',
              __typename: 'Label',
            },
            cursor: 'MTA',
          },
          {
            node: {
              id: 'LA_kwAPIw',
              color: 'cfd3d7',
              name: 'duplicate',
              nameHTML: 'duplicate',
              description: 'This issue or pull request already exists',
              __typename: 'Label',
            },
            cursor: 'MTE',
          },
          {
            node: {
              id: 'LA_kwAPJA',
              color: 'a2eeef',
              name: 'enhancement',
              nameHTML: 'enhancement',
              description: 'New feature or request',
              __typename: 'Label',
            },
            cursor: 'MTI',
          },
          {
            node: {
              id: 'LA_kwAPJQ',
              color: '7057ff',
              name: 'good first issue',
              nameHTML: 'good first issue',
              description: 'Good for newcomers',
              __typename: 'Label',
            },
            cursor: 'MTM',
          },
          {
            node: {
              id: 'LA_kwAPJg',
              color: '008672',
              name: 'help wanted',
              nameHTML: 'help wanted',
              description: 'Extra attention is needed',
              __typename: 'Label',
            },
            cursor: 'MTQ',
          },
          {
            node: {
              id: 'LA_kwAPJw',
              color: 'e4e669',
              name: 'invalid',
              nameHTML: 'invalid',
              description: "This doesn't seem right",
              __typename: 'Label',
            },
            cursor: 'MTU',
          },
          {
            node: {
              id: 'LA_kwAPKA',
              color: 'd876e3',
              name: 'question',
              nameHTML: 'question',
              description: 'Further information is requested',
              __typename: 'Label',
            },
            cursor: 'MTY',
          },
          {
            node: {
              id: 'LA_kwAPKQ',
              color: 'ffffff',
              name: 'wontfix',
              nameHTML: 'wontfix',
              description: 'This will not be worked on',
              __typename: 'Label',
            },
            cursor: 'MTc',
          },
        ],
        totalCount: 17,
        pageInfo: {endCursor: 'MTc', hasNextPage: false},
      },
      id: 'R_kgAP',
    },
  },
}

export const getItemsBlockMilestoneSuggestionsResponse = {
  data: {
    repository: {
      milestones: {
        edges: [
          {
            node: {id: 'MI_kwAPAQ', title: 'Open milestone', closed: false, __typename: 'Milestone'},
            cursor: 'Y3Vyc29yOnYyOpEB',
          },
          {
            node: {id: 'MI_kwAPAg', title: 'Closed milestone', closed: true, __typename: 'Milestone'},
            cursor: 'Y3Vyc29yOnYyOpEC',
          },
        ],
        totalCount: 2,
        pageInfo: {endCursor: 'Y3Vyc29yOnYyOpEC', hasNextPage: false},
      },
      id: 'R_kgAP',
    },
  },
}

export const getItemsBlockIssueTypeSuggestionsResponse = {
  data: {
    repository: {
      issueTypes: {
        edges: [
          {node: {id: 'IT_kwAEAQ', name: 'Epic', isEnabled: true, __typename: 'IssueType'}, cursor: 'MQ'},
          {node: {id: 'IT_kwAEAg', name: 'Feature', isEnabled: true, __typename: 'IssueType'}, cursor: 'Mg'},
          {node: {id: 'IT_kwAEAw', name: 'Task', isEnabled: true, __typename: 'IssueType'}, cursor: 'Mw'},
          {node: {id: 'IT_kwAEBA', name: 'Bug', isEnabled: true, __typename: 'IssueType'}, cursor: 'NA'},
          {node: {id: 'IT_kwAEBQ', name: '🐹 for mice', isEnabled: true, __typename: 'IssueType'}, cursor: 'NQ'},
          {
            node: {id: 'IT_kwAEBg', name: '🌋 amazing new feature', isEnabled: true, __typename: 'IssueType'},
            cursor: 'Ng',
          },
        ],
        totalCount: 6,
        pageInfo: {endCursor: 'Ng', hasNextPage: false},
      },
      id: 'R_kgAP',
    },
  },
}

export const getRepositoryPickerTopRepositoriesResponse = {
  data: {
    viewer: {
      topRepositories: {
        edges: [
          {
            node: {
              id: 'MDEwOlJlcG9zaXRvcnkyMjEyMzg3MTA=',
              databaseId: 221238710,
              name: 'memex',
              nameWithOwner: 'github/memex',
              owner: {
                id: 'a87ff679a2f3e71d9181a67b7542122c',
                __typename: 'Organization',
                login: 'github',
              },
              isPrivate: true,
              isArchived: false,
              slashCommandsEnabled: true,
              viewerIssueCreationPermissions: {
                labelable: true,
                milestoneable: true,
                assignable: true,
                triageable: true,
                typeable: true,
              },
              hasIssuesEnabled: true,
              planFeatures: {
                maximumAssignees: 10,
              },
            },
          },
        ],
      },
      id: 'U_kgAC',
    },
  },
}

export const getRepositoryPickerCurrentRepoResponse = {
  data: {
    repository: {
      id: 'MDEwOlJlcG9zaXRvcnkyMjEyMzg3MTA=',
      databaseId: 221238710,
      name: 'memex',
      nameWithOwner: 'github/memex',
      owner: {
        id: 'a87ff679a2f3e71d9181a67b7542122c',
        __typename: 'Organization',
        login: 'github',
      },
      isPrivate: true,
      isArchived: false,
      slashCommandsEnabled: true,
      viewerIssueCreationPermissions: {
        labelable: true,
        milestoneable: true,
        assignable: true,
        triageable: true,
        typeable: true,
      },
      hasIssuesEnabled: true,
      planFeatures: {
        maximumAssignees: 10,
      },
    },
  },
}

export const getIssuePickerSearchResponse = {
  data: {
    commenters: {
      nodes: [],
    },
    mentions: {
      nodes: [],
    },
    assignee: {
      nodes: [],
    },
    author: {
      nodes: [
        {
          __typename: 'Issue',
          id: 'I_kwARTg',
          title: 'Parent One',
          closed: false,
          state: 'OPEN',
          databaseId: 1,
          stateReason: null,
          repository: {
            nameWithOwner: 'github/memex',
          },
          number: 10,
          __isNode: 'Issue',
        },
        {
          __typename: 'Issue',
          id: 'I_kwARS2',
          title: 'Parent Three',
          closed: true,
          state: 'CLOSED',
          databaseId: 3,
          repository: {
            nameWithOwner: 'github/memex',
          },
          stateReason: 'NOT_PLANNED',
          number: 12,
          __isNode: 'Issue',
        },
      ],
    },
    open: {
      nodes: [
        {
          __typename: 'Issue',
          id: 'I_kwARSw',
          title: 'Parent Two',
          closed: false,
          state: 'OPEN',
          databaseId: 2,
          repository: {
            nameWithOwner: 'github/memex',
          },
          stateReason: null,
          number: 11,
          __isNode: 'Issue',
        },
      ],
    },
  },
}

export const deleteProjectV2WorkflowByNumberResponse = {
  data: {
    deleteProjectV2WorkflowByNumber: {
      deletedWorkflowId: 'PVT_1234',
    },
  },
}

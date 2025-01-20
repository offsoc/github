export const MemexBaseRefreshEvents = {
  MemexProjectColumnCreate: 'github.memex.v1.MemexProjectColumnCreate',
  MemexProjectColumnUpdate: 'github.memex.v1.MemexProjectColumnUpdate',
  MemexProjectColumnDestroy: 'github.memex.v1.MemexProjectColumnDestroy',
  MemexProjectEvent: 'github.memex.v0.MemexProjectEvent',
  MemexProjectViewCreate: 'github.memex.v0.MemexProjectViewCreate',
  MemexProjectViewUpdate: 'github.memex.v0.MemexProjectViewUpdate',
  MemexProjectViewDestroy: 'github.memex.v0.MemexProjectViewDestroy',
} as const

export const MemexItemRefreshEvents = {
  MemexProjectColumnValueCreate: 'github.memex.v0.MemexProjectColumnValueCreate',
  MemexProjectColumnValueDestroy: 'github.memex.v0.MemexProjectColumnValueDestroy',
  MemexProjectColumnValueUpdate: 'github.memex.v0.MemexProjectColumnValueUpdate',
  ProjectItemCreate: 'github.memex.v0.ProjectItemCreate',
  ProjectItemUpdate: 'github.memex.v0.ProjectItemUpdate',
  ProjectItemBulkUpdate: 'github.memex.v0.ProjectItemBulkUpdate',
  ProjectItemDestroy: 'github.memex.v0.ProjectItemDestroy',
  IssueUpdateAssignee: 'github.v1.IssueUpdateAssignee',
  IssueUpdateIssueType: 'github.v1.IssueUpdateIssueType',
  IssueUpdateLabel: 'github.v1.IssueUpdateLabel',
  LabelUpdate: 'github.v1.LabelUpdate',
}

export const MemexRefreshEvents = {
  ...MemexBaseRefreshEvents,
  ...MemexItemRefreshEvents,
} as const

export type MemexRefreshEvents = ObjectValues<typeof MemexRefreshEvents>

export const MemexPaginatedRefreshEvents = {
  ProjectItemDenormalizedToElasticsearch: 'memex_item_denormalized_to_elasticsearch',
} as const

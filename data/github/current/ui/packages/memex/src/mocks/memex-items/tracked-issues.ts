import {IssueState, IssueStateReason} from '../../client/api/common-contracts'
import type {ItemTrackedByParent, TrackedByItem} from '../../client/api/issues-graph/contracts'

export const OldBugTrackedItem: TrackedByItem = {
  key: {ownerId: 1, itemId: 2, primaryKey: {uuid: '1234-5678-9012-3456'}},
  title: 'old bug from a long time ago',
  url: 'https://github.com/github/github/issues/123',
  state: IssueState.Closed,
  repoName: 'github',
  repoId: 1,
  userName: 'github',
  number: 123,
  labels: [],
  assignees: [],
  stateReason: IssueStateReason.Completed,
  completion: {total: 10, completed: 3, percent: 30},
}

export const ComplexFeatureTrackedItem = {
  key: {ownerId: 1, itemId: 3, primaryKey: {uuid: '1234-5678-9012-3456'}},
  title: 'complex new feature',
  url: 'https://github.com/github/memex/issues/335',
  state: IssueState.Open,
  repoName: 'memex',
  repoId: 1,
  userName: 'github',
  number: 335,
  labels: [],
  assignees: [],
  completion: {total: 10, completed: 2, percent: 20},
}

export const StyleNitpickTrackedItem = {
  key: {ownerId: 1, itemId: 4, primaryKey: {uuid: '1234-5678-9012-3457'}},
  title: 'style nitpick',
  url: 'https://github.com/github/memex/issues/321',
  state: IssueState.Open,
  repoName: 'memex',
  repoId: 1,
  userName: 'github',
  number: 321,
  labels: [],
  assignees: [],
  stateReason: '',
  completion: {total: 10, completed: 9, percent: 90},
}

const ComplexItemTrackedByParent: ItemTrackedByParent = {
  uuid: '1234-5678-9012-3490',
  itemId: 1000,
  title: 'A closed issue that can be added',
  state: IssueState.Open,
  stateReason: IssueStateReason.NotPlanned,
  url: 'https://github.com/github/memex/issues/1000',
  displayNumber: 1000,
  repositoryId: 1,
  repositoryName: 'memex',
  ownerLogin: 'github',
  assignees: [],
  labels: [],
  position: 11,
  ownerId: 1,
  trackedByTitle: 'Tasks',
}

export const SimpleItemTrackedByParent: ItemTrackedByParent = {
  uuid: '1234-5678-9012-6543',
  itemId: 1001,
  title: 'I am an integration test fixture',
  state: IssueState.Closed,
  stateReason: IssueStateReason.Completed,
  url: 'https://github.com/github/memex/issues/1001',
  displayNumber: 1001,
  repositoryId: 1,
  repositoryName: 'memex',
  ownerLogin: 'github',
  assignees: [],
  labels: [],
  position: 12,
  ownerId: 1,
  trackedByTitle: 'Tasks',
}

export const TrackedByItems = [OldBugTrackedItem, ComplexFeatureTrackedItem, StyleNitpickTrackedItem]
export const TrackedByParent = [ComplexItemTrackedByParent, SimpleItemTrackedByParent]

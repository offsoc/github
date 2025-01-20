import {Factory} from 'fishery'

import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import {columnIdFactory} from './column-id-factory'
import {singleSelectOptionFactory} from './single-select-option-factory'

class SystemColumnFactory extends Factory<MemexColumn> {
  assignees() {
    return this.params({
      id: SystemColumnId.Assignees,
      name: 'Assignees',
      dataType: MemexColumnDataType.Assignees,
    })
  }

  labels() {
    return this.params({
      id: SystemColumnId.Labels,
      name: 'Labels',
      dataType: MemexColumnDataType.Labels,
    })
  }

  linkedPullRequests() {
    return this.params({
      id: SystemColumnId.LinkedPullRequests,
      name: 'Linked pull requests',
      dataType: MemexColumnDataType.LinkedPullRequests,
    })
  }

  milestone() {
    return this.params({
      id: SystemColumnId.Milestone,
      name: 'Milestone',
      dataType: MemexColumnDataType.Milestone,
    })
  }

  repository() {
    return this.params({
      id: SystemColumnId.Repository,
      name: 'Repository',
      dataType: MemexColumnDataType.Repository,
    })
  }

  reviewers() {
    return this.params({
      id: SystemColumnId.Reviewers,
      name: 'Reviewers',
      dataType: MemexColumnDataType.Reviewers,
    })
  }

  status({optionNames}: {optionNames: Array<string>}) {
    const options = optionNames.map(name => singleSelectOptionFactory.build({}, {transient: {name}}))
    return this.params({
      id: SystemColumnId.Status,
      name: 'Status',
      dataType: MemexColumnDataType.SingleSelect,
      settings: {
        options,
      },
    })
  }

  title() {
    return this.params({
      id: SystemColumnId.Title,
      name: 'Title',
      dataType: MemexColumnDataType.Title,
    })
  }

  tracks() {
    return this.params({
      id: SystemColumnId.Tracks,
      name: 'Tracks',
      dataType: MemexColumnDataType.Tracks,
    })
  }

  trackedBy() {
    return this.params({
      id: SystemColumnId.TrackedBy,
      name: 'Tracked by',
      dataType: MemexColumnDataType.TrackedBy,
    })
  }

  issueType() {
    return this.params({
      id: SystemColumnId.IssueType,
      name: 'Type',
      dataType: MemexColumnDataType.IssueType,
    })
  }

  parentIssue() {
    return this.params({
      id: SystemColumnId.ParentIssue,
      name: 'Parent issue',
      dataType: MemexColumnDataType.ParentIssue,
    })
  }
}

export const systemColumnFactory = SystemColumnFactory.define(() => ({
  id: SystemColumnId.Title,
  name: '',
  position: -1,
  dataType: MemexColumnDataType.Title,
  databaseId: columnIdFactory.build(),
  defaultColumn: true,
  userDefined: false,
}))

export function buildSystemColumns(props?: {statusColumnOptionNames?: Array<string>}) {
  return [
    systemColumnFactory.title().build(),
    systemColumnFactory.assignees().build(),
    systemColumnFactory
      .status({optionNames: props?.statusColumnOptionNames || ['Todo', 'In progress', 'Done']})
      .build(),
    systemColumnFactory.labels().build(),
    systemColumnFactory.linkedPullRequests().build(),
    systemColumnFactory.repository().build(),
    systemColumnFactory.reviewers().build(),
    systemColumnFactory.milestone().build(),
    systemColumnFactory.issueType().build(),
    systemColumnFactory.parentIssue().build(),
  ]
}

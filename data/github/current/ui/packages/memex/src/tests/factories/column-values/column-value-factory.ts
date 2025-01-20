import {Factory} from 'fishery'

import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../../../client/api/columns/contracts/memex-column'
import type {
  AssigneesColumnData,
  DateColumnData,
  DraftIssueTitleColumnData,
  IssueTitleColumnData,
  IssueTypeColumnData,
  IterationColumnData,
  LabelsColumnData,
  LinkedPullRequestsColumnData,
  MemexColumnData,
  MilestoneColumnData,
  NumberColumnData,
  ParentIssueColumnData,
  PullRequestTitleColumnData,
  RedactedItemTitleColumnData,
  RepositoryColumnData,
  ReviewersColumnData,
  SingleSelectColumnData,
  StatusColumnData,
  SubIssuesProgressColumnData,
  TextColumnData,
  TrackedByColumnData,
  TracksColumnData,
} from '../../../client/api/columns/contracts/storage'
import type {Progress} from '../../../client/api/columns/contracts/tracks'
import {
  type ExtendedRepository,
  IssueState,
  type IssueType,
  type LinkedPullRequest,
  type Milestone,
  type ParentIssue,
  PullRequestState,
  type Review,
  type SubIssuesProgress,
} from '../../../client/api/common-contracts'
import type {TrackedByItem} from '../../../client/api/issues-graph/contracts'
import {ItemType} from '../../../client/api/memex-items/item-type'
import {getAllIterationsForConfiguration} from '../../../client/helpers/iterations'
import {isNumber} from '../../../client/helpers/parsing'

class ColumnValueFactory extends Factory<MemexColumnData> {
  assignees(assigneeLogins: Array<string>) {
    const assigneesColumnValue: AssigneesColumnData = {
      memexProjectColumnId: SystemColumnId.Assignees,
      value: assigneeLogins.map((login, index) => ({
        id: index,
        global_relay_id: 'MDQ6VXN',
        login,
        name: login,
        avatarUrl: 'avatarUrl',
        isSpammy: false,
      })),
    }
    return this.params(assigneesColumnValue)
  }

  labels(labelNames: Array<string>) {
    const labelsColumnValue: LabelsColumnData = {
      memexProjectColumnId: SystemColumnId.Labels,
      value: labelNames.map((name, index) => ({id: index, name, color: 'ffffff', nameHtml: name, url: 'labelUrl'})),
    }
    return this.params(labelsColumnValue)
  }

  linkedPullRequests(linkedPullRequests: Array<LinkedPullRequest>) {
    const linkedPullRequestsColumnValue: LinkedPullRequestsColumnData = {
      memexProjectColumnId: SystemColumnId.LinkedPullRequests,
      value: linkedPullRequests,
    }
    return this.params(linkedPullRequestsColumnValue)
  }

  milestone(milestone: Milestone) {
    const milestoneColumnValue: MilestoneColumnData = {
      memexProjectColumnId: SystemColumnId.Milestone,
      value: milestone,
    }
    return this.params(milestoneColumnValue)
  }

  repository(repository: ExtendedRepository) {
    const milestoneColumnValue: RepositoryColumnData = {
      memexProjectColumnId: SystemColumnId.Repository,
      value: repository,
    }
    return this.params(milestoneColumnValue)
  }

  status(statusOptionName: string, columns: Array<MemexColumn>) {
    const statusColumn = columns.find(column => column.id === SystemColumnId.Status)
    const option = statusColumn?.settings?.options?.find(o => o.name === statusOptionName)
    if (!option) {
      throw Error(`Please provide a status column with an option with the name ${statusOptionName}`)
    }

    const statusColumnValue: StatusColumnData = {
      memexProjectColumnId: SystemColumnId.Status,
      value: {id: option.id},
    }
    return this.params(statusColumnValue)
  }

  singleSelect(statusOptionName: string, columnName: string, columns: Array<MemexColumn>) {
    const singleSelectColumn = columns.find(
      column => column.name === columnName && column.dataType === MemexColumnDataType.SingleSelect,
    )

    if (!singleSelectColumn) {
      throw Error(`Please provide a single-select column matching the name ${columnName}`)
    }

    const option = singleSelectColumn.settings?.options?.find(o => o.name === statusOptionName)
    if (!option) {
      throw Error(`Please provide a single-select column containing an option matching ${statusOptionName}`)
    }

    if (isNumber(singleSelectColumn.id)) {
      const singleSelectColumnValue: SingleSelectColumnData = {
        memexProjectColumnId: singleSelectColumn.id,
        value: {id: option.id},
      }
      return this.params(singleSelectColumnValue)
    } else {
      const statusColumnValue: StatusColumnData = {
        memexProjectColumnId: SystemColumnId.Status,
        value: {id: option.id},
      }
      return this.params(statusColumnValue)
    }
  }

  iteration(iterationTitle: string, columnName: string, columns: Array<MemexColumn>) {
    const iterationColumn = columns.find(
      column => column.name === columnName && column.dataType === MemexColumnDataType.Iteration,
    )

    if (!iterationColumn || !isNumber(iterationColumn.id)) {
      throw Error(`Please provide a iteration field matching the name ${columnName}`)
    }

    if (!iterationColumn.settings?.configuration) {
      throw Error(`No iteration configuration found for column ${columnName}`)
    }

    const allIterations = getAllIterationsForConfiguration(iterationColumn.settings?.configuration)

    const iteration = allIterations.find(o => o.title === iterationTitle)
    if (!iteration) {
      throw Error(`Please provide an iteration field with a title matching ${iterationTitle}`)
    }

    const iterationColumnValue: IterationColumnData = {
      memexProjectColumnId: iterationColumn.id,
      value: {id: iteration.id},
    }
    return this.params(iterationColumnValue)
  }

  reviewers(reviewers: Array<Review>) {
    const reviewersColumnValue: ReviewersColumnData = {
      memexProjectColumnId: SystemColumnId.Reviewers,
      value: reviewers,
    }
    return this.params(reviewersColumnValue)
  }

  tracks(progress: Progress) {
    const tracksColumnValue: TracksColumnData = {
      memexProjectColumnId: SystemColumnId.Tracks,
      value: progress,
    }
    return this.params(tracksColumnValue)
  }

  parentIssue(parentIssue: ParentIssue) {
    const parentIssueColumnValue: ParentIssueColumnData = {
      memexProjectColumnId: SystemColumnId.ParentIssue,
      value: parentIssue,
    }
    return this.params(parentIssueColumnValue)
  }

  subIssuesProgress(progress: SubIssuesProgress) {
    const subIssuesProgressColumnValue: SubIssuesProgressColumnData = {
      memexProjectColumnId: SystemColumnId.SubIssuesProgress,
      value: progress,
    }
    return this.params(subIssuesProgressColumnValue)
  }

  trackedBy(trackedByItems: Array<TrackedByItem>) {
    const trackedByColumnValue: TrackedByColumnData = {
      memexProjectColumnId: SystemColumnId.TrackedBy,
      value: trackedByItems,
    }
    return this.params(trackedByColumnValue)
  }

  issueType(issueType: IssueType) {
    const issueTypeColumnValue: IssueTypeColumnData = {
      memexProjectColumnId: SystemColumnId.IssueType,
      value: issueType,
    }
    return this.params(issueTypeColumnValue)
  }

  title(title: string, itemType: ItemType) {
    switch (itemType) {
      case ItemType.DraftIssue: {
        const titleColumnValue: DraftIssueTitleColumnData = {
          memexProjectColumnId: SystemColumnId.Title,
          value: {title: {raw: title, html: title}},
        }
        return this.params(titleColumnValue)
      }
      case ItemType.Issue: {
        const titleColumnValue: IssueTitleColumnData = {
          memexProjectColumnId: SystemColumnId.Title,
          value: {
            title: {raw: title, html: title},
            number: 1234,
            issueId: 123,
            state: IssueState.Open,
          },
        }
        return this.params(titleColumnValue)
      }
      case ItemType.PullRequest: {
        const titleColumnValue: PullRequestTitleColumnData = {
          memexProjectColumnId: SystemColumnId.Title,
          value: {
            title: {raw: title, html: title},
            number: 1234,
            issueId: 123,
            isDraft: false,
            state: PullRequestState.Open,
          },
        }
        return this.params(titleColumnValue)
      }
      case ItemType.RedactedItem: {
        const titleColumnValue: RedactedItemTitleColumnData = {
          memexProjectColumnId: SystemColumnId.Title,
          value: {
            title: "You don't have permission to access this item",
          },
        }
        return this.params(titleColumnValue)
      }
    }
  }

  text(value: string, columnName: string, columns: Array<MemexColumn>) {
    const column = columns.find(c => c.name === columnName)
    if (!column) {
      throw new Error(
        `Could not find column with name '${columnName}' among the provided columns: ${columns
          .map(c => c.name)
          .join(', ')}`,
      )
    }
    if (column.dataType !== 'text') {
      throw new Error(`Expected '${columnName}' column to have number type, but got '${column.dataType}' instead`)
    }

    const textColumnValue: TextColumnData = {
      memexProjectColumnId: column.databaseId,
      value: {raw: value, html: value},
    }
    return this.params(textColumnValue)
  }

  number(value: number, columnName: string, columns: Array<MemexColumn>) {
    const column = columns.find(c => c.name === columnName)
    if (!column) {
      throw new Error(
        `Could not find column with name '${columnName}' among the provided columns: ${columns
          .map(c => c.name)
          .join(', ')}`,
      )
    }
    if (column.dataType !== 'number') {
      throw new Error(`Expected '${columnName}' column to have number type, but got '${column.dataType}' instead`)
    }
    const numberColumnValue: NumberColumnData = {
      memexProjectColumnId: column.databaseId,
      value: {value},
    }
    return this.params(numberColumnValue)
  }

  date(value: string, columnName: string, columns: Array<MemexColumn>) {
    const column = columns.find(c => c.name === columnName)
    if (!column) {
      throw new Error(
        `Could not find column with name '${columnName}' among the provided columns: ${columns
          .map(c => c.name)
          .join(', ')}`,
      )
    }
    if (column.dataType !== 'date') {
      throw new Error(`Expected '${columnName}' column to have date type, but got '${column.dataType}' instead`)
    }
    const dateColumnValue: DateColumnData = {
      memexProjectColumnId: column.databaseId,
      value: {value},
    }
    return this.params(dateColumnValue)
  }
}

export const columnValueFactory = ColumnValueFactory.define(() => {
  return {
    memexProjectColumnId: SystemColumnId.Assignees,
    value: null,
  }
})

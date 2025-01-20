import type {ServerDateValue} from '../../client/api/columns/contracts/date'
import type {NumericValue} from '../../client/api/columns/contracts/number'
import type {EnrichedText} from '../../client/api/columns/contracts/text'
import type {
  ExtendedRepository,
  IAssignee,
  IssueType,
  Label,
  LinkedPullRequest,
  Milestone,
  Review,
} from '../../client/api/common-contracts'
import type {FilterSuggestionsResponse} from '../../client/api/memex/contracts'
import {assertNever} from '../../client/helpers/assert-never'
import {getSuggestableColumnsWithValues} from '../../client/hooks/use-search-filter-suggestions'
import type {ColumnModel} from '../../client/models/column-model'
import type {MemexItemModel} from '../../client/models/memex-item-model'
import {mockLinkedPullRequests} from '../data/pull-requests'
import {getReviewerTeam} from '../data/teams'
import {getReviewerUser} from '../data/users'
import type {MockDatabase} from '../in-memory-database/mock-database'

export function getUniqueFieldValues(
  items: Array<MemexItemModel>,
  columnModel: ColumnModel,
  db: MockDatabase,
): FilterSuggestionsResponse {
  const fieldType = columnModel.dataType
  const columnValuesMap = getSuggestableColumnsWithValues(items, columnModel)
  switch (fieldType) {
    case 'assignees': {
      const suggestions: Array<IAssignee> = []
      for (const key of columnValuesMap.keys()) {
        const suggestedAssignee = db.assignees.all().find(assignee => assignee.login === key)
        if (suggestedAssignee) {
          suggestions.push(suggestedAssignee)
        }
      }
      return suggestions
    }
    case 'date': {
      const suggestions: Array<ServerDateValue> = []
      for (const key of columnValuesMap.keys()) {
        suggestions.push({
          value: key,
        })
      }
      return suggestions
    }
    case 'issueType': {
      const suggestions: Array<IssueType> = []
      const allIssueTypes = Array.from(db.issueTypes.all().values()).reduce((acc, curr) => {
        return acc.concat(curr)
      }, [] as Array<IssueType>)
      for (const key of columnValuesMap.keys()) {
        const suggestedIssueType = allIssueTypes.find(issueType => issueType.name === key)
        if (suggestedIssueType) {
          suggestions.push(suggestedIssueType)
        }
      }
      return suggestions
    }
    case 'labels': {
      const suggestions: Array<Label> = []
      for (const key of columnValuesMap.keys()) {
        const suggestedLabel = db.labels.all().find(label => label.name === key)
        if (suggestedLabel) {
          suggestions.push(suggestedLabel)
        }
      }
      return suggestions
    }
    case 'milestone': {
      const suggestions: Array<Milestone> = []
      const allMilestones = Array.from(db.milestones.all().values()).reduce((acc, curr) => {
        return acc.concat(curr)
      }, [] as Array<Milestone>)
      for (const key of columnValuesMap.keys()) {
        const suggestedMilestone = allMilestones.find(milestone => milestone.title === key)
        if (suggestedMilestone) {
          suggestions.push(suggestedMilestone)
        }
      }
      return suggestions
    }
    case 'number': {
      const suggestions: Array<NumericValue> = []
      for (const key of columnValuesMap.keys()) {
        suggestions.push({
          value: Number(key),
        })
      }
      return suggestions
    }
    case 'repository': {
      const suggestions: Array<ExtendedRepository> = []
      for (const key of columnValuesMap.keys()) {
        const suggestedRepo = db.repositories.all().find(repo => repo.name === key)
        if (suggestedRepo) {
          suggestions.push(suggestedRepo)
        }
      }
      return suggestions
    }
    case 'text': {
      const suggestions: Array<EnrichedText> = []
      for (const key of columnValuesMap.keys()) {
        suggestions.push({
          html: key,
          raw: key,
        })
      }
      return suggestions
    }
    case 'linkedPullRequests': {
      const suggestions: Array<LinkedPullRequest> = []
      for (const key of columnValuesMap.keys()) {
        const linkedPR = mockLinkedPullRequests.find(pr => pr.number === Number(key))
        if (linkedPR) {
          suggestions.push(linkedPR)
        }
      }
      return suggestions
    }
    case 'reviewers': {
      const suggestions: Array<Review> = []
      for (const key of columnValuesMap.keys()) {
        let reviewer: Review['reviewer'] | undefined = undefined
        try {
          reviewer = getReviewerUser(key)
        } catch {
          /* do nothing */
        }
        if (!reviewer) {
          try {
            reviewer = getReviewerTeam(key)
          } catch {
            /* do nothing */
          }
        }
        if (reviewer) {
          suggestions.push({reviewer})
        }
      }
      return suggestions
    }
    case 'title': {
      // Unique field values are unsupported for title
      return []
    }
    case 'iteration':
    case 'singleSelect': {
      // We don't need to implement unique field values for these types,
      // because the possible values are defined by the column configuration,
      // and sent to the client.
      return []
    }
    case 'trackedBy':
    case 'tracks': {
      // These fields aren't supported in PWL
      return []
    }
    case 'parentIssue':
    case 'subIssuesProgress': {
      // Placeholder for future implementation to appease tsc
      return []
    }
    default: {
      assertNever(fieldType)
    }
  }
}

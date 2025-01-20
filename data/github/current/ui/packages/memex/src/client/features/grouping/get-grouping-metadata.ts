import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import type {ColumnData} from '../../api/columns/contracts/storage'
import type {IssueType} from '../../api/common-contracts'
import type {GroupMetadata} from '../../api/memex-items/paginated-views'
import {getEnabledFeatures} from '../../helpers/feature-flags'
import {getAllIterations} from '../../helpers/iterations'
import {
  asCustomDateValue,
  asCustomNumberValue,
  asCustomTextValue,
  asSingleSelectValue,
  formatISODateString,
  parseMillisecondsToDate,
} from '../../helpers/parsing'
import type {ColumnModel} from '../../models/column-model'
import {compareAssigneesInAscOrder} from './group-sorting'
import {createEmptyGroup} from './helpers'
import type {FieldGrouping, GroupingMetadataWithSource} from './types'

export function getAssigneesGroupingMetadata(
  columnData: ColumnData,
  useDistinctAssigneesGrouping: boolean,
): Array<GroupingMetadataWithSource> | undefined {
  const columnValue = columnData.Assignees
  if (!columnValue) {
    return
  }

  if (columnValue.length === 0) {
    return
  }

  const {memex_table_without_limits} = getEnabledFeatures()

  const sortedAssignees = columnValue.sort(compareAssigneesInAscOrder)
  if (useDistinctAssigneesGrouping || memex_table_without_limits) {
    return sortedAssignees.map(a => ({
      value: a.login,
      sourceObject: {
        dataType: MemexColumnDataType.Assignees,
        kind: 'group',
        value: [a],
      },
    }))
  }
  return [
    {
      value: sortedAssignees.map(a => a.login).join('_'),
      sourceObject: {
        dataType: MemexColumnDataType.Assignees,
        kind: 'group',
        value: sortedAssignees,
      },
    },
  ]
}

export function getDateGroupingMetadata(
  column: ColumnModel,
  columnData: ColumnData,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.Date) {
    return
  }

  const wrapper = columnData[column.id]
  const date = asCustomDateValue(wrapper)
  if (!date) {
    return
  }

  const value = formatISODateString(date.value)
  return [
    {
      value,
      sourceObject: {
        dataType: MemexColumnDataType.Date,
        kind: 'group',
        value: {date, columnId: column.id},
      },
    },
  ]
}

export function getIterationGroupingMetadata(
  column: ColumnModel,
  columnData: ColumnData,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.Iteration) {
    return
  }
  const columnValue = columnData[column.id]

  const singleSelectValue = asSingleSelectValue(columnValue)
  if (!singleSelectValue) {
    return
  }

  const iterations = getAllIterations(column)
  const iteration = iterations.find(o => o.id === singleSelectValue.id)
  if (!iteration) {
    return
  }

  return [
    {
      value: iteration.id,
      sourceObject: {
        dataType: MemexColumnDataType.Iteration,
        kind: 'group',
        value: {iteration, columnId: column.id},
      },
    },
  ]
}

export function getMilestoneGroupingMetadata(columnData: ColumnData): Array<GroupingMetadataWithSource> | undefined {
  const milestone = columnData.Milestone
  if (!milestone) {
    return
  }

  return [
    {
      value: milestone.title,
      sourceObject: {
        dataType: MemexColumnDataType.Milestone,
        kind: 'group',
        value: milestone,
      },
    },
  ]
}

export function getIssueTypeGroupingMetadata(columnData: ColumnData): Array<GroupingMetadataWithSource> | undefined {
  const issueType = columnData[SystemColumnId.IssueType]
  if (!issueType) {
    return
  }

  return [
    {
      value: issueType.name,
      sourceObject: {
        dataType: MemexColumnDataType.IssueType,
        kind: 'group',
        value: issueType,
      },
    },
  ]
}

export function getParentIssueGroupingMetadata(columnData: ColumnData): Array<GroupingMetadataWithSource> | undefined {
  const parentIssue = columnData[SystemColumnId.ParentIssue]
  if (!parentIssue) {
    return
  }

  return [
    {
      value: parentIssue.nwoReference,
      sourceObject: {
        dataType: MemexColumnDataType.ParentIssue,
        kind: 'group',
        value: parentIssue,
      },
    },
  ]
}

export function getNumberGroupingMetadata(
  column: ColumnModel,
  columnData: ColumnData,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.Number) {
    return
  }

  const columnValue = columnData[column.id]
  const numberValue = asCustomNumberValue(columnValue)
  if (!numberValue) {
    return
  }

  return [
    {
      value: `${numberValue.value}`,
      sourceObject: {
        dataType: MemexColumnDataType.Number,
        kind: 'group',
        value: {number: numberValue, columnId: column.id},
      },
    },
  ]
}

export function getRepositoryGroupingMetadata(columnData: ColumnData): Array<GroupingMetadataWithSource> | undefined {
  const repository = columnData.Repository

  if (!repository) {
    return
  }

  return [
    {
      value: repository.nameWithOwner,
      sourceObject: {
        dataType: MemexColumnDataType.Repository,
        kind: 'group',
        value: repository,
      },
    },
  ]
}

export function getSingleSelectGroupingMetadata(
  column: ColumnModel,
  columnData: ColumnData,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.SingleSelect) {
    return
  }

  const columnValue = columnData[column.id]

  const singleSelectValue = asSingleSelectValue(columnValue)
  if (!singleSelectValue) {
    return
  }

  const options = column.settings.options || []
  const option = options.find(o => o.id === singleSelectValue.id)
  if (!option) {
    return
  }

  return [
    {
      value: singleSelectValue.id,
      sourceObject: {
        dataType: MemexColumnDataType.SingleSelect,
        kind: 'group',
        value: {option, columnId: column.id},
      },
    },
  ]
}

export function getTextGroupingMetadata(
  column: ColumnModel,
  columnData: ColumnData,
): Array<GroupingMetadataWithSource> | undefined {
  if (column.dataType !== MemexColumnDataType.Text) {
    return
  }

  const columnValue = columnData[column.id]

  const textValue = asCustomTextValue(columnValue)
  if (!textValue) {
    return
  }

  return [
    {
      value: textValue.raw,
      sourceObject: {
        dataType: MemexColumnDataType.Text,
        kind: 'group',
        value: {text: textValue, columnId: column.id},
      },
    },
  ]
}

export function getLabelGroupingMetadata(columnData: ColumnData): Array<GroupingMetadataWithSource> | undefined {
  const labels = columnData.Labels

  if (!labels) {
    return
  }

  return labels.map(l => ({
    value: l.name,
    sourceObject: {
      dataType: MemexColumnDataType.Labels,
      kind: 'group',
      value: l,
    },
  }))
}

export function getTrackedByGroupingMetadata(columnData: ColumnData): Array<GroupingMetadataWithSource> | undefined {
  const trackedBy = columnData['Tracked by']

  if (!trackedBy) {
    return
  }

  if (trackedBy.length === 0) {
    return
  }

  return trackedBy.map(t => ({
    value: t.url,
    sourceObject: {
      dataType: MemexColumnDataType.TrackedBy,
      kind: 'group',
      value: t,
    },
  }))
}

export function getGroupingMetadataFromServerGroupValue(
  columnModel: ColumnModel,
  groupValue: string,
  groupMetadata?: GroupMetadata,
): FieldGrouping | undefined {
  if (groupValue === '_noValue') {
    return createEmptyGroup(columnModel)
  }
  switch (columnModel.dataType) {
    case MemexColumnDataType.LinkedPullRequests:
    case MemexColumnDataType.Reviewers:
    case MemexColumnDataType.Title:
    case MemexColumnDataType.TrackedBy:
    case MemexColumnDataType.Tracks: {
      //We have no current plan to support grouping by these types
      return undefined
    }
    case MemexColumnDataType.Assignees: {
      if (groupMetadata && 'login' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: [groupMetadata],
        }
      }
      return undefined
    }
    case MemexColumnDataType.Date: {
      // groupValue is a string representing milliseconds for the date and our metadata expects a DateValue
      const dateObject = parseMillisecondsToDate(groupValue)
      const date = asCustomDateValue({value: dateObject})
      if (!date) {
        return undefined
      }
      return {
        dataType: MemexColumnDataType.Date,
        kind: 'group',
        value: {date, columnId: columnModel.id},
      }
    }
    case MemexColumnDataType.Iteration: {
      if (groupMetadata && 'duration' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: {iteration: groupMetadata, columnId: columnModel.id},
        }
      }
      // groupValue is an iteration name and our metadata expects an iteration
      const allIterations = getAllIterations(columnModel)
      const iteration = allIterations.find(i => i.title === groupValue)

      if (!iteration) {
        return undefined
      }

      return {
        dataType: MemexColumnDataType.Iteration,
        kind: 'group',
        value: {iteration, columnId: columnModel.id},
      }
    }
    case MemexColumnDataType.Labels: {
      if (groupMetadata && 'url' in groupMetadata && 'color' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: groupMetadata,
        }
      }
      return undefined
    }
    case MemexColumnDataType.Milestone: {
      if (groupMetadata && 'url' in groupMetadata && 'title' in groupMetadata && 'repoNameWithOwner' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: groupMetadata,
        }
      }
      return undefined
    }
    case MemexColumnDataType.IssueType: {
      if (groupMetadata && 'name' in groupMetadata && 'id' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: groupMetadata as IssueType,
        }
      }
      return undefined
    }
    case MemexColumnDataType.ParentIssue: {
      if (groupMetadata && 'nwoReference' in groupMetadata && 'id' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: groupMetadata,
        }
      }
      return undefined
    }
    case MemexColumnDataType.Number: {
      // groupValue is a number value as a string and our metadata expects a NumberValue
      const number = asCustomNumberValue({value: Number(groupValue)})
      if (!number) {
        return undefined
      }
      return {
        dataType: MemexColumnDataType.Number,
        kind: 'group',
        value: {number, columnId: columnModel.id},
      }
    }
    case MemexColumnDataType.Repository: {
      if (groupMetadata && 'nameWithOwner' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: groupMetadata,
        }
      }
      return undefined
    }
    case MemexColumnDataType.SingleSelect: {
      if (groupMetadata && 'descriptionHtml' in groupMetadata) {
        return {
          dataType: columnModel.dataType,
          kind: 'group',
          value: {option: groupMetadata, columnId: columnModel.id},
        }
      }
      // groupValue is an option name and our metadata expects an option
      const options = columnModel.settings.options || []
      const option = options.find(o => o.name === groupValue)
      if (!option) {
        return undefined
      }

      return {
        dataType: MemexColumnDataType.SingleSelect,
        kind: 'group',
        value: {option, columnId: columnModel.id},
      }
    }
    case MemexColumnDataType.Text: {
      // groupValue is a string and our metadata expects an EnrichedText
      const text = asCustomTextValue({raw: groupValue, html: groupValue})
      if (!text) {
        return undefined
      }
      return {
        dataType: MemexColumnDataType.Text,
        kind: 'group',
        value: {text, columnId: columnModel.id},
      }
    }
  }
}

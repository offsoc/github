import type {ServerDateValue} from '../api/columns/contracts/date'
import type {IterationValue} from '../api/columns/contracts/iteration'
import {MemexColumnDataType, SystemColumnId} from '../api/columns/contracts/memex-column'
import type {NumericValue} from '../api/columns/contracts/number'
import type {PersistedOption, SingleSelectValue} from '../api/columns/contracts/single-select'
import type {ColumnData} from '../api/columns/contracts/storage'
import type {ColumnModel} from '../models/column-model'
import {Resources} from '../strings'
import {getAllIterations} from './iterations'
import {asCustomDateString} from './parsing'

function evaluateColumnValues(columnModel: ColumnModel, columnData: ColumnData): string | Array<string> | undefined {
  switch (columnModel.dataType) {
    case MemexColumnDataType.SingleSelect: {
      const selectedOptionId = (columnData[columnModel.id] as SingleSelectValue)?.id
      const optionIdByNameMap = getOptionIdByNameMap(columnModel.settings.options)
      const selectedOption = columnModel.settings.options?.find((option: PersistedOption) => {
        return option.id === selectedOptionId
      })
      const optionName = optionIdByNameMap.get(selectedOption?.id)

      if (optionName) {
        return [optionName]
      } else {
        return [`${Resources.noSuggestion} ${columnModel.name}`]
      }
    }
    case MemexColumnDataType.Milestone: {
      return columnData[SystemColumnId.Milestone]?.title
    }
    case MemexColumnDataType.IssueType: {
      return columnData[SystemColumnId.IssueType]?.name
    }
    case MemexColumnDataType.Repository: {
      return columnData[SystemColumnId.Repository]?.nameWithOwner
    }
    case MemexColumnDataType.Date: {
      const date = columnData[columnModel.id] as ServerDateValue
      return asCustomDateString(date)
    }
    case MemexColumnDataType.Number: {
      const number = columnData[columnModel.id] as NumericValue
      return number?.value.toString()
    }
    case MemexColumnDataType.Labels: {
      return columnData.Labels?.map(label => label.name)
    }
    case MemexColumnDataType.LinkedPullRequests: {
      return columnData[SystemColumnId.LinkedPullRequests]?.map(pr => pr.number.toString())
    }
    case MemexColumnDataType.Assignees: {
      return columnData[SystemColumnId.Assignees]?.map(assignee => assignee.login)
    }
    case MemexColumnDataType.Reviewers: {
      return columnData[SystemColumnId.Reviewers]?.map(review => review.reviewer.name)
    }
    case MemexColumnDataType.Iteration: {
      const selectedOptionId = (columnData[columnModel.id] as IterationValue)?.id
      const iterationOptions = getAllIterations(columnModel)
      const optionIdByNameMap = getOptionIdByNameMap(iterationOptions)
      const selectedOption = iterationOptions.find((option: IterationValue) => {
        return option.id === selectedOptionId
      })
      const optionName = optionIdByNameMap.get(selectedOption?.id)

      if (optionName) {
        return optionName
      } else {
        return `${Resources.noSuggestion} ${columnModel.name}`
      }
    }
    case MemexColumnDataType.ParentIssue: {
      return columnData[SystemColumnId.ParentIssue]?.title
    }
    default: {
      throw new Error(`${columnModel.dataType} column is not a supported chart data type`)
    }
  }
}

export default function getInsightsColumnValues(columnModel: ColumnModel, columnData: ColumnData) {
  const columnValues = evaluateColumnValues(columnModel, columnData)

  if (!columnValues || columnValues.length === 0) {
    return [`${Resources.noSuggestion} ${columnModel.name}`]
  }

  return Array.isArray(columnValues) ? columnValues : [columnValues]
}

/** Get a map of options ids to names that affixes a (n) to the name to account for options with the same name */
function getOptionIdByNameMap(options: Array<Partial<{name?: string; title?: string; id: string}>>) {
  const optionIdByNameMap = new Map<string | undefined, string | undefined>()
  const optionNameByCountMap = new Map<string | undefined, number>()

  for (const option of options) {
    const name = option.name || option.title
    // keep track of how many times we've seen this name
    if (optionNameByCountMap.get(name)) {
      optionNameByCountMap.set(name, (optionNameByCountMap.get(name) || 0) + 1)
    } else {
      optionNameByCountMap.set(name, 1)
    }

    const nameCount = optionNameByCountMap.get(name) || 0
    // ensure that each option has a unique name by affixing a (n) to the name when needed
    if (nameCount > 1) {
      optionIdByNameMap.set(option.id, `${name} (${nameCount - 1})`)
    } else {
      optionIdByNameMap.set(option.id, name)
    }
  }

  return optionIdByNameMap
}

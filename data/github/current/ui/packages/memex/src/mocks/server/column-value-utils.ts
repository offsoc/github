import type {RemoteUpdatePayload} from '../../client/api/columns/contracts/domain'
import {type MemexColumn, MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {NumericValue} from '../../client/api/columns/contracts/number'
import type {
  AssigneesColumnData,
  ColumnUpdateData,
  DateColumnData,
  DraftIssueTitleColumnData,
  IssueTitleColumnData,
  IssueTypeColumnData,
  IterationColumnData,
  LabelsColumnData,
  MemexColumnData,
  MilestoneColumnData,
  NumberColumnData,
  ParentIssueColumnData,
  PullRequestTitleColumnData,
  RedactedItemTitleColumnData,
  SingleSelectColumnData,
  TextColumnData,
  TrackedByColumnData,
  UpdateAssigneesColumnData,
  UpdateDateColumnData,
  UpdateIssueTypeColumnData,
  UpdateIterationColumnData,
  UpdateLabelsColumnData,
  UpdateMilestoneColumnData,
  UpdateNumberColumnData,
  UpdateParentIssueColumnData,
  UpdateSingleSelectColumnData,
  UpdateTextColumnData,
  UpdateTitleColumnData,
  UpdateTrackedByColumnData,
} from '../../client/api/columns/contracts/storage'
import type {IAssignee, IssueType, Label, Milestone, ParentIssue} from '../../client/api/common-contracts'
import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {TRACKED_BY_REGEX} from '../../client/helpers/tracked-by-formatter'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import type {TrackedByCollection} from '../in-memory-database/tracked-by'

/**
 * A limited interface representing the pieces of the LiveUpdatesController needed by updateColumnValue
 */
interface LiveUpdatesControllerInterface {
  queueSocketMessage: (args: {type: ObjectValues<typeof MemexRefreshEvents>}) => void
}

/**
 * Updates a column value for a memex item based on the column update data send to the `MockServer`
 * Builds an update data action to leverage type guards, and then based on those type guards,
 * calls an appropriate update function to change or add a column value.
 * @param item
 * @param updateData
 * @param columns
 * @param suggestedLabels
 * @param suggestedAssignees
 * @param suggestedMilestones
 */
export function updateColumnValue(
  item: MemexItem,
  updateData: ColumnUpdateData,
  columns: Array<MemexColumn>,
  suggestedLabels: Array<Label>,
  suggestedAssignees: Array<IAssignee>,
  suggestedMilestones: Array<Milestone>,
  suggestedIssueTypes: Array<IssueType>,
  parentIssues: Array<ParentIssue>,
  trackedByItems: TrackedByCollection,
  liveUpdateServer: LiveUpdatesControllerInterface,
) {
  const column = columns.find(col => col.id === updateData.memexProjectColumnId)
  if (!column) {
    throw new Error('Column not found')
  }
  const dataType = column.dataType

  let columnValue = item.memexProjectColumnValues.find(
    col => col.memexProjectColumnId === updateData.memexProjectColumnId,
  )
  if (!columnValue) {
    columnValue = {memexProjectColumnId: updateData.memexProjectColumnId} as MemexColumnData
    item.memexProjectColumnValues.push(columnValue)
  }
  if (columnValue.memexProjectColumnId === SystemColumnId.Repository) {
    // ignore repository updates
  }

  let shouldDeleteValue = false

  if (isColumnDataTitle(dataType, columnValue) && isUpdateColumnDataTitle(dataType, updateData)) {
    updateTitleData(columnValue, updateData)

    liveUpdateServer.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnValueUpdate,
    })

    return
  } else if (isColumnDataAssignees(dataType, columnValue) && isUpdateColumnDataAssignees(dataType, updateData)) {
    updateAssigneesData(columnValue, updateData, suggestedAssignees)

    liveUpdateServer.queueSocketMessage({
      type: MemexRefreshEvents.IssueUpdateAssignee,
    })

    return
  } else if (isColumnDataLabels(dataType, columnValue) && isUpdateColumnDataLabels(dataType, updateData)) {
    updateLabelsData(columnValue, updateData, suggestedLabels)

    liveUpdateServer.queueSocketMessage({
      type: MemexRefreshEvents.IssueUpdateLabel,
    })
    return
  } else if (isColumnDataMilestone(dataType, columnValue) && isUpdateColumnDataMilestone(dataType, updateData)) {
    shouldDeleteValue = updateMilestoneData(columnValue, updateData, suggestedMilestones)
  } else if (isColumnDataIssueType(dataType, columnValue) && isUpdateColumnDataIssueType(dataType, updateData)) {
    shouldDeleteValue = updateIssueTypeData(columnValue, updateData, suggestedIssueTypes)
  } else if (isColumnParentIssue(dataType, columnValue) && isUpdateColumnDataParentIssue(dataType, updateData)) {
    shouldDeleteValue = updateParentIssueData(columnValue, updateData, parentIssues)
  } else if (isColumnDataText(dataType, columnValue) && isUpdateColumnDataText(dataType, updateData)) {
    shouldDeleteValue = updateTextData(columnValue, updateData)
  } else if (isColumnDataNumber(dataType, columnValue) && isUpdateColumnDataNumber(dataType, updateData)) {
    shouldDeleteValue = updateNumberData(columnValue, updateData)
  } else if (isColumnDataDate(dataType, columnValue) && isUpdateColumnDataDate(dataType, updateData)) {
    updateDateData(columnValue, updateData)
  } else if (isColumnDataSingleSelect(dataType, columnValue) && isUpdateColumnDataSingleSelect(dataType, updateData)) {
    shouldDeleteValue = updateSingleSelectData(columnValue, updateData)
  } else if (isColumnDataIteration(dataType, columnValue) && isUpdateColumnDataIteration(dataType, updateData)) {
    shouldDeleteValue = updateIterationData(columnValue, updateData)
  } else if (isColumnDataTrackedBy(dataType, columnValue) && isUpdateColumnDataTrackedBy(dataType, updateData)) {
    shouldDeleteValue = updateTrackedByData(columnValue, updateData, trackedByItems)
  }

  if (shouldDeleteValue) {
    const columnValueIndex = item.memexProjectColumnValues.findIndex(
      col => col.memexProjectColumnId === updateData.memexProjectColumnId,
    )
    item.memexProjectColumnValues.splice(columnValueIndex, 1)

    liveUpdateServer.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnValueDestroy,
    })
  } else {
    liveUpdateServer.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnValueUpdate,
    })
  }
}

/**
 * These type guards will ensure we have the correct data action column types, based on a columns actual dataType
 *
 * These update functions will update the current column data for an item, based on its update data.
 * The types of the data are scoped to the specific type of the column
 *
 * If an update function returns true, it indicates that the value should be removed from the item's
 * memexProjectColumnValues array
 */

function isColumnDataTitle(dataType: MemexColumnDataType, columnData: ColumnData): columnData is TitleColumnData {
  return dataType === MemexColumnDataType.Title
}

function isUpdateColumnDataTitle(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateTitleColumnData {
  return dataType === MemexColumnDataType.Title
}

/** Emulate emoji rendering for a subset of the short codes supported on GitHub */
export function renderWithEmoji(input: string): string {
  return input
    .replace(
      ':cat:',
      '<g-emoji class="g-emoji" alias="cat" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f431.png">🐱</g-emoji>',
    )
    .replace(
      ':dog:',
      '<g-emoji class="g-emoji" alias="dog" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f436.png">🐶</g-emoji>',
    )
    .replace(
      ':octocat:',
      '<img class="emoji" title=":octocat:" alt=":octocat:" src="https://github.githubassets.com/images/icons/emoji/octocat.png" height="20" width="20" align="absmiddle">',
    )
    .replace(
      ':shipit:',
      '<img class="emoji" title=":shipit:" alt=":shipit:" src="https://github.githubassets.com/images/icons/emoji/shipit.png" height="20" width="20" align="absmiddle">',
    )
}

// based upon https://davidwells.io/snippets/regex-match-outer-double-quotes
const CodeFenceRegex = /`[^\\`]*(\\`[^\\`]*)*`/g

/** Emulate code block formatting for use in demos and dev environments */
export function formatCodeBlocks(input: string): string {
  let html = input
  let match: RegExpMatchArray | null

  while ((match = CodeFenceRegex.exec(html)) !== null) {
    const item = match[0]
    const index = CodeFenceRegex.lastIndex
    const start = index - item.length

    const newText = `<code>${item.substr(1, item.length - 2)}</code>`
    html = html.substr(0, start) + newText + html.substr(index)
  }

  return html
}

function updateTitleData(columnData: TitleColumnData, updateData: UpdateTitleColumnData) {
  const raw = updateData.value?.title ?? columnData.value?.title ?? ''
  if (typeof raw !== 'string') {
    return
  }

  if ('number' in columnData.value) {
    columnData.value = {
      ...columnData.value,
      title: {
        raw,
        html: formatCodeBlocks(raw),
      },
    }
    return
  }

  // emulate formatting for draft issues
  columnData.value = {
    ...columnData.value,
    title: {
      raw,
      html: renderWithEmoji(raw),
    },
  }
}

function isColumnDataAssignees(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is AssigneesColumnData {
  return dataType === MemexColumnDataType.Assignees
}

function isUpdateColumnDataAssignees(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateAssigneesColumnData {
  return dataType === MemexColumnDataType.Assignees
}

function updateAssigneesData(
  columnData: AssigneesColumnData,
  updateData: UpdateAssigneesColumnData,
  suggestedAssignees: Array<IAssignee>,
) {
  if (updateData.value == null) return
  columnData.value = updateData.value
    .map(id => not_typesafe_nonNullAssertion(suggestedAssignees.find(assignee => assignee.id === id)))
    .sort((assigneeA, assigneeB) => {
      const a = assigneeA.login
      const b = assigneeB.login
      return a.localeCompare(b)
    })
}

function isColumnDataLabels(dataType: MemexColumnDataType, columnData: ColumnData): columnData is LabelsColumnData {
  return dataType === MemexColumnDataType.Labels
}

function isUpdateColumnDataLabels(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateLabelsColumnData {
  return dataType === MemexColumnDataType.Labels
}

function updateLabelsData(
  columnData: LabelsColumnData,
  updateData: UpdateLabelsColumnData,
  suggestedLabels: Array<Label>,
) {
  if (updateData.value == null) return
  columnData.value = updateData.value
    .map(id => not_typesafe_nonNullAssertion(suggestedLabels.find(label => label.id === id)))
    .sort((labelA, labelB) => {
      const a = labelA.nameHtml
      const b = labelB.nameHtml
      return a.localeCompare(b)
    })
}

function isColumnDataMilestone(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is MilestoneColumnData {
  return dataType === MemexColumnDataType.Milestone
}

function isUpdateColumnDataMilestone(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateMilestoneColumnData {
  return dataType === MemexColumnDataType.Milestone
}

function updateMilestoneData(
  columnData: MilestoneColumnData,
  updateData: UpdateMilestoneColumnData,
  suggestedMilestones: Array<Milestone>,
): boolean {
  if (updateData.value === undefined) {
    return true
  }

  columnData.value = not_typesafe_nonNullAssertion(
    suggestedMilestones.find(milestone => milestone.id === updateData.value),
  )
  return false
}

function isColumnDataIssueType(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is IssueTypeColumnData {
  return dataType === MemexColumnDataType.IssueType
}

function isColumnParentIssue(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is ParentIssueColumnData {
  return dataType === MemexColumnDataType.ParentIssue
}

function isUpdateColumnDataParentIssue(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateParentIssueColumnData {
  return dataType === MemexColumnDataType.ParentIssue
}

function isUpdateColumnDataIssueType(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateIssueTypeColumnData {
  return dataType === MemexColumnDataType.IssueType
}

function updateIssueTypeData(
  columnData: IssueTypeColumnData,
  updateData: UpdateIssueTypeColumnData,
  suggestedIssueTypes: Array<IssueType>,
): boolean {
  if (updateData.value === undefined) {
    return true
  }

  columnData.value = not_typesafe_nonNullAssertion(
    suggestedIssueTypes.find(issueType => issueType.id === updateData.value),
  )
  return false
}

function updateParentIssueData(
  columnData: ParentIssueColumnData,
  updateData: UpdateParentIssueColumnData,
  parentIssues: Array<ParentIssue>,
): boolean {
  if (updateData.value === null) return true

  columnData.value = parentIssues.find(parentIssue => parentIssue.id === updateData.value) || null
  return false
}

function isColumnDataText(dataType: MemexColumnDataType, columnData: ColumnData): columnData is TextColumnData {
  return dataType === MemexColumnDataType.Text
}

function isUpdateColumnDataText(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateTextColumnData {
  return dataType === MemexColumnDataType.Text
}

function updateTextData(columnData: TextColumnData, updateData: UpdateTextColumnData) {
  if (updateData.value) {
    columnData.value = {
      raw: updateData.value,
      html: renderWithEmoji(updateData.value),
    }
    return false
  }

  return true
}

function isColumnDataNumber(dataType: MemexColumnDataType, columnData: ColumnData): columnData is NumberColumnData {
  return dataType === MemexColumnDataType.Number
}

function isUpdateColumnDataNumber(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateNumberColumnData {
  return dataType === MemexColumnDataType.Number
}

function updateNumberData(columnData: NumberColumnData, updateData: UpdateNumberColumnData): boolean {
  if (updateData.value == null) return false
  if (updateData.value === '') {
    return true
  }
  columnData.value = serverProcessedValueNumber(updateData.value)
  return false
}

function isColumnDataDate(dataType: MemexColumnDataType, columnData: ColumnData): columnData is DateColumnData {
  return dataType === MemexColumnDataType.Date
}

function isUpdateColumnDataDate(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateDateColumnData {
  return dataType === MemexColumnDataType.Date
}

function updateDateData(columnData: DateColumnData, updateData: UpdateDateColumnData) {
  if (updateData.value == null) return
  columnData.value = {value: updateData.value}
}

function isColumnDataSingleSelect(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is SingleSelectColumnData {
  return dataType === MemexColumnDataType.SingleSelect
}

function isUpdateColumnDataSingleSelect(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateSingleSelectColumnData {
  return dataType === MemexColumnDataType.SingleSelect
}

function updateSingleSelectData(columnData: SingleSelectColumnData, updateData: UpdateSingleSelectColumnData) {
  if (updateData.value == null) return false
  if (updateData.value === undefined) {
    return true
  }
  columnData.value = updateData.value !== '' ? {id: updateData.value} : null
  return false
}

function isColumnDataIteration(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is IterationColumnData {
  return dataType === MemexColumnDataType.Iteration
}

function isUpdateColumnDataIteration(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateIterationColumnData {
  return dataType === MemexColumnDataType.Iteration
}

function isColumnDataTrackedBy(
  dataType: MemexColumnDataType,
  columnData: ColumnData,
): columnData is TrackedByColumnData {
  return dataType === MemexColumnDataType.TrackedBy
}

function isUpdateColumnDataTrackedBy(
  dataType: MemexColumnDataType,
  updateData: RemoteUpdatePayload,
): updateData is UpdateTrackedByColumnData {
  return dataType === MemexColumnDataType.TrackedBy
}

function updateIterationData(columnData: IterationColumnData, updateData: UpdateIterationColumnData) {
  if (updateData.value == null) return false
  if (updateData.value === undefined) {
    return true
  }
  columnData.value = updateData.value !== '' ? {id: updateData.value} : null
  return false
}

function updateTrackedByData(
  columnData: TrackedByColumnData,
  updateData: UpdateTrackedByColumnData,
  database: TrackedByCollection,
) {
  if (updateData.value == null) return false
  if (updateData.value === undefined || updateData.value.length === 0) {
    return true
  }

  const newItems = new Array<TrackedByItem>()

  for (const str of updateData.value) {
    const tokens = str.match(TRACKED_BY_REGEX)
    if (tokens && tokens.length === 4) {
      const userName = not_typesafe_nonNullAssertion(tokens[1])
      const repoName = not_typesafe_nonNullAssertion(tokens[2])
      const number = Number(not_typesafe_nonNullAssertion(tokens[3]))

      const existingTrackedByItem = database.byShorthand({userName, repoName, number})
      if (existingTrackedByItem) {
        newItems.push(existingTrackedByItem)
        continue
      }

      const newItem = database.create({userName, repoName, number})
      newItems.push(newItem)
    }
  }

  columnData.value = newItems
  return false
}

function serverProcessedValueNumber(value: number): NumericValue {
  return {
    value,
  }
}

type TitleColumnData =
  | IssueTitleColumnData
  | PullRequestTitleColumnData
  | DraftIssueTitleColumnData
  | RedactedItemTitleColumnData

type ColumnData = MemexColumnData | TitleColumnData

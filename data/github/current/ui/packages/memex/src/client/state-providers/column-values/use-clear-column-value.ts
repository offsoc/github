import {useCallback} from 'react'
import type {Row} from 'react-table'

import {MemexColumnDataType, SystemColumnId} from '../../api/columns/contracts/memex-column'
import useToasts from '../../components/toasts/use-toasts'
import {assertNever} from '../../helpers/assert-never'
import {isNumber, parseColumnId} from '../../helpers/parsing'
import {useBulkUpdateItems} from '../../hooks/use-bulk-update-items'
import type {MemexItemModel} from '../../models/memex-item-model'
import {HistoryResources} from '../../strings'

export type ColumnInfo = {id: string; columnModel?: {dataType: MemexColumnDataType}}

/**
 * This hook provides a callback for clearing a particular column value from an
 * item.
 */
export function useClearColumnValue() {
  const {bulkUpdateSingleColumnValue: updateItems} = useBulkUpdateItems()

  const {addToast} = useToasts()

  const clearColumnValue = useCallback(
    async (column: ColumnInfo, rows: Array<Row<MemexItemModel>>): Promise<void> => {
      if (!column.columnModel) {
        // column is not associated with any data - ignore callback
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({type: 'error', message: 'You cannot delete this'})
        return
      }

      const models = rows.map(row => row.original)

      const {dataType} = column.columnModel
      const memexProjectColumnId = parseColumnId(column.id)

      switch (dataType) {
        case MemexColumnDataType.Assignees: {
          const payload = {
            columnValue: {
              dataType: MemexColumnDataType.Assignees,
              value: [],
            },
          }

          return updateItems(models, payload.columnValue, HistoryResources.delete)
        }
        case MemexColumnDataType.Labels: {
          const payload = {
            columnValue: {
              dataType: MemexColumnDataType.Labels,
              value: [],
            },
          }

          return updateItems(models, payload.columnValue, HistoryResources.delete)
        }
        case MemexColumnDataType.Milestone: {
          const payload = {
            columnValue: {
              dataType: MemexColumnDataType.Milestone,
              value: undefined,
            },
          }

          return updateItems(models, payload.columnValue, HistoryResources.delete)
        }
        case MemexColumnDataType.IssueType: {
          const payload = {
            columnValue: {
              dataType: MemexColumnDataType.IssueType,
              value: undefined,
            },
          }

          return updateItems(models, payload.columnValue, HistoryResources.delete)
        }
        case MemexColumnDataType.ParentIssue: {
          const payload = {
            columnValue: {
              dataType: MemexColumnDataType.ParentIssue,
              value: undefined,
            },
          }

          return updateItems(models, payload.columnValue, HistoryResources.delete)
        }
        case MemexColumnDataType.Text:
        case MemexColumnDataType.Number:
        case MemexColumnDataType.Date:
        case MemexColumnDataType.Iteration:
          if (isNumber(memexProjectColumnId)) {
            const payload = {
              columnValue: {
                dataType,
                memexProjectColumnId,
                value: undefined,
              },
            }

            return updateItems(models, payload.columnValue, HistoryResources.delete)
          }
          break
        case MemexColumnDataType.SingleSelect:
          if (memexProjectColumnId === SystemColumnId.Status || isNumber(memexProjectColumnId)) {
            const payload = {
              columnValue: {
                memexProjectColumnId,
                dataType,
                value: undefined,
              },
            }

            return updateItems(models, payload.columnValue, HistoryResources.delete)
          }
          break
        // These fields are considered either read-only or special cases, and
        // should not be left without content.
        case MemexColumnDataType.LinkedPullRequests:
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({type: 'error', message: 'Linked pull requests cannot be deleted'})
          break
        case MemexColumnDataType.Title:
        case MemexColumnDataType.Repository:
        case MemexColumnDataType.Reviewers:
        case MemexColumnDataType.Tracks:
        case MemexColumnDataType.TrackedBy:
        case MemexColumnDataType.SubIssuesProgress:
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: `${dataType.slice(0, 1).toUpperCase() + dataType.slice(1)} cannot be deleted`,
          })
          break
        default: {
          assertNever(dataType)
        }
      }
    },
    [updateItems, addToast],
  )

  return {clearColumnValue}
}

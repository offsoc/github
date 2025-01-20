import {useCallback} from 'react'

import {type PageView, RoadmapDateFieldNone} from '../api/view/contracts'
import {filterFalseyValues} from '../helpers/util'
import {getViewTypeFromViewTypeParam} from '../helpers/view-type'
import type {ColumnModel} from '../models/column-model'
import {useFindColumn} from '../state-providers/columns/use-find-column'
import {useFindColumnByDatabaseId} from '../state-providers/columns/use-find-column-by-database-id'
import type {LocalViewStateDeserialized} from './use-view-state-reducer/types'
/**
 *
 * A hook that returns a method for deserializing a {@link PageView} into a {@link LocalViewStateDeserialized}
 *
 * @returns The local view state, hydrated so that all databaseIds are transformed to objects
 */
export function useViewDeserializer() {
  const {findColumnByDatabaseId} = useFindColumnByDatabaseId()
  const {findColumn} = useFindColumn()

  return useCallback(
    function deserializeView(state: PageView): LocalViewStateDeserialized {
      const horizontalGroupByColumns = filterFalseyValues(
        state.groupBy.map(databaseId => {
          return findColumnByDatabaseId(databaseId)
        }),
      )

      const verticalGroupByColumns = filterFalseyValues(
        (state.verticalGroupBy || []).map(databaseId => {
          return findColumnByDatabaseId(databaseId)
        }),
      )

      if (verticalGroupByColumns.length === 0) {
        const statusColumn = findColumn('Status')
        if (statusColumn) verticalGroupByColumns.push(statusColumn)
      }

      const sortByColumnsAndDirections = filterFalseyValues(
        state.sortBy.map(([databaseId, direction]) => {
          const column = findColumnByDatabaseId(databaseId)
          if (!column || !direction) return
          return {
            column,
            direction,
          }
        }),
      )

      const sliceBy = state.sliceBy?.field
        ? {
            field: findColumnByDatabaseId(state.sliceBy.field),
            filter: state.sliceBy.filter ?? '',
          }
        : {
            field: undefined,
            filter: '',
          }

      let visibleFields: ReadonlyArray<ColumnModel>
      {
        const visibleFieldColumns = new Set(
          filterFalseyValues(
            state.visibleFields.map(databaseId => {
              return findColumnByDatabaseId(databaseId)
            }),
          ),
        )

        for (const sortByColumnAndDirection of sortByColumnsAndDirections) {
          visibleFieldColumns.add(sortByColumnAndDirection.column)
        }

        visibleFields = Array.from(visibleFieldColumns)
      }

      const sumFieldIds = state.aggregationSettings?.sum ?? []
      const sumFields = new Set(
        filterFalseyValues(
          sumFieldIds.map(databaseId => {
            return findColumnByDatabaseId(databaseId)
          }),
        ),
      )

      return {
        id: state.id,
        number: state.number,
        name: state.name,
        filter: state.filter ?? '',
        viewType: getViewTypeFromViewTypeParam(state.layout),
        horizontalGroupByColumns,
        verticalGroupByColumns,
        sortByColumnsAndDirections,
        visibleFields,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        aggregationSettings: {
          hideItemsCount: state.aggregationSettings?.hideItemsCount ?? false,
          sum: Array.from(sumFields),
        },
        layoutSettings: {
          ...state.layoutSettings,
          roadmap: state.layoutSettings.roadmap
            ? {
                ...state.layoutSettings.roadmap,
                markerFields: filterFalseyValues(
                  (state.layoutSettings.roadmap.markerFields ?? []).map(id => findColumnByDatabaseId(id)),
                ),
                dateFields: filterFalseyValues(
                  (state.layoutSettings.roadmap.dateFields ?? []).map(id =>
                    id === RoadmapDateFieldNone ? id : findColumnByDatabaseId(id),
                  ), // deserialize date columns
                ),
              }
            : undefined,
        },
        sliceBy,
        sliceValue: state.sliceValue,
      }
    },
    [findColumnByDatabaseId, findColumn],
  )
}

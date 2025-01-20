import {useCallback, useMemo} from 'react'

import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import {
  type ColumnWidths,
  type LayoutSettings,
  RoadmapDateFieldNone,
  type RoadmapLayoutSettings,
  ViewTypeParam,
} from '../api/view/contracts'
import {ROADMAP_TITLE_COLUMN_DEFAULT_WIDTH} from '../components/roadmap/constants'
import {getColumnWidthsForLayout} from '../helpers/column-widths'
import {not_typesafe_nonNullAssertion} from '../helpers/non-null-assertion'
import {applyNoneFallback, getZoomLevelFromSettingsOrDefault} from '../helpers/roadmap-helpers'
import {isDateColumnModel, isIterationColumnModel} from '../models/column-model/guards'
import {useColumnsStableContext} from '../state-providers/columns/use-columns-stable-context'

/**
 * Hook to gather reasonable default layout settings for a new roadmap view.
 * Used when switching from a different view type to a roadmap view.
 */
export function useDefaultLayoutSettingsForRoadmap() {
  const {allColumnsRef} = useColumnsStableContext()
  const titleColumn = allColumnsRef.current.find(col => col.dataType === MemexColumnDataType.Title)

  const getDefaultDates = useCallback((): Array<number | 'none'> => {
    const [dates, iterations] = allColumnsRef.current.reduce<Array<Array<number>>>(
      (acc, current) => {
        if (isDateColumnModel(current)) {
          not_typesafe_nonNullAssertion(acc[0]).push(current.databaseId)
        } else if (isIterationColumnModel(current)) {
          not_typesafe_nonNullAssertion(acc[1]).push(current.databaseId)
        }
        return acc
      },
      [[], []],
    )

    // If date fields are available, use the first two
    if (dates?.length) {
      return applyNoneFallback(dates)
    } else if (iterations?.length) {
      // If iteration fields are available, use the first iteration for start and end
      return [iterations[0] ?? RoadmapDateFieldNone, iterations[0] ?? RoadmapDateFieldNone]
    }
    return applyNoneFallback([])
  }, [allColumnsRef])

  const getRoadmapSettingsOrDefaults = useCallback(
    (layoutSettings: LayoutSettings, shouldStashChanges: boolean): RoadmapLayoutSettings => {
      const currentTitleColumnWidth =
        titleColumn && getColumnWidthsForLayout(ViewTypeParam.Roadmap, layoutSettings)[titleColumn.databaseId]
      const titleColumnWidth = titleColumn
        ? {
            // Use the current title column width if it is set, otherwise use the default title column width
            [titleColumn.databaseId]: currentTitleColumnWidth ?? ROADMAP_TITLE_COLUMN_DEFAULT_WIDTH,
          }
        : // If title column somehow doesn't exist, gracefully degrade to doing nothing
          {}
      const columnWidths: ColumnWidths = {
        ...(layoutSettings.roadmap?.columnWidths ?? {}),
        // We are spreading the title column separately here to ensure that the title column width
        // is always applied, even if there are other columns that have widths set.
        ...titleColumnWidth,
      }

      // Revert to default settings when switching from roadmap view into a different view type, assuming
      // we have never saved they layout as a roadmap. Without doing this, the view state becomes dirty
      // as we are tracking dateFields and zoomLevel. Column widths are not tracked in the view state, so
      // we can keep these around.
      if (shouldStashChanges) return {columnWidths}

      // If roadmap fields are already present, return the existing settings
      if (layoutSettings.roadmap?.dateFields || layoutSettings.roadmap?.zoomLevel) {
        return {...layoutSettings.roadmap, columnWidths}
      }

      return {
        dateFields: getDefaultDates(),
        zoomLevel: getZoomLevelFromSettingsOrDefault(layoutSettings),
        columnWidths,
      }
    },
    [getDefaultDates, titleColumn],
  )

  return useMemo(
    () => ({
      getRoadmapSettingsOrDefaults,
    }),
    [getRoadmapSettingsOrDefaults],
  )
}

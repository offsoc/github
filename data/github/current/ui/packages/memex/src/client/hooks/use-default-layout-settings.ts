import {useCallback, useMemo} from 'react'

import {type LayoutSettings, ViewTypeParam} from '../api/view/contracts'
import {isRoadmapLayoutSettingsWithDateColumns} from '../helpers/roadmap-helpers'
import type {BaseViewState, NormalizedPageView} from '../hooks/use-view-state-reducer/types'
import {useDefaultLayoutSettingsForRoadmap} from './use-default-layout-settings-for-roadmap'
import {useDefaultLayoutSettingsForTable} from './use-default-layout-settings-for-table'

/**
 * When user switches layout, call getDefaultLayoutSettingsForView to gather
 * default layoutSettings for the new layout.
 * Likewise, remove appended non-persisted settings when a user navigates away from the view.
 */

export function useDefaultLayoutSettings() {
  const {getRoadmapSettingsOrDefaults} = useDefaultLayoutSettingsForRoadmap()
  const {getTableSettingsOrDefaults} = useDefaultLayoutSettingsForTable()

  const getLayoutSettingsWithDefaults = useCallback(
    (layoutSettings: NormalizedPageView['layoutSettings'], shouldStashChanges = false) => {
      return {
        ...layoutSettings,
        roadmap: getRoadmapSettingsOrDefaults(layoutSettings, shouldStashChanges),
        table: getTableSettingsOrDefaults(layoutSettings),
      }
    },
    [getRoadmapSettingsOrDefaults, getTableSettingsOrDefaults],
  )

  const getNextLayoutSettings = useCallback(
    (nextViewType: ViewTypeParam, currentView: BaseViewState): LayoutSettings | undefined => {
      const currentViewType = currentView.localViewState.layout
      if (currentViewType === nextViewType) return undefined
      // Short circuit because layout settings only apply to roadmap view, currently
      if (currentViewType !== ViewTypeParam.Roadmap && nextViewType !== ViewTypeParam.Roadmap) return undefined

      // If we entered roadmap view without persisting, remove any appended settings that would dirty the view state
      const shouldStashChanges =
        currentViewType === ViewTypeParam.Roadmap &&
        !isRoadmapLayoutSettingsWithDateColumns(currentView.serverViewState.layoutSettings.roadmap) &&
        isRoadmapLayoutSettingsWithDateColumns(currentView.localViewState.layoutSettings.roadmap)

      return getLayoutSettingsWithDefaults(currentView.localViewState.layoutSettings, shouldStashChanges)
    },
    [getLayoutSettingsWithDefaults],
  )

  return useMemo(
    () => ({
      getNextLayoutSettings,
      getLayoutSettingsWithDefaults,
    }),
    [getNextLayoutSettings, getLayoutSettingsWithDefaults],
  )
}

import {memo, useCallback, useMemo} from 'react'

import {type SwitchLayout, SwitchLayoutName} from '../api/stats/contracts'
import type {CommandSpec, ItemSpec} from '../commands/command-tree'
import {useCommands} from '../commands/hook'
import {getViewTypeParamFromViewType, ViewType} from '../helpers/view-type'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useDefaultLayoutSettings} from '../hooks/use-default-layout-settings'
import {useProjectViewRouteMatch} from '../hooks/use-project-view-route-match'
import type {BaseViewState} from '../hooks/use-view-state-reducer/types'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {ViewTypeContext} from '../hooks/use-view-type'
import {useViews} from '../hooks/use-views'

export const ViewTypeProvider = memo<{
  children?: React.ReactNode
}>(function ViewTypeProvider({children}) {
  const {viewStateDispatch, currentView} = useViews()
  const {getNextLayoutSettings} = useDefaultLayoutSettings()
  const {postStats} = usePostStats()
  //#region ViewType
  // When consumers set view type, update state and update the URL.
  const setViewType = useCallback(
    (view: BaseViewState, viewType: ViewType, source: SwitchLayout['ui']) => {
      // Update state
      viewStateDispatch({
        type: ViewStateActionTypes.SetViewType,
        viewType,
        viewNumber: view.number,
        layoutSettings: getNextLayoutSettings(getViewTypeParamFromViewType(viewType), view),
      })

      // Post interaction to server for instrumentation.
      postStats({
        name: SwitchLayoutName,
        ui: source,
        context: viewType,
      })
    },
    [postStats, viewStateDispatch, getNextLayoutSettings],
  )
  const {isProjectViewRoute} = useProjectViewRouteMatch()
  //#endregion ViewType
  useCommands(() => {
    if (!isProjectViewRoute || !currentView) return null

    const viewTypeConfigs: {[Key in ViewType]: CommandSpec | null} = {
      [ViewType.Table]: [
        't',
        'Switch layout: Table',
        'view.table',
        () => setViewType(currentView, ViewType.Table, 'command palette'),
      ],
      [ViewType.Board]: [
        'b',
        'Switch layout: Board',
        'view.board',
        () => setViewType(currentView, ViewType.Board, 'command palette'),
      ],
      [ViewType.Roadmap]: [
        'r',
        'Switch layout: Roadmap',
        'view.roadmap',
        () => setViewType(currentView, ViewType.Roadmap, 'command palette'),
      ],
      [ViewType.List]: null,
    }

    const items: Array<ItemSpec> = Object.entries(viewTypeConfigs).reduce((acc: Array<ItemSpec>, [type, spec]) => {
      if (type !== currentView.localViewStateDeserialized.viewType && spec !== null) {
        acc.push(spec)
      }
      return acc
    }, [])

    return ['y', 'Switch layout...', items]
  }, [currentView, isProjectViewRoute, setViewType])

  return (
    <ViewTypeContext.Provider
      value={useMemo(() => {
        return {
          isViewTypeDirty: currentView?.isViewTypeDirty ?? false,
          setViewType,
          viewType: currentView?.localViewStateDeserialized.viewType ?? ViewType.Table,
        }
      }, [currentView?.isViewTypeDirty, currentView?.localViewStateDeserialized.viewType, setViewType])}
    >
      {children}
    </ViewTypeContext.Provider>
  )
})

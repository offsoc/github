import {GlobalCommands} from '@github-ui/ui-commands'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useConfirm} from '@primer/react'
import {useCallback, useMemo} from 'react'
import type {To} from 'react-router-dom'

import {omit} from '../../utils/omit'
import {SystemColumnId} from '../api/columns/contracts/memex-column'
import {
  CommandPaletteUI,
  KeyboardShortcut,
  type StatViewsCreateNew,
  type StatViewsDelete,
  type StatViewsDuplicate,
  type StatViewsOpen,
  type StatViewsRename,
  type StatViewsReset,
  type StatViewsSave,
  type StatViewsSaveAsNew,
  ViewsCreate,
  ViewsDelete,
  ViewsDuplicate,
  ViewsOpen,
  ViewsRename,
  ViewsReset,
  ViewsSave,
  ViewsSaveAsNew,
} from '../api/stats/contracts'
import {DefaultOmitPropertiesForView, type PageView, type ViewTypeParam} from '../api/view/contracts'
import type {ItemSpec} from '../commands/command-tree'
import {useCommands} from '../commands/hook'
import {getInitialState} from '../helpers/initial-state'
import {getViewTypeFromViewTypeParam, ViewType} from '../helpers/view-type'
import {ViewerPrivileges} from '../helpers/viewer-privileges'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useGetFieldIdsFromFilter, useLoadRequiredFieldsForViewsAndCurrentView} from '../hooks/use-load-required-fields'
import {useProjectViewRouteMatch} from '../hooks/use-project-view-route-match'
import {useCreateView, useDestroyView, useUpdateView, useUpdateViewWithoutSettingStates} from '../hooks/use-view-apis'
import {getPathDescriptor} from '../hooks/use-view-state-reducer/get-path-descriptor'
import {getViewDirtyStates} from '../hooks/use-view-state-reducer/get-view-dirty-states'
import {useViewStateReducer} from '../hooks/use-view-state-reducer/use-view-state-reducer'
import {ViewStateActionTypes} from '../hooks/use-view-state-reducer/view-state-action-types'
import {ViewContext} from '../hooks/use-views'
import {useNavigate} from '../router'
import {useProjectRouteParams} from '../router/use-project-route-params'
import {PROJECT_ROUTE, PROJECT_VIEW_ROUTE} from '../routes'
import {Resources} from '../strings'

export function ViewProvider({children}: {children: React.ReactNode}) {
  const navigate = useNavigate()

  const {
    projectLimits: {viewsLimit},
  } = getInitialState()
  const {postStats} = usePostStats()
  const {currentView, views, viewsMap, viewStateDispatch} = useViewStateReducer()
  const {hasWritePermissions} = ViewerPrivileges()

  const missingColumnIdsForCurrentView = useLoadRequiredFieldsForViewsAndCurrentView(views, currentView)

  const reorderView = useCallback(
    (viewNumber: number, prevViewNumber?: number) => {
      viewStateDispatch({
        type: ViewStateActionTypes.ReorderView,
        viewNumber,
        prevViewNumber,
      })
    },
    [viewStateDispatch],
  )

  const setCurrentViewNumber = useCallback(
    (viewNumber: number, stats?: Omit<StatViewsOpen, 'name'>) => {
      viewStateDispatch({
        type: ViewStateActionTypes.GoToViewNumber,
        viewNumber,
      })
      if (stats) {
        postStats({name: ViewsOpen, memexProjectViewNumber: viewNumber, ...stats})
      }
    },
    [postStats, viewStateDispatch],
  )

  const addViewToState = useCallback(
    (view: PageView) => {
      viewStateDispatch({
        type: ViewStateActionTypes.AddView,
        view,
      })
    },
    [viewStateDispatch],
  )

  const updateViewInState = useCallback(
    (view: PageView) => {
      viewStateDispatch({
        type: ViewStateActionTypes.UpdateView,
        view,
      })
    },
    [viewStateDispatch],
  )

  const deleteViewFromState = useCallback(
    (viewNumber: number) => {
      viewStateDispatch({
        type: ViewStateActionTypes.DeleteView,
        viewNumber,
      })
    },
    [viewStateDispatch],
  )

  const updateViewServerStates = useCallback(
    (viewStates: Array<PageView>) => {
      viewStateDispatch({
        type: ViewStateActionTypes.SetViewServerStates,
        viewStates,
      })
    },
    [viewStateDispatch],
  )

  const createView = useCreateView({
    setCurrentViewNumber,
    addView: addViewToState,
    updateView: updateViewInState,
    deleteView: deleteViewFromState,
  })

  const createNewDefaultView = useCallback(
    (overrides: Partial<{layout: ViewTypeParam}>, stats: Omit<StatViewsCreateNew, 'name' | 'context'>) => {
      // If we already have an in-progress request, don't create a new view
      if (createView.status.current.status === 'loading') {
        return
      }
      const creator = createView.perform({
        view: overrides,
      })
      postStats({
        name: ViewsCreate,
        memexProjectViewNumber: currentView?.number,
        context: overrides.layout ? getViewTypeFromViewTypeParam(overrides.layout) : ViewType.Table,
        ...stats,
      })
      return creator
    },
    [createView, currentView?.number, postStats],
  )

  const updateView = useUpdateView({
    setCurrentViewNumber,
    addView: addViewToState,
    updateView: updateViewInState,
    deleteView: deleteViewFromState,
  })

  const destroyView = useDestroyView({
    setCurrentViewNumber,
    addView: addViewToState,
    updateView: updateViewInState,
    deleteView: deleteViewFromState,
  })

  const updateViewWithoutSettingStates = useUpdateViewWithoutSettingStates()

  const resetViewState = useCallback(
    (viewNumber: number, stats?: Omit<StatViewsReset, 'name'>) => {
      viewStateDispatch({type: ViewStateActionTypes.ResetViewState, viewNumber})
      if (stats) {
        postStats({
          name: ViewsReset,
          memexProjectViewNumber: viewNumber,
          ...stats,
        })
      }
    },
    [postStats, viewStateDispatch],
  )

  const setViewNumberWithReset = useCallback(
    (viewNumber: number) => {
      if (currentView && currentView.isDeleted) {
        deleteViewFromState(currentView.number)
      } else if (currentView) {
        resetViewState(currentView.number)
      }

      setCurrentViewNumber(viewNumber)
    },
    [deleteViewFromState, resetViewState, setCurrentViewNumber, currentView],
  )

  const createViewWithReset = useCreateView({
    setCurrentViewNumber: setViewNumberWithReset,
    addView: addViewToState,
    updateView: updateViewInState,
    deleteView: deleteViewFromState,
  })

  //#region View name
  const renameView = useCallback(
    async (viewNumber: number, newName: string, stats: Omit<StatViewsRename, 'name'>) => {
      const view = viewsMap[viewNumber]
      if (!view || view.isDeleted) return

      if (newName !== view.name) {
        const params = omit(view.serverViewState, DefaultOmitPropertiesForView)
        await updateViewWithoutSettingStates.perform({
          viewNumber: view.number,
          view: {
            ...params,
            name: newName,
            filter: view.serverViewState.filter ?? '',
          },
        })
        postStats({
          name: ViewsRename,
          memexProjectViewNumber: viewNumber,
          ...stats,
        })

        if (updateViewWithoutSettingStates.status.current.status === 'succeeded') {
          viewStateDispatch({type: ViewStateActionTypes.SaveViewName, viewNumber, name: newName})
        }
      }
    },
    [viewsMap, updateViewWithoutSettingStates, viewStateDispatch, postStats],
  )
  //#endregion

  const saveCurrentViewState = useCallback(
    async (viewNumber: number, stats: Omit<StatViewsSave, 'name'>) => {
      const view = viewsMap[viewNumber]

      if (!view || view.isDeleted) return
      const updateViewReq = omit(view.localViewState, DefaultOmitPropertiesForView)

      const updater = updateView.perform({viewNumber, view: updateViewReq})
      postStats({name: ViewsSave, memexProjectViewNumber: viewNumber, ...stats})
      await updater
    },
    [viewsMap, updateView, postStats],
  )

  const duplicateCurrentViewState = useCallback(
    async (
      viewNumber: number,
      name: string | undefined,
      stats: Omit<StatViewsSaveAsNew, 'name'> | Omit<StatViewsDuplicate, 'name'>,
    ) => {
      const view = viewsMap[viewNumber]
      if (!view) throw new Error('No view found')
      if (Object.keys(viewsMap).length > viewsLimit) return
      const dirty = getViewDirtyStates(view)
      const duplicateViewReqBody = omit(view.localViewState, [...DefaultOmitPropertiesForView, 'name'])

      postStats(
        dirty.isViewStateDirty
          ? {name: ViewsSaveAsNew, memexProjectViewNumber: viewNumber, ...stats}
          : {name: ViewsDuplicate, memexProjectViewNumber: viewNumber, ...stats},
      )

      return createViewWithReset.perform({view: {...duplicateViewReqBody, name}})
    },
    [viewsMap, createViewWithReset, postStats, viewsLimit],
  )

  const confirm = useConfirm()

  const destroyCurrentView = useCallback(
    async (viewNumber: number, stats: Omit<StatViewsDelete, 'name'>, cb?: () => void) => {
      const shouldDestroy = await confirm({
        title: 'Delete view?',
        content: 'Are you sure you want to delete this view?',
        confirmButtonContent: 'Delete',
        confirmButtonType: 'danger',
      })
      const view = viewsMap[viewNumber]
      if (shouldDestroy) {
        if (view?.isDeleted) {
          deleteViewFromState(viewNumber)
          cb?.()
          return
        }
        await destroyView.perform({viewNumber})
        postStats({name: ViewsDelete, memexProjectViewNumber: viewNumber, ...stats})
      }
      cb?.()
    },
    [confirm, viewsMap, destroyView, postStats, deleteViewFromState],
  )

  const {isProjectViewRoute} = useProjectViewRouteMatch()

  const updateViewPriority = useCallback(
    async (
      viewNumber: number,
      previousViewId: number | string,
      previousViewNumber?: number,
      oldPreviousViewNumber?: number,
    ) => {
      const view = viewsMap[viewNumber]
      if (!view || view.isDeleted) return
      const params = omit(view.serverViewState, DefaultOmitPropertiesForView)

      // Optimistically update the view order in the local state
      reorderView(viewNumber, previousViewNumber)

      try {
        // The local state update we want to make has already been performed, so replacing
        // the local state with the server response is unnecessary and could cause any
        // unsaved changes to be lost (ref github/memex#6554).
        await updateViewWithoutSettingStates.perform({
          viewNumber,
          view: {
            ...params,
            previousMemexProjectViewId: previousViewId,
          },
        })
      } catch (e) {
        // if it fails, reorder again to previous state
        reorderView(viewNumber, oldPreviousViewNumber)
      }
    },
    [viewsMap, updateViewWithoutSettingStates, reorderView],
  )

  const trackingCurrentView = useTrackingRef(currentView)
  const saveCurrentView = useCallback(() => {
    const view = trackingCurrentView.current
    if (!view || !view.isViewStateDirty || view.isDeleted) return
    saveCurrentViewState(view.number, {ui: KeyboardShortcut})
  }, [saveCurrentViewState, trackingCurrentView])

  const projectRouteParams = useProjectRouteParams()

  useCommands(() => {
    if (!currentView) return null

    const commands: Array<ItemSpec> = []

    if (isProjectViewRoute && currentView.isViewStateDirty && !currentView.isDeleted) {
      if (hasWritePermissions) {
        commands.push([
          's',
          'Save view',
          'views_save',
          () => saveCurrentViewState(currentView.number, {ui: CommandPaletteUI}),
        ])
      }

      commands.push([
        'r',
        'Reset view',
        'views_reset',
        () => resetViewState(currentView.number, {ui: CommandPaletteUI}),
      ])
    }

    if (views.length > 1) {
      if (isProjectViewRoute && hasWritePermissions) {
        commands.push([
          'd',
          'Delete view',
          'views_delete',
          () => destroyCurrentView(currentView.number, {ui: CommandPaletteUI}),
        ])
      }

      commands.push([
        'g',
        'Go to view...',
        views.reduce<Array<ItemSpec>>((goToCommands, view, index) => {
          /**
           * If we're looking at a project view, don't add a command to
           * navigate to the current view
           */
          if (isProjectViewRoute && view.number === currentView.number) {
            return goToCommands
          }

          goToCommands.push([
            `${index}`,
            `Go to ${view.name}`,
            'views_change',
            () => {
              setCurrentViewNumber(view.number, {ui: CommandPaletteUI})
              /**
               * If we're not looking at a project view, don't add a command to
               * navigate to the project view, instead of just changing it
               */
              if (!isProjectViewRoute) {
                navigate(
                  PROJECT_VIEW_ROUTE.generatePath({
                    ...projectRouteParams,
                    viewNumber: view.number,
                  }),
                )
              }
            },
          ])
          return goToCommands
        }, []),
      ])
    }

    if (isProjectViewRoute && views.length < viewsLimit && hasWritePermissions) {
      commands.push(['n', 'New view', 'views_create', () => createNewDefaultView({}, {ui: CommandPaletteUI})])
      commands.push([
        'c',
        Resources.duplicateView({isDirty: currentView.isViewStateDirty}),
        'views_duplicate',
        () => duplicateCurrentViewState(currentView.number, undefined, {ui: CommandPaletteUI}),
      ])
    }

    if (commands.length === 0) return null

    return ['v', 'View options...', commands]
  }, [
    createNewDefaultView,
    currentView,
    destroyCurrentView,
    duplicateCurrentViewState,
    hasWritePermissions,
    isProjectViewRoute,
    navigate,
    resetViewState,
    saveCurrentViewState,
    setCurrentViewNumber,
    views,
    viewsLimit,
    projectRouteParams,
  ])

  const {getFieldIdsFromFilter} = useGetFieldIdsFromFilter()

  /**
   * Returns true if a grouping _or_ sorting is active _AND_ that is missing
   */
  const missingRequiredColumnData = useMemo(() => {
    if (!currentView) return true

    if (missingColumnIdsForCurrentView.length === 0) return false

    const fieldsRequiredForFilter = getFieldIdsFromFilter(currentView.localViewStateDeserialized.filter)

    const filterMissingFieldIsRequired = missingColumnIdsForCurrentView.some(field => {
      return fieldsRequiredForFilter.has(field)
    })

    const groupByMissingFieldIsRequired = Boolean(
      missingColumnIdsForCurrentView.find(missingColumnId => {
        return currentView.localViewStateDeserialized.horizontalGroupByColumns.some(
          groupByColumn => groupByColumn.id === missingColumnId,
        )
      }),
    )

    const verticalGroupByMissingFieldIsRequired = Boolean(
      missingColumnIdsForCurrentView.find(missingColumnId => {
        return currentView.localViewStateDeserialized.verticalGroupByColumns.some(
          groupByColumn => groupByColumn.id === missingColumnId && groupByColumn.id !== SystemColumnId.Status,
        )
      }),
    )

    const sortByMissingFieldIsRequired = Boolean(
      missingColumnIdsForCurrentView.find(missingColumnId => {
        return currentView.localViewStateDeserialized.sortByColumnsAndDirections.some(
          sortByColumn => sortByColumn.column.id === missingColumnId,
        )
      }),
    )

    return (
      filterMissingFieldIsRequired ||
      groupByMissingFieldIsRequired ||
      sortByMissingFieldIsRequired ||
      verticalGroupByMissingFieldIsRequired
    )
  }, [currentView, getFieldIdsFromFilter, missingColumnIdsForCurrentView])

  const returnToViewLinkTo: To = useMemo(() => {
    if (currentView) {
      return getPathDescriptor(currentView, projectRouteParams)
    }
    return PROJECT_ROUTE.generatePath(projectRouteParams)
  }, [currentView, projectRouteParams])

  return (
    <ViewContext.Provider
      value={useMemo(() => {
        return {
          views,
          viewsMap,
          viewStateDispatch,
          createView,
          currentView,
          duplicateCurrentViewState,
          setCurrentViewNumber,
          updateView,
          updateViewPriority,
          saveCurrentViewState,
          destroyView,
          isViewStateDirty: currentView?.isViewStateDirty ?? false,
          resetViewState,
          createNewDefaultView,
          destroyCurrentView,
          renameView,
          missingRequiredColumnData,
          returnToViewLinkTo,
          updateViewServerStates,
        }
      }, [
        createNewDefaultView,
        createView,
        currentView,
        destroyCurrentView,
        destroyView,
        duplicateCurrentViewState,
        renameView,
        resetViewState,
        saveCurrentViewState,
        setCurrentViewNumber,
        updateView,
        updateViewPriority,
        viewStateDispatch,
        views,
        viewsMap,
        missingRequiredColumnData,
        returnToViewLinkTo,
        updateViewServerStates,
      ])}
    >
      <GlobalCommands
        commands={{
          'projects:save-view':
            isProjectViewRoute && hasWritePermissions && !currentView?.isDeleted && currentView?.isViewStateDirty
              ? saveCurrentView
              : undefined,
        }}
      />
      {children}
    </ViewContext.Provider>
  )
}

import isEqual from 'lodash-es/isEqual'

import {omit} from '../../../utils/omit'
import {
  type FieldOperation,
  getDefaultAggregationSettings,
  type LayoutSettings,
  sliceValue,
} from '../../api/view/contracts'
import {assertNever} from '../../helpers/assert-never'
import {
  applyColumnWidthsToView,
  canViewTypeParamHaveColumnWidths,
  getColumnWidthsForLayout,
} from '../../helpers/column-widths'
import {replaceEqualDeep} from '../../helpers/replace-equal-deep'
import {getViewTypeParamFromViewType} from '../../helpers/view-type'
import type {BaseViewsState, NormalizedPageView} from './types'
import {type ViewStateActions, ViewStateActionTypes} from './view-state-action-types'

const groupedByReducer = (currentGroupBy: NormalizedPageView['groupBy'], action: ViewStateActions) => {
  switch (action.type) {
    case ViewStateActionTypes.RemoveField: {
      const groupedBy = new Set(currentGroupBy)

      if (!groupedBy.has(action.column.databaseId)) return currentGroupBy

      groupedBy.delete(action.column.databaseId)
      return Array.from(groupedBy)
    }

    default:
      return currentGroupBy
  }
}

const sortedByReducer = (currentSortedBy: NormalizedPageView['sortBy'], action: ViewStateActions) => {
  switch (action.type) {
    case ViewStateActionTypes.RemoveField:
    case ViewStateActionTypes.HideField: {
      const index = currentSortedBy.findIndex(([databaseId]) => databaseId !== action.column.databaseId)

      if (index === -1) return currentSortedBy

      return currentSortedBy.filter(([databaseId]) => databaseId !== action.column.databaseId)
    }

    default:
      return currentSortedBy
  }
}

const visibleFieldsReducer = (currentVisibleFields: NormalizedPageView['visibleFields'], action: ViewStateActions) => {
  switch (action.type) {
    case ViewStateActionTypes.ShowField: {
      const visibleFieldSet = new Set(currentVisibleFields)
      if (visibleFieldSet.has(action.column.databaseId)) return currentVisibleFields
      visibleFieldSet.add(action.column.databaseId)

      return Array.from(visibleFieldSet)
    }
    case ViewStateActionTypes.RemoveField:
    case ViewStateActionTypes.HideField: {
      const visibleFieldSet = new Set(currentVisibleFields)
      if (!visibleFieldSet.has(action.column.databaseId)) return currentVisibleFields
      visibleFieldSet.delete(action.column.databaseId)

      return Array.from(visibleFieldSet)
    }
    case ViewStateActionTypes.MoveField: {
      const currentPosition = currentVisibleFields.findIndex(id => id === action.column.databaseId)

      if (currentPosition === action.newPosition) return currentVisibleFields

      const nextVisibleFields = [...currentVisibleFields]

      if (currentPosition !== -1) {
        nextVisibleFields.splice(currentPosition, 1)
      }

      nextVisibleFields.splice(action.newPosition, 0, action.column.databaseId)

      return nextVisibleFields
    }

    case ViewStateActionTypes.AddField: {
      const nextVisibleFields = new Set(currentVisibleFields)
      if (nextVisibleFields.has(action.column.databaseId)) return currentVisibleFields

      nextVisibleFields.add(action.column.databaseId)

      return Array.from(nextVisibleFields)
    }

    default: {
      return currentVisibleFields
    }
  }
}

const removeFieldAggregations = (
  aggregationFieldIds: Array<number>,
  fieldOperation: FieldOperation,
  fieldDatabaseId: number,
) => {
  const aggregationFieldIdsSet = new Set(aggregationFieldIds)
  if (!aggregationFieldIdsSet.has(fieldDatabaseId)) return aggregationFieldIds
  aggregationFieldIdsSet.delete(fieldDatabaseId)

  return Array.from(aggregationFieldIdsSet)
}

const aggregationSettingsReducer = (
  currentAggregationSettings: NormalizedPageView['aggregationSettings'],
  action: ViewStateActions,
) => {
  switch (action.type) {
    case ViewStateActionTypes.ToggleItemsCount: {
      return {
        ...currentAggregationSettings,
        hideItemsCount: !currentAggregationSettings?.hideItemsCount,
      }
    }
    case ViewStateActionTypes.RemoveField: {
      if (!currentAggregationSettings) return currentAggregationSettings

      const {hideItemsCount, ...fieldAggregations} = currentAggregationSettings
      for (const key of Object.keys(fieldAggregations)) {
        const fieldOperation = key as FieldOperation
        fieldAggregations[fieldOperation] = removeFieldAggregations(
          fieldAggregations[fieldOperation] ?? [],
          fieldOperation,
          action.column.databaseId,
        )
      }

      return {
        hideItemsCount,
        ...fieldAggregations,
      }
    }
    case ViewStateActionTypes.RemoveFieldAggregation: {
      const aggregationFieldIds = currentAggregationSettings?.[action.fieldOperation] ?? []
      return {
        ...currentAggregationSettings,
        [action.fieldOperation]: removeFieldAggregations(
          aggregationFieldIds,
          action.fieldOperation,
          action.column.databaseId,
        ),
      }
    }
    case ViewStateActionTypes.AddFieldAggregation: {
      const aggregationFieldIds = currentAggregationSettings?.[action.fieldOperation] ?? []
      const aggregationFieldIdsSet = new Set(aggregationFieldIds)
      if (aggregationFieldIdsSet.has(action.column.databaseId)) return currentAggregationSettings

      aggregationFieldIdsSet.add(action.column.databaseId)

      return {
        ...currentAggregationSettings,
        [action.fieldOperation]: Array.from(aggregationFieldIdsSet),
      }
    }

    default: {
      return currentAggregationSettings
    }
  }
}

const boardLayoutSettingsReducer = (
  boardLayoutSettings: NormalizedPageView['layoutSettings']['board'],
  action: ViewStateActions,
) => {
  switch (action.type) {
    case ViewStateActionTypes.UpdateBoardColumnLimit: {
      if (boardLayoutSettings?.columnLimits?.[action.columnDatabaseId]?.[action.optionId] === action.limit) {
        return boardLayoutSettings
      }
      return {
        ...boardLayoutSettings,
        columnLimits: {
          ...boardLayoutSettings?.columnLimits,
          [action.columnDatabaseId]: {
            ...boardLayoutSettings?.columnLimits?.[action.columnDatabaseId],
            [action.optionId]: action.limit,
          },
        },
      }
    }
    default: {
      return boardLayoutSettings
    }
  }
}

const layoutSettingsReducer = (
  currentLayoutSettings: NormalizedPageView['layoutSettings'],
  action: ViewStateActions,
): LayoutSettings => {
  switch (action.type) {
    case ViewStateActionTypes.ToggleRoadmapMarkerFields: {
      const currentMarkerFields = new Set(currentLayoutSettings['roadmap']?.markerFields)
      const nextMarkerFields = new Set(currentMarkerFields)
      if (nextMarkerFields.has(action.field.databaseId)) {
        nextMarkerFields.delete(action.field.databaseId)
      } else {
        nextMarkerFields.add(action.field.databaseId)
      }
      if (nextMarkerFields.size === currentMarkerFields.size) {
        return currentLayoutSettings
      }
      return {
        ...currentLayoutSettings,
        roadmap: {
          ...currentLayoutSettings['roadmap'],
          markerFields: [...nextMarkerFields],
        },
      }
    }
    case ViewStateActionTypes.SetRoadmapDateFields: {
      return {
        ...currentLayoutSettings,
        roadmap: {
          ...currentLayoutSettings['roadmap'],
          dateFields: action.dateFields.map(field => (field === 'none' ? 'none' : field.databaseId)),
        },
      }
    }
    case ViewStateActionTypes.SetRoadmapZoomLevel: {
      return {
        ...currentLayoutSettings,
        roadmap: {
          ...currentLayoutSettings['roadmap'],
          zoomLevel: action.zoomLevel,
        },
      }
    }
    case ViewStateActionTypes.UpdateBoardColumnLimit: {
      const next = boardLayoutSettingsReducer(currentLayoutSettings.board, action)
      if (next === currentLayoutSettings.board) return currentLayoutSettings
      return {
        ...currentLayoutSettings,
        board: boardLayoutSettingsReducer(currentLayoutSettings.board, action),
      }
    }
    case ViewStateActionTypes.SetColumnWidths: {
      return {
        ...currentLayoutSettings,
        [action.viewType]: {
          ...currentLayoutSettings[action.viewType],
          columnWidths: {...action.columnWidths},
        },
      }
    }

    default: {
      return currentLayoutSettings
    }
  }
}

/** The reducer function to update the state associated with a specific view */
const viewStateReducer = (viewState: NormalizedPageView, action: ViewStateActions): NormalizedPageView => {
  switch (action.type) {
    case ViewStateActionTypes.SetFilter: {
      if (viewState.filter === action.filter) return viewState
      return {
        ...viewState,
        filter: action.filter,
      }
    }
    case ViewStateActionTypes.SetHorizontalGroupedBy: {
      const nextGroupBy = [action.column.databaseId]
      if (isEqual(nextGroupBy, viewState.groupBy)) return viewState
      return {
        ...viewState,
        groupBy: nextGroupBy,
      }
    }
    case ViewStateActionTypes.SetVerticalGroupedBy: {
      const nextVerticalGroupBy = [action.column.databaseId]
      if (isEqual(nextVerticalGroupBy, viewState.verticalGroupBy)) return viewState
      return {
        ...viewState,
        verticalGroupBy: nextVerticalGroupBy,
      }
    }
    case ViewStateActionTypes.SetSortedBy: {
      if (isEqual(action.sorts, viewState.sortBy)) return viewState
      return {
        ...viewState,
        sortBy: action.sorts.map(({column, direction}) => [column.databaseId, direction]),
      }
    }
    case ViewStateActionTypes.ClearHorizontalGroupedBy: {
      if (viewState.groupBy.length === 0) return viewState
      return {
        ...viewState,
        groupBy: [],
      }
    }
    case ViewStateActionTypes.SetSliceBy: {
      return {
        ...viewState,
        sliceBy: {
          field: action.column.databaseId,
          filter: '',
          panelWidth: viewState.sliceBy?.panelWidth,
        },
      }
    }
    case ViewStateActionTypes.ClearSliceBy: {
      if (!viewState.sliceBy?.field && !viewState.sliceBy?.filter) return viewState

      return {
        ...viewState,
        sliceBy: {},
      }
    }
    case ViewStateActionTypes.SetSliceValue: {
      return {
        ...viewState,
        sliceValue: action.value,
      }
    }
    case ViewStateActionTypes.SetSliceByFilter: {
      return {
        ...viewState,
        sliceBy: {
          ...viewState.sliceBy,
          filter: action.filter ?? '',
        },
      }
    }
    case ViewStateActionTypes.SetSliceByPanelWidth: {
      return {
        ...viewState,
        sliceBy: {
          ...viewState.sliceBy,
          panelWidth: action.panelWidth,
        },
      }
    }
    case ViewStateActionTypes.SetViewType: {
      return {
        ...viewState,
        layout: getViewTypeParamFromViewType(action.viewType),
        layoutSettings: {
          ...(action.layoutSettings ? action.layoutSettings : viewState.layoutSettings),
        },
      }
    }
    case ViewStateActionTypes.ShowField: {
      return {
        ...viewState,
        visibleFields: visibleFieldsReducer(viewState.visibleFields, action),
      }
    }
    case ViewStateActionTypes.HideField: {
      const visibleFieldSet = new Set(viewState.visibleFields)
      if (!visibleFieldSet.has(action.column.databaseId)) return viewState
      visibleFieldSet.delete(action.column.databaseId)

      return {
        ...viewState,
        visibleFields: visibleFieldsReducer(viewState.visibleFields, action),
        groupBy: groupedByReducer(viewState.groupBy, action),
        sortBy: sortedByReducer(viewState.sortBy, action),
      }
    }
    case ViewStateActionTypes.ToggleField: {
      const visibleFieldSet = new Set(viewState.visibleFields)

      if (visibleFieldSet.has(action.column.databaseId)) {
        return viewStateReducer(viewState, {
          type: ViewStateActionTypes.HideField,
          column: action.column,
          viewNumber: action.viewNumber,
        })
      } else {
        return viewStateReducer(viewState, {
          type: ViewStateActionTypes.ShowField,
          column: action.column,
          viewNumber: action.viewNumber,
          position: action.position,
        })
      }
    }
    case ViewStateActionTypes.MoveField: {
      return {
        ...viewState,
        visibleFields: visibleFieldsReducer(viewState.visibleFields, action),
      }
    }
    case ViewStateActionTypes.SaveViewName: {
      if (viewState.name === action.name) return viewState
      return {
        ...viewState,
        name: action.name,
      }
    }
    case ViewStateActionTypes.AddField: {
      return {
        ...viewState,
        visibleFields: visibleFieldsReducer(viewState.visibleFields, action),
      }
    }
    case ViewStateActionTypes.RemoveField: {
      // TODO: remove any aggregations that use this field
      return {
        ...viewState,
        visibleFields: visibleFieldsReducer(viewState.visibleFields, action),
        groupBy: groupedByReducer(viewState.groupBy, action),
        sortBy: sortedByReducer(viewState.sortBy, action),
      }
    }
    case ViewStateActionTypes.UpdateView: {
      const nextView = {
        ...action.view,
        filter: action.view.filter ?? '',
        aggregationSettings: action.view.aggregationSettings ?? getDefaultAggregationSettings(),
      }
      if (isEqual(nextView, viewState)) return viewState
      return nextView
    }
    case ViewStateActionTypes.ToggleItemsCount:
    case ViewStateActionTypes.AddFieldAggregation:
    case ViewStateActionTypes.RemoveFieldAggregation: {
      const nextAggregationSettings = aggregationSettingsReducer(viewState.aggregationSettings, action)
      if (isEqual(nextAggregationSettings, viewState.aggregationSettings)) return viewState
      return {
        ...viewState,
        aggregationSettings: aggregationSettingsReducer(viewState.aggregationSettings, action),
      }
    }
    case ViewStateActionTypes.UpdateBoardColumnLimit:
    case ViewStateActionTypes.SetColumnWidths:
    case ViewStateActionTypes.ToggleRoadmapMarkerFields:
    case ViewStateActionTypes.SetRoadmapDateFields:
    case ViewStateActionTypes.SetRoadmapZoomLevel: {
      const nextLayoutSettings = layoutSettingsReducer(viewState.layoutSettings, action)
      if (isEqual(nextLayoutSettings, viewState.layoutSettings)) return viewState
      return {
        ...viewState,
        layoutSettings: nextLayoutSettings,
      }
    }
    default: {
      return viewState
    }
  }
}

/** The reducer function to update the state associated with the current view */
const viewReducer = (
  currentView: BaseViewsState['views'][number],
  action: ViewStateActions,
): BaseViewsState['views'][number] => {
  switch (action.type) {
    case ViewStateActionTypes.MoveField:
    case ViewStateActionTypes.ToggleField:
    case ViewStateActionTypes.HideField:
    case ViewStateActionTypes.ShowField:
    case ViewStateActionTypes.SetViewType:
    case ViewStateActionTypes.SetSortedBy:
    case ViewStateActionTypes.SetHorizontalGroupedBy:
    case ViewStateActionTypes.ClearHorizontalGroupedBy:
    case ViewStateActionTypes.SetVerticalGroupedBy:
    case ViewStateActionTypes.SetFilter:
    case ViewStateActionTypes.ToggleItemsCount:
    case ViewStateActionTypes.AddFieldAggregation:
    case ViewStateActionTypes.RemoveFieldAggregation:
    case ViewStateActionTypes.SetRoadmapDateFields:
    case ViewStateActionTypes.ToggleRoadmapMarkerFields:
    case ViewStateActionTypes.SetRoadmapZoomLevel:
    case ViewStateActionTypes.SetSliceBy:
    case ViewStateActionTypes.ClearSliceBy:
    case ViewStateActionTypes.SetSliceValue:
    case ViewStateActionTypes.SetSliceByFilter:
    case ViewStateActionTypes.SetSliceByPanelWidth:
    case ViewStateActionTypes.SetColumnWidths: {
      const nextLocalViewState = viewStateReducer(currentView.localViewState, action)
      if (isEqual(nextLocalViewState, currentView.localViewState)) return currentView
      return {
        ...currentView,
        localViewState: nextLocalViewState,
      }
    }
    case ViewStateActionTypes.UpdateBoardColumnLimit: {
      return {
        ...currentView,
        localViewState: viewStateReducer(currentView.localViewState, action),
        serverViewState: viewStateReducer(currentView.serverViewState, action),
      }
    }
    case ViewStateActionTypes.ResetViewState: {
      const nextViewState = {
        id: currentView.serverViewState.id,
        name: currentView.serverViewState.name,
        number: currentView.serverViewState.number,
        serverViewState: currentView.serverViewState,
        localViewState: currentView.serverViewState,
      }
      // Maintain the transient, selected sliceValue if slicing and the field hasn't changed
      if (
        currentView.localViewState.sliceBy?.field &&
        currentView.localViewState.sliceBy.field === currentView.serverViewState.sliceBy?.field
      ) {
        nextViewState.localViewState.sliceValue = currentView.localViewState.sliceValue
      }
      if (isEqual(nextViewState, currentView)) return currentView
      return nextViewState
    }

    case ViewStateActionTypes.RemoveField:
    case ViewStateActionTypes.UpdateView:
    case ViewStateActionTypes.AddField: {
      return {
        id: currentView.serverViewState.id,
        name: currentView.serverViewState.name,
        number: currentView.serverViewState.number,
        serverViewState: viewStateReducer(currentView.serverViewState, action),
        localViewState: viewStateReducer(currentView.localViewState, action),
      }
    }
    case ViewStateActionTypes.SaveViewName: {
      return {
        id: currentView.serverViewState.id,
        name: action.name,
        number: currentView.serverViewState.number,
        serverViewState: viewStateReducer(currentView.serverViewState, action),
        localViewState: viewStateReducer(currentView.localViewState, action),
      }
    }

    case ViewStateActionTypes.SetLocalViewState: {
      if (isEqual(action.localViewState, currentView.localViewState)) return currentView
      return {
        ...currentView,
        localViewState: action.localViewState,
      }
    }

    default: {
      return currentView
    }
  }
}

/** The reducer function to update the set of current views for the project */
const viewsReducer = (currentViews: BaseViewsState['views'], action: ViewStateActions): BaseViewsState['views'] => {
  switch (action.type) {
    case ViewStateActionTypes.SetViewServerStates: {
      const nextViewStates: BaseViewsState['views'] = Object.fromEntries(
        action.viewStates.map(incomingViewState => {
          const newState = {
            ...incomingViewState,
            filter: incomingViewState.filter ?? '',
            aggregationSettings: incomingViewState.aggregationSettings ?? getDefaultAggregationSettings(),
          }

          let nextLocalViewState: NormalizedPageView
          const currentViewState = currentViews[incomingViewState.number]
          /**
           * If the view wasn't in the store, OR the view state wasn't dirty (ignoring any selected sliceValue),
           * update the view directly.
           *
           * if the view state was dirty, maintain it
           */
          if (
            !currentViewState ||
            isEqual(
              omit(currentViewState.localViewState, [sliceValue]),
              omit(currentViewState.serverViewState, [sliceValue]),
            )
          ) {
            nextLocalViewState = newState
            if (
              currentViewState?.localViewState.sliceBy?.field &&
              currentViewState.localViewState.sliceBy.field === nextLocalViewState.sliceBy?.field
            ) {
              // Maintain the transient, selected sliceValue (it exists in state and visible as a URL param)
              nextLocalViewState.sliceValue = currentViewState.localViewState.sliceValue
            }
          } else {
            const {layout} = newState
            // because column widths are persisted immediately and not included in dirty state, server state for column values should take precedence on live update
            if (currentViewState.localViewState.layout === layout && canViewTypeParamHaveColumnWidths(layout)) {
              const currentColumnWidths = getColumnWidthsForLayout(layout, newState.layoutSettings)
              nextLocalViewState =
                Object.keys(currentColumnWidths).length > 0
                  ? applyColumnWidthsToView(currentViewState.localViewState, layout, currentColumnWidths)
                  : currentViewState.localViewState
            } else {
              nextLocalViewState = currentViewState.localViewState
            }

            // There is an additional check for sliceBy as there are scenarios in which a user's local session storage
            // may not have a sliceBy field set at all causing the sliceBy field to be set to undefined in the localViewState
            const currentSliceByField = currentViewState.localViewState.sliceBy?.field
            if (
              currentSliceByField &&
              currentSliceByField === newState.sliceBy?.field &&
              nextLocalViewState.sliceBy &&
              newState.sliceBy.panelWidth
            ) {
              // The sliceBy panel width is persisted immediately and not included in dirty state,
              // server state for width should take precedence on live update if the slice field is the same
              nextLocalViewState.sliceBy.panelWidth = newState.sliceBy.panelWidth
            }
          }

          return [
            incomingViewState.number,
            {
              id: incomingViewState.id,
              number: incomingViewState.number,
              name: incomingViewState.name,
              localViewState: nextLocalViewState,
              serverViewState: newState,
            },
          ]
        }),
      )

      for (const view of Object.values(currentViews)) {
        if (!nextViewStates[view.number]) {
          nextViewStates[view.number] = {
            ...view,
            isDeleted: true,
          }
        }
      }

      return nextViewStates
    }
    case ViewStateActionTypes.UpdateView: {
      const view = currentViews[action.view.number]
      if (!view) return currentViews
      return {
        ...currentViews,
        [action.view.number]: viewReducer(view, action),
      }
    }
    case ViewStateActionTypes.AddField:
    case ViewStateActionTypes.SaveViewName:
    case ViewStateActionTypes.MoveField:
    case ViewStateActionTypes.ToggleField:
    case ViewStateActionTypes.HideField:
    case ViewStateActionTypes.ShowField:
    case ViewStateActionTypes.SetViewType:
    case ViewStateActionTypes.SetSortedBy:
    case ViewStateActionTypes.SetHorizontalGroupedBy:
    case ViewStateActionTypes.ClearHorizontalGroupedBy:
    case ViewStateActionTypes.SetVerticalGroupedBy:
    case ViewStateActionTypes.SetFilter:
    case ViewStateActionTypes.ResetViewState:
    case ViewStateActionTypes.ToggleItemsCount:
    case ViewStateActionTypes.AddFieldAggregation:
    case ViewStateActionTypes.RemoveFieldAggregation:
    case ViewStateActionTypes.SetRoadmapDateFields:
    case ViewStateActionTypes.ToggleRoadmapMarkerFields:
    case ViewStateActionTypes.SetRoadmapZoomLevel:
    case ViewStateActionTypes.SetSliceBy:
    case ViewStateActionTypes.ClearSliceBy:
    case ViewStateActionTypes.SetSliceValue:
    case ViewStateActionTypes.SetSliceByFilter:
    case ViewStateActionTypes.SetSliceByPanelWidth:
    case ViewStateActionTypes.SetColumnWidths:
    case ViewStateActionTypes.UpdateBoardColumnLimit: {
      const view = currentViews[action.viewNumber]
      if (!view) return currentViews

      const nextView = viewReducer(view, action)
      if (isEqual(nextView, view)) return currentViews
      return {
        ...currentViews,
        [action.viewNumber]: nextView,
      }
    }
    case ViewStateActionTypes.AddView: {
      const view: NormalizedPageView = {
        ...action.view,
        filter: action.view.filter ?? '',
        aggregationSettings: action.view.aggregationSettings ?? getDefaultAggregationSettings(),
      }

      return {
        ...currentViews,
        [action.view.number]: {
          id: view.id,
          name: view.name,
          number: view.number,
          serverViewState: view,
          localViewState: view,
        },
      }
    }
    case ViewStateActionTypes.RemoveField: {
      return Object.entries(currentViews).reduce<typeof currentViews>((acc, [viewNumber, view]) => {
        acc[Number(viewNumber)] = viewReducer(view, action)
        return acc
      }, {})
    }

    case ViewStateActionTypes.DeleteView: {
      const {[action.viewNumber]: _removedView, ...remainingViews} = currentViews

      return remainingViews
    }

    case ViewStateActionTypes.SetLocalViewState: {
      const currentView = currentViews[action.viewNumber]
      if (!currentView) return currentViews
      const nextViewState = viewReducer(currentView, action)
      if (isEqual(nextViewState, currentView)) return currentViews
      return {
        ...currentViews,
        [action.viewNumber]: nextViewState,
      }
    }
    case ViewStateActionTypes.SetViews: {
      return action.views
    }

    default: {
      return currentViews
    }
  }
}

/** The main reducer function for handling actions on the views state */
export const mainReducer = (state: BaseViewsState, action: ViewStateActions): BaseViewsState => {
  switch (action.type) {
    case ViewStateActionTypes.AddView: {
      return {
        ...state,
        views: viewsReducer(state.views, action),
        currentViewNumber: action.view.number,
        viewsOrder: [...(state.viewsOrder || []), action.view.number],
      }
    }
    case ViewStateActionTypes.SetViewServerStates: {
      const nextViews = viewsReducer(state.views, action)

      return {
        ...state,
        views: nextViews,
        viewsOrder: action.viewStates.map(view => view.number),
      }
    }
    case ViewStateActionTypes.SetLocalViewState:
    case ViewStateActionTypes.RemoveField:
    case ViewStateActionTypes.UpdateView:
    case ViewStateActionTypes.AddField:
    case ViewStateActionTypes.SaveViewName:
    case ViewStateActionTypes.MoveField:
    case ViewStateActionTypes.ToggleField:
    case ViewStateActionTypes.HideField:
    case ViewStateActionTypes.ShowField:
    case ViewStateActionTypes.SetViewType:
    case ViewStateActionTypes.SetHorizontalGroupedBy:
    case ViewStateActionTypes.SetVerticalGroupedBy:
    case ViewStateActionTypes.SetSortedBy:
    case ViewStateActionTypes.ClearHorizontalGroupedBy:
    case ViewStateActionTypes.SetFilter:
    case ViewStateActionTypes.ResetViewState:
    case ViewStateActionTypes.ToggleItemsCount:
    case ViewStateActionTypes.AddFieldAggregation:
    case ViewStateActionTypes.RemoveFieldAggregation:
    case ViewStateActionTypes.SetRoadmapDateFields:
    case ViewStateActionTypes.ToggleRoadmapMarkerFields:
    case ViewStateActionTypes.SetRoadmapZoomLevel:
    case ViewStateActionTypes.SetSliceBy:
    case ViewStateActionTypes.ClearSliceBy:
    case ViewStateActionTypes.SetSliceValue:
    case ViewStateActionTypes.SetSliceByFilter:
    case ViewStateActionTypes.SetSliceByPanelWidth:
    case ViewStateActionTypes.SetColumnWidths:
    case ViewStateActionTypes.UpdateBoardColumnLimit: {
      let nextViewNumber = state.currentViewNumber

      if ('currentViewNumber' in action && typeof action.currentViewNumber !== 'undefined') {
        nextViewNumber = action.currentViewNumber
      }
      return {
        ...state,
        views: viewsReducer(state.views, action),
        currentViewNumber: nextViewNumber,
      }
    }
    case ViewStateActionTypes.SetState: {
      return {...state, ...action.state}
    }

    case ViewStateActionTypes.DeleteView: {
      const viewNumberIndex = Object.keys(state.views)
        .map(numberString => parseInt(numberString, 10))
        .indexOf(action.viewNumber)

      const nextViews = viewsReducer(state.views, action)

      const nextViewNumbers = Object.keys(nextViews).map(numberLikeString => parseInt(numberLikeString, 10))

      /**
       * The next view number is the same index, the one before it or zero
       */
      let nextViewNumberIndex: number
      if (nextViewNumbers.length > viewNumberIndex) {
        nextViewNumberIndex = viewNumberIndex
      } else {
        nextViewNumberIndex = viewNumberIndex - 1
      }

      return {
        ...state,
        views: nextViews,
        currentViewNumber: nextViewNumbers[nextViewNumberIndex],
        viewsOrder: (state.viewsOrder ?? []).filter(viewNumber => viewNumber !== action.viewNumber),
      }
    }

    case ViewStateActionTypes.SetViews: {
      return {
        ...state,
        views: viewsReducer(state.views, action),
        currentViewNumber: action.currentViewNumber ?? state.currentViewNumber,
      }
    }

    case ViewStateActionTypes.GoToViewNumber: {
      return {...state, currentViewNumber: action.viewNumber}
    }

    case ViewStateActionTypes.ReorderView: {
      const filteredViews = (state.viewsOrder ?? []).filter(viewNumber => viewNumber !== action.viewNumber)
      if (!action.prevViewNumber) {
        return {
          ...state,
          viewsOrder: [...filteredViews, action.viewNumber],
        }
      }

      const indexOfPrevView = filteredViews.indexOf(action.prevViewNumber)

      return {
        ...state,
        viewsOrder: [
          ...filteredViews.slice(0, indexOfPrevView),
          action.viewNumber,
          ...filteredViews.slice(indexOfPrevView),
        ],
      }
    }

    default: {
      assertNever(action)
    }
  }
}

export const reducer: typeof mainReducer = (state, action) => {
  return replaceEqualDeep(state, mainReducer(state, action))
}

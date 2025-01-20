import type {ColumnWidths, FieldOperation, LayoutSettings, PageView, RoadmapZoomLevel} from '../../api/view/contracts'
import type {SliceValue} from '../../features/slicing/hooks/use-slice-by'
import type {ViewType} from '../../helpers/view-type'
import type {ColumnModel} from '../../models/column-model'
import type {BaseViewState, LocalSort, NormalizedPageView, ViewsMap} from './types'

export const ViewStateActionTypes = {
  SetSortedBy: 'SetSortedBy',
  SetHorizontalGroupedBy: 'SetHorizontalGroupedBy',
  ClearHorizontalGroupedBy: 'ClearHorizontalGroupedBy',
  SetVerticalGroupedBy: 'SetVerticalGroupedBy',
  SetViewType: 'SetViewType',
  SetFilter: 'SetFilter',
  ShowField: 'ShowField',
  HideField: 'HideField',
  ToggleField: 'ToggleField',
  MoveField: 'MoveField',
  GoToViewNumber: 'GoToViewNumber',
  ResetViewState: 'ResetViewState',
  AddField: 'AddField',
  RemoveField: 'RemoveField',
  SetState: 'SetState',
  SaveViewName: 'SaveViewName',
  AddView: 'AddView',
  DeleteView: 'DeleteView',
  UpdateView: 'UpdateView',
  SetViews: 'SetViews',
  SetLocalViewState: 'SetLocalViewState',
  SetViewServerStates: 'SetViewServerStates',
  ReorderView: 'ReorderView',
  ToggleItemsCount: 'ToggleItemsCount',
  AddFieldAggregation: 'AddFieldAggregation',
  RemoveFieldAggregation: 'RemoveFieldAggregation',
  SetRoadmapDateFields: 'SetRoadmapDateFields',
  SetRoadmapZoomLevel: 'SetRoadmapZoomLevel',
  SetColumnWidths: 'SetColumnWidths',
  ToggleRoadmapMarkerFields: 'ToggleRoadmapMarkerFields',
  UpdateBoardColumnLimit: 'UpdateBoardColumnLimit',
  SetSliceBy: 'SetSliceBy',
  ClearSliceBy: 'ClearSliceBy',
  SetSliceValue: 'SetSliceValue',
  SetSliceByFilter: 'SetSliceByFilter',
  SetSliceByPanelWidth: 'SetSliceByPanelWidth',
} as const
export type ViewStateActionTypes = ObjectValues<typeof ViewStateActionTypes>

export type ViewStateActions =
  | {type: typeof ViewStateActionTypes.SetViewServerStates; viewStates: Array<PageView>}
  | {type: typeof ViewStateActionTypes.SetSortedBy; sorts: ReadonlyArray<LocalSort>; viewNumber: number}
  | {type: typeof ViewStateActionTypes.SetHorizontalGroupedBy; column: ColumnModel; viewNumber: number}
  | {type: typeof ViewStateActionTypes.SetVerticalGroupedBy; column: ColumnModel; viewNumber: number}
  | {type: typeof ViewStateActionTypes.SetFilter; filter: string; viewNumber: number}
  | {type: typeof ViewStateActionTypes.ClearHorizontalGroupedBy; viewNumber: number}
  | {
      type: typeof ViewStateActionTypes.SetViewType
      viewType: ViewType
      viewNumber: number
      layoutSettings?: LayoutSettings
    }
  | {type: typeof ViewStateActionTypes.ShowField; column: ColumnModel; viewNumber: number; position?: number}
  | {type: typeof ViewStateActionTypes.HideField; column: ColumnModel; viewNumber: number}
  | {type: typeof ViewStateActionTypes.ToggleField; column: ColumnModel; viewNumber: number; position?: number}
  | {type: typeof ViewStateActionTypes.MoveField; column: ColumnModel; newPosition: number; viewNumber: number}
  | {
      type: typeof ViewStateActionTypes.GoToViewNumber
      viewNumber?: number
    }
  | {type: typeof ViewStateActionTypes.ResetViewState; viewNumber: number}
  | {
      type: typeof ViewStateActionTypes.RemoveField
      column: ColumnModel
    }
  | {
      type: typeof ViewStateActionTypes.AddField
      column: ColumnModel
      viewNumber: number
    }
  | {type: typeof ViewStateActionTypes.SaveViewName; name: string; viewNumber: number}
  | {
      type: typeof ViewStateActionTypes.SetState
      state: BaseViewState
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.AddView
      view: PageView
    }
  | {
      type: typeof ViewStateActionTypes.UpdateView
      view: PageView
    }
  | {
      type: typeof ViewStateActionTypes.DeleteView
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.SetViews
      views: ViewsMap
      currentViewNumber?: number
    }
  | {
      type: typeof ViewStateActionTypes.SetLocalViewState
      localViewState: NormalizedPageView
      viewNumber: number
      currentViewNumber?: number
    }
  | {
      type: typeof ViewStateActionTypes.ReorderView
      viewNumber: number
      prevViewNumber?: number
    }
  | {
      type: typeof ViewStateActionTypes.ToggleItemsCount
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.AddFieldAggregation
      fieldOperation: FieldOperation
      column: ColumnModel
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.RemoveFieldAggregation
      fieldOperation: FieldOperation
      column: ColumnModel
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.ToggleRoadmapMarkerFields
      field: ColumnModel
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.SetRoadmapDateFields
      dateFields: Array<ColumnModel | 'none'>
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.SetRoadmapZoomLevel
      zoomLevel: RoadmapZoomLevel
      viewNumber: number
    }
  | {
      type: typeof ViewStateActionTypes.SetColumnWidths
      viewNumber: number
      viewType: typeof ViewType.Roadmap | typeof ViewType.Table
      columnWidths: ColumnWidths
    }
  | {
      type: typeof ViewStateActionTypes.UpdateBoardColumnLimit
      limit: number | undefined
      columnDatabaseId: number
      optionId: string
      viewNumber: number
    }
  | {type: typeof ViewStateActionTypes.SetSliceBy; column: ColumnModel; viewNumber: number}
  | {type: typeof ViewStateActionTypes.ClearSliceBy; viewNumber: number}
  | {
      type: typeof ViewStateActionTypes.SetSliceValue
      value: SliceValue
      viewNumber: number
    }
  | {type: typeof ViewStateActionTypes.SetSliceByFilter; filter: string; viewNumber: number}
  | {type: typeof ViewStateActionTypes.SetSliceByPanelWidth; panelWidth: number | undefined; viewNumber: number}

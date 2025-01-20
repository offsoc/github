import {type ColumnWidths, type LayoutSettings, ViewTypeParam} from '../api/view/contracts'
import type {NormalizedPageView} from '../hooks/use-view-state-reducer/types'
import {getViewTypeFromViewTypeParam, ViewType} from './view-type'

export function canViewTypeHaveColumnWidths(
  viewType: ViewType,
): viewType is typeof ViewType.Roadmap | typeof ViewType.Table {
  return viewType === ViewType.Roadmap || viewType === ViewType.Table
}

export function canViewTypeParamHaveColumnWidths(
  viewTypeParam: ViewTypeParam,
): viewTypeParam is typeof ViewTypeParam.Roadmap | typeof ViewTypeParam.Table {
  return viewTypeParam === ViewTypeParam.Roadmap || viewTypeParam === ViewTypeParam.Table
}

/**
 * Given layout settings object, return column widths for a specified layout
 * @param layout    - The layout using the column widths
 * @param layoutSettings    - The layout settings for the view
 * @returns The column widths for the specified layout
 */
export function getColumnWidthsForLayout(layout: ViewTypeParam, layoutSettings: LayoutSettings): ColumnWidths {
  const viewType = getViewTypeFromViewTypeParam(layout)

  if (!canViewTypeHaveColumnWidths(viewType)) {
    throw new Error('Column widths can only be applied to table or roadmap views')
  }

  return layoutSettings[viewType]?.columnWidths ?? {}
}

/**
 * Applies column widths for an eligible layout to a view
 * @param view    - The view to apply the column widths to
 * @param layout    - The layout using the new column widths (should be roadmap or table)
 * @param newColumnWidths    - The new column widths to apply
 * @returns A new object with the column widths applied
 */
export function applyColumnWidthsToView(
  view: NormalizedPageView,
  layout: ViewTypeParam,
  newColumnWidths: ColumnWidths,
): NormalizedPageView {
  const viewType = getViewTypeFromViewTypeParam(layout)

  if (!canViewTypeHaveColumnWidths(viewType)) {
    throw new Error('Column widths can only be applied to table or roadmap views')
  }

  return {
    ...view,
    layoutSettings: {
      ...view.layoutSettings,
      [viewType]: {
        ...view.layoutSettings[viewType],
        columnWidths: {...newColumnWidths},
      },
    },
  }
}

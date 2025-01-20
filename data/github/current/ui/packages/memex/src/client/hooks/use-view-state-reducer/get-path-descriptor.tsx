import {
  FILTER_QUERY_PARAM,
  HIDE_ITEMS_COUNT_PARAM,
  HORIZONTAL_GROUPED_BY_COLUMN_KEY,
  SLICE_BY_COLUMN_ID_KEY,
  SLICE_VALUE_KEY,
  SORTED_BY_COLUMN_DIRECTION_KEY,
  SORTED_BY_COLUMN_ID_KEY,
  SUM_FIELDS_PARAM,
  VERTICAL_GROUPED_BY_COLUMN_KEY,
  VIEW_TYPE_PARAM,
  VISIBLE_FIELDS_PARAM,
} from '../../platform/url'
import type {useProjectRouteParams} from '../../router/use-project-route-params'
import {PROJECT_VIEW_ROUTE} from '../../routes'
import type {CurrentView} from './types'

export function getPathDescriptor(
  currentView: CurrentView,
  projectRouteParams: ReturnType<typeof useProjectRouteParams>,
  search = '',
) {
  if (!currentView) throw new Error('Must provide a view to get a url for')

  const nextParams = new URLSearchParams(search)

  if (currentView.isViewTypeDirty) {
    nextParams.set(VIEW_TYPE_PARAM, currentView.localViewStateDeserialized.viewType)
  } else {
    nextParams.delete(VIEW_TYPE_PARAM)
  }

  if (currentView.isFilterDirty) {
    nextParams.set(FILTER_QUERY_PARAM, currentView.localViewStateDeserialized.filter)
  } else {
    nextParams.delete(FILTER_QUERY_PARAM)
  }

  // Sort is the only field that supports multiple values. Here we always delete the existing values so we don't just
  // keep on appending to the end of the URL.
  nextParams.delete(SORTED_BY_COLUMN_DIRECTION_KEY)
  nextParams.delete(SORTED_BY_COLUMN_ID_KEY)

  if (currentView.isSortedByDirty) {
    const sortedBy = currentView.localViewStateDeserialized.sortByColumnsAndDirections

    if (sortedBy.length > 0)
      for (const {column, direction} of sortedBy) {
        nextParams.append(SORTED_BY_COLUMN_DIRECTION_KEY, direction)
        nextParams.append(SORTED_BY_COLUMN_ID_KEY, `${column.id}`)
      }
    else {
      nextParams.set(SORTED_BY_COLUMN_DIRECTION_KEY, '')
      nextParams.set(SORTED_BY_COLUMN_ID_KEY, '')
    }
  }

  if (currentView.isHorizontalGroupedByDirty) {
    const [column] = currentView.localViewStateDeserialized.horizontalGroupByColumns

    if (column) {
      nextParams.set(HORIZONTAL_GROUPED_BY_COLUMN_KEY, `${column.id}`)
    } else {
      nextParams.set(HORIZONTAL_GROUPED_BY_COLUMN_KEY, '')
    }
  } else {
    nextParams.delete(HORIZONTAL_GROUPED_BY_COLUMN_KEY)
  }

  if (currentView.isVerticalGroupedByDirty) {
    const [column] = currentView.localViewStateDeserialized.verticalGroupByColumns

    if (column) {
      nextParams.set(VERTICAL_GROUPED_BY_COLUMN_KEY, `${column.id}`)
    } else {
      nextParams.set(VERTICAL_GROUPED_BY_COLUMN_KEY, '')
    }
  } else {
    nextParams.delete(VERTICAL_GROUPED_BY_COLUMN_KEY)
  }

  // if we update visible fields for url params
  if (currentView.isVisibleFieldsDirty) {
    const visibleFields = currentView.localViewStateDeserialized.visibleFields
    if (visibleFields.length > 0) {
      nextParams.set(VISIBLE_FIELDS_PARAM, JSON.stringify(visibleFields.map(column => column.id)))
    } else {
      nextParams.set(VISIBLE_FIELDS_PARAM, '')
    }
  } else {
    nextParams.delete(VISIBLE_FIELDS_PARAM)
  }

  // if we update aggregation settings for url params
  if (currentView.isAggregationSettingsDirty) {
    const {sum, hideItemsCount} = currentView.localViewStateDeserialized.aggregationSettings
    if (sum.length > 0) {
      nextParams.set(SUM_FIELDS_PARAM, JSON.stringify(sum.map(column => column.id)))
    } else {
      nextParams.set(SUM_FIELDS_PARAM, '')
    }
    nextParams.set(HIDE_ITEMS_COUNT_PARAM, JSON.stringify(!!hideItemsCount))
  } else {
    nextParams.delete(SUM_FIELDS_PARAM)
    nextParams.delete(HIDE_ITEMS_COUNT_PARAM)
  }

  if (currentView.isSliceByDirty) {
    const sliceBy = currentView.localViewStateDeserialized.sliceBy
    if (sliceBy.field) {
      nextParams.set(SLICE_BY_COLUMN_ID_KEY, `${sliceBy.field.id}`)
    } else {
      nextParams.set(SLICE_BY_COLUMN_ID_KEY, '')
    }
  } else {
    nextParams.delete(SLICE_BY_COLUMN_ID_KEY)
  }

  if (currentView.localViewStateDeserialized.sliceValue) {
    const sliceValue = `${currentView.localViewStateDeserialized.sliceValue}`
    nextParams.set(SLICE_VALUE_KEY, sliceValue)
  } else {
    nextParams.delete(SLICE_VALUE_KEY)
  }

  return {
    pathname: PROJECT_VIEW_ROUTE.generatePath({
      ...projectRouteParams,
      viewNumber: currentView.localViewStateDeserialized.number,
    }),
    search: nextParams.toString(),
  }
}

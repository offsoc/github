import {Factory} from 'fishery'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import {type PageView, ViewTypeParam} from '../../../client/api/view/contracts'
import {getViewTypeParamFromViewType, ViewType} from '../../../client/helpers/view-type'

class ViewFactory extends Factory<PageView> {
  board() {
    return this.params({
      layout: getViewTypeParamFromViewType(ViewType.Board),
    })
  }

  table() {
    return this.params({
      layout: getViewTypeParamFromViewType(ViewType.Table),
    })
  }

  roadmap() {
    return this.params({
      layout: getViewTypeParamFromViewType(ViewType.Roadmap),
    })
  }

  withViewType(viewType: ViewType) {
    return this.params({
      layout: getViewTypeParamFromViewType(viewType),
    })
  }

  withDefaultColumnsAsVisibleFields(columns: Array<MemexColumn>) {
    const visibleFields = columns.filter(c => c.defaultColumn).map(c => c.databaseId)
    return this.params({
      visibleFields,
    })
  }
}

export const viewFactory = ViewFactory.define(({sequence}) => {
  const now = new Date().toISOString()
  return {
    createdAt: now,
    id: sequence,
    number: sequence + 4032,
    updatedAt: now,
    name: `View ${sequence}`,
    filter: '',
    layout: ViewTypeParam.Table,
    groupBy: [],
    verticalGroupBy: [],
    sortBy: [],
    priority: null,
    visibleFields: [],
    aggregationSettings: {hideItemsCount: false, sum: []},
    layoutSettings: {},
    sliceValue: null,
    sliceBy: {},
  }
})

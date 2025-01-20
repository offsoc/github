import type {PageView} from '../../client/api/view/contracts'

export function autoFillViewServerProps(views: Array<PageView>): Array<PageView> {
  return views.map((view, i) => ({...view, id: i + 4032, number: i + 1, name: view.name || `View ${i + 1}`}))
}

export function createView({
  name,
  filter,
  layout,
  groupBy,
  sortBy,
  visibleFields,
  verticalGroupBy,
  aggregationSettings,
  layoutSettings,
  sliceBy,
  sliceValue,
}: Omit<PageView, 'id' | 'number' | 'createdAt' | 'updatedAt'>): PageView {
  const now = new Date().toISOString()

  return {
    id: -1,
    number: -1,
    name,
    filter,
    layout,
    groupBy,
    verticalGroupBy,
    sortBy,
    visibleFields,
    priority: null,
    createdAt: now,
    updatedAt: now,
    aggregationSettings,
    layoutSettings,
    sliceBy,
    sliceValue,
  }
}

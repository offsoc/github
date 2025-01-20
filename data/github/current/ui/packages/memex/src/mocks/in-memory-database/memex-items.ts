import type {MemexColumn} from '../../client/api/columns/contracts/memex-column'
import type {User} from '../../client/api/common-contracts'
import type {MemexItem} from '../../client/api/memex-items/contracts'
import type {ItemType} from '../../client/api/memex-items/item-type'
import {
  makeFieldsByFilterableName,
  type ParsedFullTextQuery,
  parseTrimmedAndLowerCasedFilter,
} from '../../client/components/filter-bar/helpers/search-filter'
import {resolveCombinedSortFunction} from '../../client/features/sorting/resolver'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {FilterKeywords} from '../../client/hooks/use-filter-keywords'
import {itemMatchesFilterQuery} from '../../client/hooks/use-item-matches-filter-query'
import type {LocalSort} from '../../client/hooks/use-view-state-reducer/types'
import type {ColumnModel} from '../../client/models/column-model'
import {createColumnModel} from '../../client/models/column-model'
import type {MemexItemModel} from '../../client/models/memex-item-model'
import {createMemexItemModel} from '../../client/models/memex-item-model'
import type {PaginatedMemexItemsQueryVariables} from '../../client/state-providers/memex-items/queries/types'
import {deepCopy} from './utils'

type ModelAndItem = {
  model: MemexItemModel
  item: MemexItem
}

export type MemexItemCollationParams = {
  columns: Array<MemexColumn>
} & Pick<PaginatedMemexItemsQueryVariables, 'q' | 'sortedBy'>

export class MemexItemsCollection {
  private memexItems: Array<MemexItem>

  constructor(memexItems: Array<MemexItem> = []) {
    this.memexItems = deepCopy(memexItems)
  }

  public reprioritize(thisItemId: number, previousItemId?: number) {
    const item = this.byId(thisItemId)
    const previousItem = previousItemId === undefined ? undefined : this.byId(previousItemId)
    if (!item) throw new Error(`Item with ID '${thisItemId}' not found`)

    const index = this.memexItems.findIndex(memexItem => memexItem.id === thisItemId)
    this.memexItems.splice(index, 1)
    if (previousItem) {
      const previousItemIndex = this.memexItems.findIndex(memexItem => memexItem.id === previousItemId)
      this.memexItems.splice(previousItemIndex + 1, 0, item)
    } else {
      this.memexItems.splice(0, 0, item)
    }
  }

  public all(collationParams?: MemexItemCollationParams): Array<MemexItem> {
    return this.collateItems(this.memexItems, collationParams)
  }

  public getActive(collationParams?: MemexItemCollationParams): Array<MemexItem> {
    return this.collateItems(
      this.memexItems.filter(item => !item.archived?.archivedAt),
      collationParams,
    )
  }

  public getArchived(collationParams?: MemexItemCollationParams): Array<MemexItem> {
    return this.collateItems(
      this.memexItems.filter(item => item.archived?.archivedAt),
      collationParams,
    )
  }

  public byId(id: number): MemexItem {
    const memexItem = this.memexItems.find(item => item.id === id)
    if (!memexItem) throw new Error('Memex item not found')
    return memexItem
  }

  public byContentId(id: number): MemexItem {
    const memexItem = this.memexItems.find(item => item.content.id === id)
    if (!memexItem) throw new Error('Memex item not found')
    return memexItem
  }

  public add(memexItem: MemexItem) {
    this.memexItems.push(memexItem)
  }

  public exists(type: ItemType, id: number) {
    return this.memexItems.find(i => i.contentType === type && i.content.id === id)
  }

  public remove(id: number): MemexItem {
    const index = this.memexItems.findIndex(item => item.id === id)
    return not_typesafe_nonNullAssertion(this.memexItems.splice(index, 1)[0])
  }

  public archive(id: number, archivedBy: User, archivedAt?: string) {
    const index = this.memexItems.findIndex(item => item.id === id)
    const item = not_typesafe_nonNullAssertion(this.memexItems[index])
    const archivedItem: MemexItem = {
      ...item,
      archived: {
        archivedBy,
        archivedAt: archivedAt ?? new Date().toISOString(),
      },
    }
    this.memexItems[index] = archivedItem
  }

  public unarchive(id: number) {
    const index = this.memexItems.findIndex(item => item.id === id)
    const item = not_typesafe_nonNullAssertion(this.memexItems[index])
    if (!item.archived?.archivedAt) throw new Error(`Tried to unarchive item ${id}, but it is not archived`)
    const {archived, ...unarchivedItem} = item
    this.memexItems[index] = unarchivedItem
  }

  public collateItems(items: Array<MemexItem>, collationParams?: MemexItemCollationParams): Array<MemexItem> {
    if (!collationParams) return items

    const columnModels = collationParams.columns.map(column => createColumnModel(column))

    const modelsAndItems = this.memexItems.map(item => {
      const model = createMemexItemModel(item)
      return {model, item}
    })

    const filteredModelsAndItems = collationParams.q
      ? getFilteredItems(collationParams.q, modelsAndItems, columnModels)
      : modelsAndItems

    if (collationParams.sortedBy) {
      sortItems(collationParams.sortedBy, filteredModelsAndItems, columnModels)
    }

    return filteredModelsAndItems.map(modelAndItem => modelAndItem.item)
  }
}

function getFilteredItems(query: string, modelsAndItems: Array<ModelAndItem>, columnModels: Array<ColumnModel>) {
  const parsedQuery = parseTrimmedAndLowerCasedFilter(query)

  const allFieldsByFilterableName = makeFieldsByFilterableName(columnModels)

  return modelsAndItems.filter(modelAndItem => {
    return matchesCurrentQuery(modelAndItem.model, parsedQuery, allFieldsByFilterableName)
  })
}

function sortItems(
  sortedBy: Array<{columnId: number; direction: 'asc' | 'desc'}>,
  modelsAndItems: Array<ModelAndItem>,
  columnModels: Array<ColumnModel>,
) {
  const sortedByWithColumnModels: Array<LocalSort> = []
  for (const {columnId, direction} of sortedBy) {
    const columnModel = columnModels.find(column => column.databaseId === columnId)
    if (columnModel) {
      sortedByWithColumnModels.push({column: columnModel, direction})
    }
  }

  const sortFn = resolveCombinedSortFunction(sortedByWithColumnModels)
  const wrappedSortFn = (modelAndItem1: ModelAndItem, modelAndItem2: ModelAndItem) =>
    sortFn(modelAndItem1.model, modelAndItem2.model)

  modelsAndItems.sort(wrappedSortFn)
}

function matchesCurrentQuery(
  memexItemModel: MemexItemModel,
  query: ParsedFullTextQuery & {normalisedQuery: string},
  allFieldsByFilterableName: Map<string, ColumnModel>,
) {
  return itemMatchesFilterQuery(memexItemModel, query, allFieldsByFilterableName, isKeywordQualifier)
}

function isKeywordQualifier(text: string) {
  return FilterKeywords.map(key => key.keyword).includes(text)
}

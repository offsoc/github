import type {MemexColumnData} from '../../api/columns/contracts/storage'
import type {MemexItem} from '../../api/memex-items/contracts'
import type {ItemType} from '../../api/memex-items/item-type'
import type {PaginatedMemexItemsData} from '../../api/memex-items/paginated-views'
import {fetchJSONIslandData, type JSONIslandData} from '../../helpers/json-island'

interface ColumnsFromContentType {
  contentType: ItemType
  columns: Array<MemexColumnData>
}

type MemexColumnDataByItemId = Map<number, ColumnsFromContentType>

type MemexItemsDataJSONIslandKey = 'memex-items-data' | 'memex-paginated-items-data'

export interface InitialItemsAndColumnsBase<TMemexItemsJSONIslandData> {
  memexItems: TMemexItemsJSONIslandData
  memexColumnsByItemId: MemexColumnDataByItemId
}

export type InitialItemsAndColumns = {
  [K in MemexItemsDataJSONIslandKey]: InitialItemsAndColumnsBase<JSONIslandData[K]>
}

const internalCache: InitialItemsAndColumns = {
  'memex-items-data': {
    memexItems: [],
    memexColumnsByItemId: new Map(),
  },
  'memex-paginated-items-data': {
    memexItems: {
      nodes: [],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
      totalCount: {value: 0, isApproximate: false},
    },
    memexColumnsByItemId: new Map(),
  },
}

/**
 * Fetches the initial items and columns from the JSON island.
 *
 * @param cache     - IMPORTANT: Do _not_ use this argument directly from the application code.
 *                    It is only exposed for testing purposes only!
 * @returns an object with the initial items and columns by item id
 */
export function buildInitialItemsAndColumns<TMemexItemsJSONIslandKey extends keyof InitialItemsAndColumns>(
  jsonIslandKey: TMemexItemsJSONIslandKey,
  cache?: InitialItemsAndColumns,
): Readonly<InitialItemsAndColumns[TMemexItemsJSONIslandKey]>
export function buildInitialItemsAndColumns(
  jsonIslandKey: keyof InitialItemsAndColumns,
  cache: InitialItemsAndColumns = internalCache,
): Readonly<InitialItemsAndColumns[keyof InitialItemsAndColumns]> {
  if (jsonIslandKey === 'memex-items-data') {
    if (
      cache[jsonIslandKey].memexItems.length &&
      cache[jsonIslandKey].memexColumnsByItemId.size &&
      process.env.APP_ENV === 'production'
    ) {
      return cache[jsonIslandKey]
    }

    // otherwise parse the json island data once and cache it
    // for the next invocation of this function
    cache[jsonIslandKey].memexItems = fetchJSONIslandData(jsonIslandKey) ?? []
    cache[jsonIslandKey].memexColumnsByItemId = buildColumnsById(cache[jsonIslandKey].memexItems)

    return cache[jsonIslandKey]
  } else {
    const cachedData = cache[jsonIslandKey].memexItems
    const arrayToCheck = getArrayFromResponse(cachedData)

    if (arrayToCheck.length && cache[jsonIslandKey].memexColumnsByItemId.size && process.env.APP_ENV === 'production') {
      return cache[jsonIslandKey]
    }

    // otherwise parse the json island data once and cache it
    // for the next invocation of this function
    const jsonIslandData = fetchJSONIslandData(jsonIslandKey) ?? {
      nodes: [],
      pageInfo: {hasNextPage: false, hasPreviousPage: false},
      totalCount: {value: 0, isApproximate: false},
    }

    cache[jsonIslandKey].memexItems = jsonIslandData
    if ('groups' in jsonIslandData) {
      // build columns by id for grouped data,
      // based on a flattened list of nodes across all groups
      const nodes = jsonIslandData.groupedItems.reduce(
        (acc, groupedItems) => acc.concat(groupedItems.nodes),
        [] as Array<MemexItem>,
      )
      cache[jsonIslandKey].memexColumnsByItemId = buildColumnsById(nodes)
    } else {
      cache[jsonIslandKey].memexColumnsByItemId = buildColumnsById(jsonIslandData.nodes)
    }
    return cache[jsonIslandKey]
  }
}

/**
 * Indexes columns by the corresponding item id.
 * Important Generally, avoid using this function directly from the application
 * It should always be used from a state provider or a hook that requires data from `memex-items-data` JSON island
 *
 * @param items - The items from `memex-items-data` JSON island
 * @returns an object with the items and columns
 */
function buildColumnsById(items: Array<MemexItem>): MemexColumnDataByItemId {
  const columnByItemId: MemexColumnDataByItemId = new Map()

  return items.reduce<MemexColumnDataByItemId>((columnsByItemIdAcc, item) => {
    const {contentType, id, memexProjectColumnValues} = item
    return columnsByItemIdAcc.set(id, {contentType, columns: memexProjectColumnValues})
  }, columnByItemId)
}

/**
 * Given a response of paginated items data, return the top-level array -
 * either an array of items if ungrouped, or an array of groups if grouped
 */
function getArrayFromResponse(response: PaginatedMemexItemsData) {
  if ('nodes' in response) {
    return response.nodes
  } else if ('nodes' in response.groups) {
    return response.groups.nodes
  } else {
    return response.groups
  }
}

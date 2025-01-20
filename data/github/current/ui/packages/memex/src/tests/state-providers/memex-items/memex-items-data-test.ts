import type {MemexItem} from '../../../client/api/memex-items/contracts'
import {
  buildInitialItemsAndColumns,
  type InitialItemsAndColumns,
} from '../../../client/state-providers/memex-items/memex-items-data'
import {
  DefaultClosedIssue,
  DefaultDraftIssue,
  DefaultOpenIssue,
  DefaultOpenPullRequest,
} from '../../../mocks/memex-items'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {buildGroupedItemsResponse} from './query-client-api/helpers'

describe('memex-items-data', () => {
  /* This module relies on the APP_ENV global so we need to stub it
   * and clear the environment for each test
   */
  let originalAppEnv: string | undefined
  let internalCache: InitialItemsAndColumns

  beforeAll(() => {
    originalAppEnv = process.env.APP_ENV
  })

  beforeEach(() => {
    process.env.APP_ENV = 'development'
    internalCache = {
      'memex-items-data': {memexItems: [], memexColumnsByItemId: new Map()},
      'memex-paginated-items-data': {
        memexItems: {
          nodes: [],
          pageInfo: {hasNextPage: false, hasPreviousPage: false},
          totalCount: {value: 0, isApproximate: false},
        },
        memexColumnsByItemId: new Map(),
      },
    }
  })

  afterAll(() => {
    process.env.APP_ENV = originalAppEnv
  })

  describe('buildInitialItemsAndColumns', () => {
    it('should return an object with memex items and columns indexed by item id', () => {
      seedJSONIsland('memex-items-data', [DefaultOpenIssue, DefaultOpenPullRequest])

      const {memexItems, memexColumnsByItemId} = buildInitialItemsAndColumns('memex-items-data', internalCache)

      expect(memexItems).toHaveLength(2)
      expect(memexColumnsByItemId.size).toBe(2)

      for (const item of memexItems) {
        const {id, contentType, memexProjectColumnValues} = item
        const columns = memexColumnsByItemId.get(id)!

        expect(columns).toBeDefined()
        expect(columns.contentType).toBe(contentType)
        expect(columns.columns).toEqual(memexProjectColumnValues)
      }
    })

    it('should read ungrouped data from memex-paginated-items-data if that key is provided', () => {
      seedJSONIsland('memex-paginated-items-data', {
        nodes: [DefaultOpenIssue, DefaultOpenPullRequest],
        pageInfo: {hasNextPage: false, hasPreviousPage: false},
        totalCount: {value: 2, isApproximate: false},
      })

      const {memexItems, memexColumnsByItemId} = buildInitialItemsAndColumns(
        'memex-paginated-items-data',
        internalCache,
      )

      if ('groups' in memexItems) {
        throw Error('"groups" in ungrouped paginated data not expected')
      }

      expect(memexItems.nodes).toHaveLength(2)
      expect(memexColumnsByItemId.size).toBe(2)

      for (const item of memexItems.nodes) {
        const {id, contentType, memexProjectColumnValues} = item
        const columns = memexColumnsByItemId.get(id)!

        expect(columns).toBeDefined()
        expect(columns.contentType).toBe(contentType)
        expect(columns.columns).toEqual(memexProjectColumnValues)
      }
    })

    it(`should read grouped data from memex-paginated-items-data if that key is provided,`, () => {
      seedJSONIsland(
        'memex-paginated-items-data',
        buildGroupedItemsResponse({
          groups: [
            {
              groupId: 'group1',
              groupValue: 'Group 1',
              items: [DefaultOpenIssue, DefaultOpenPullRequest],
            },
            {
              groupId: 'group2',
              groupValue: 'Group 2',
              items: [DefaultClosedIssue],
            },
          ],
        }),
      )

      const {memexColumnsByItemId, ...rest} = buildInitialItemsAndColumns('memex-paginated-items-data', internalCache)

      const memexItems = rest.memexItems

      if ('nodes' in memexItems) {
        throw Error('"nodes" in grouped paginated data not expected')
      }

      expect(memexItems.groups.nodes).toHaveLength(2)
      expect(memexColumnsByItemId.size).toBe(3)

      for (const groupedItems of memexItems.groupedItems) {
        for (const item of groupedItems.nodes) {
          const {id, contentType, memexProjectColumnValues} = item
          const columns = memexColumnsByItemId.get(id)!

          expect(columns).toBeDefined()
          expect(columns.contentType).toBe(contentType)
          expect(columns.columns).toEqual(memexProjectColumnValues)
        }
      }
    })

    it('should parse "memex-items-data" once in production mode', () => {
      process.env.APP_ENV = 'production'

      // Initially seed the JSON island with 2 items.
      // This is the data that should get parsed and cached after the first call to
      // `buildInitialItemsAndColumns`
      seedJSONIsland('memex-items-data', [DefaultOpenIssue, DefaultOpenPullRequest])

      buildInitialItemsAndColumns('memex-items-data', internalCache)

      // Now seed the JSON island with 3 items, this data should _not_ be parsed
      // because the data from the first call to `buildInitialItemsAndColumns` should be cached
      seedJSONIsland('memex-items-data', [DefaultOpenIssue, DefaultOpenPullRequest, DefaultDraftIssue])
      const {memexItems, memexColumnsByItemId} = buildInitialItemsAndColumns('memex-items-data', internalCache)

      // We expect to have the 2 items from the original JSON island data
      expect(memexItems).toHaveLength(2)
      expect(memexColumnsByItemId.size).toBe(2)

      for (const item of memexItems) {
        const {id, contentType, memexProjectColumnValues} = item
        const columns = memexColumnsByItemId.get(id)!

        expect(columns).toBeDefined()
        expect(columns.contentType).toBe(contentType)
        expect(columns.columns).toEqual(memexProjectColumnValues)
      }
    })

    it('should parse "memex-items-data" twice in production mode when parsing data fails the first time', () => {
      process.env.APP_ENV = 'production'

      // Initially seed the JSON island with undefined.
      // Since we don't have any items, we'll re-request the data again
      // when we call `buildInitialItemsAndColumns` the next time.
      seedJSONIsland('memex-items-data', undefined)

      buildInitialItemsAndColumns('memex-items-data', internalCache)

      // Seed the JSON island with an item, this data should be parsed
      // and cache since we didn't find anything the first time.
      seedJSONIsland('memex-items-data', [DefaultDraftIssue])
      const {memexItems, memexColumnsByItemId} = buildInitialItemsAndColumns('memex-items-data', internalCache)

      // Now seed the JSON island with 2 items, this data should _not_ be parsed,
      // because we expect to load the data from the first call to `buildInitialItemsAndColumns`
      seedJSONIsland('memex-items-data', [DefaultOpenIssue, DefaultOpenPullRequest])

      // Get the items from this call to `buildInitialItemsAndColumns`,
      // so that we can assert they are the same as the previous call.
      const {memexItems: secondMemexItems, memexColumnsByItemId: secondMemexColumnsById} = buildInitialItemsAndColumns(
        'memex-items-data',
        internalCache,
      )

      expect(memexItems).toHaveLength(1)
      expect(memexItems).toEqual(secondMemexItems)
      expect(memexColumnsByItemId.size).toBe(1)
      expect(memexColumnsByItemId).toEqual(secondMemexColumnsById)

      for (const item of memexItems) {
        const {id, contentType, memexProjectColumnValues} = item
        const columns = memexColumnsByItemId.get(id)!

        expect(columns).toBeDefined()
        expect(columns.contentType).toBe(contentType)
        expect(columns.columns).toEqual(memexProjectColumnValues)
      }
    })

    it.each([
      {desc: 'items array is empty', items: []},
      {desc: 'items array is undefined', items: undefined},
    ])('should return default empty values if the initial $desc', ({items}) => {
      seedJSONIsland('memex-items-data', items)
      const {memexItems, memexColumnsByItemId} = buildInitialItemsAndColumns('memex-items-data', internalCache)

      expect(memexItems).toEqual([])
      expect(memexColumnsByItemId).toEqual(new Map())
    })

    it("should index an item's columns by the item id", () => {
      const items: Array<MemexItem> = [DefaultDraftIssue]
      seedJSONIsland('memex-items-data', items)
      const {memexItems, memexColumnsByItemId} = buildInitialItemsAndColumns('memex-items-data', internalCache)

      expect(memexItems).toEqual(items)
      expect(memexColumnsByItemId).toEqual(
        new Map(
          items.map(({id, contentType, memexProjectColumnValues}) => [
            id,
            {contentType, columns: memexProjectColumnValues},
          ]),
        ),
      )
    })
  })
})

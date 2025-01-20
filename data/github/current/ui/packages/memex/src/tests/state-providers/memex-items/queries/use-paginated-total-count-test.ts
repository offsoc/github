import {renderHook} from '@testing-library/react'

import {usePaginatedTotalCount} from '../../../../client/state-providers/memex-items/queries/use-paginated-total-count'
import {seedJSONIsland} from '../../../../mocks/server/mock-server'
import {buildSystemColumns} from '../../../factories/columns/system-column-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {TestAppContainer} from '../../../test-app-wrapper'
import {buildGroupedItemsResponse} from '../query-client-api/helpers'

describe(`usePaginatedTotalCount`, () => {
  it('returns 0 if memex_table_without_limits FF is disabled', () => {
    seedJSONIsland('memex-columns-data', buildSystemColumns())

    const {result} = renderHook(() => usePaginatedTotalCount(), {
      wrapper: TestAppContainer,
    })
    expect(result.current).toBe(0)
  })

  it('returns total count for items in the case that paginated-items-data is item-level', () => {
    const issues = [issueFactory.build(), issueFactory.build()]
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
    seedJSONIsland('memex-columns-data', buildSystemColumns())
    seedJSONIsland('memex-paginated-items-data', {
      nodes: [issues[0]],
      pageInfo: {hasNextPage: true, hasPreviousPage: false},
      totalCount: {value: 2, isApproximate: false},
    })
    const {result} = renderHook(() => usePaginatedTotalCount(), {
      wrapper: TestAppContainer,
    })
    expect(result.current).toBe(2)
  })

  it('returns total count for items in the case that paginated-items-data is group-level', () => {
    const issues = [issueFactory.build(), issueFactory.build()]
    const systemColumns = buildSystemColumns()
    const statusDatabaseId = systemColumns.find(c => c.id === 'Status')?.databaseId || 0
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])
    seedJSONIsland('memex-columns-data', systemColumns)
    seedJSONIsland('memex-views', [viewFactory.build({groupBy: [statusDatabaseId]})])
    seedJSONIsland(
      'memex-paginated-items-data',
      buildGroupedItemsResponse({
        groups: [
          {
            groupId: 'group1',
            items: [issues[0]],
            totalCountOfItemsInGroup: {value: 4, isApproximate: false},
          },
          {
            groupId: 'group2',
            items: [issues[1]],
            totalCountOfItemsInGroup: {value: 4, isApproximate: false},
          },
        ],
        totalCount: {value: 8, isApproximate: false},
      }),
    )

    const {result} = renderHook(() => usePaginatedTotalCount(), {
      wrapper: TestAppContainer,
    })
    expect(result.current).toBe(8)
  })
})

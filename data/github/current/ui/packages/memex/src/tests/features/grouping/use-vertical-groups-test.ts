import {renderHook} from '@testing-library/react'

import type {IterationConfiguration} from '../../../client/api/columns/contracts/iteration'
import {useVerticalGroups} from '../../../client/features/grouping/hooks/use-vertical-groups'
import {compareDescending} from '../../../client/helpers/iterations'
import type {EnabledFeatures} from '../../../mocks/generate-enabled-features-from-url'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {customColumnFactory} from '../../factories/columns/custom-column-factory'
import {buildSystemColumns} from '../../factories/columns/system-column-factory'
import {viewFactory} from '../../factories/views/view-factory'
import {TestAppContainer} from '../../test-app-wrapper'

const iterationColumn = customColumnFactory
  .iteration({
    configuration: {
      startDay: 1,
      duration: 7,
      iterations: [
        {startDate: '2025-08-04', title: 'Sprint 5', titleHtml: 'Sprint 5', duration: 7, id: '5'},
        {startDate: '2025-08-11', title: 'Sprint 6', titleHtml: 'Sprint 6', duration: 7, id: '6'},
      ],
      completedIterations: [
        {startDate: '2022-07-07', title: 'Sprint 1', titleHtml: 'Sprint 1', duration: 7, id: '1'},
        {startDate: '2022-07-14', title: 'Sprint 2', titleHtml: 'Sprint 2', duration: 7, id: '2'},
        {startDate: '2022-07-21', title: 'Sprint 3', titleHtml: 'Sprint 3', duration: 7, id: '3'},
        {startDate: '2022-07-28', title: 'Sprint 4', titleHtml: 'Sprint 4', duration: 7, id: '4'},
      ],
    },
  })
  .build({name: 'Sprint'})

const {iterations, completedIterations} = (iterationColumn.settings ?? {}).configuration as IterationConfiguration
const allIterations = iterations.concat(completedIterations)

describe('useVerticalGroups', () => {
  const setupBoardView = ({filter = '', reverseServerOrder = false, serverOrderFF = true} = {}) => {
    const enabledFeatures: Array<EnabledFeatures> = ['memex_table_without_limits']
    if (serverOrderFF) enabledFeatures.push('memex_mwl_server_group_order')
    if (reverseServerOrder) {
      allIterations.sort(compareDescending)
    }
    const pageInfo = {hasNextPage: false, hasPreviousPage: false}
    const noValueGroup = {
      groupMetadata: undefined,
      groupValue: '_noValue',
      groupId: 'no-value',
      totalCount: {value: 0, isApproximate: false},
    }
    const noValueGroupItems = {nodes: [], groupId: 'no-value', pageInfo}

    seedJSONIsland('memex-columns-data', buildSystemColumns().concat(iterationColumn))
    seedJSONIsland('memex-views', [
      viewFactory.board().build({
        verticalGroupBy: [iterationColumn.databaseId],
        filter,
      }),
    ])
    seedJSONIsland('memex-enabled-features', enabledFeatures)
    seedJSONIsland('memex-paginated-items-data', {
      groups: {
        nodes: [
          noValueGroup,
          ...allIterations.map(i => ({
            groupMetadata: i,
            groupValue: i.title,
            groupId: `groupId-${i.id}`,
            totalCount: {value: 0, isApproximate: false},
          })),
        ],
        pageInfo,
      },
      groupedItems: [
        noValueGroupItems,
        ...allIterations.map(i => ({
          groupId: `groupId-${i.id}`,
          nodes: [],
          pageInfo,
        })),
      ],
      secondaryGroups: null,
      totalCount: {value: allIterations.length, isApproximate: false},
    })
  }

  describe('with memex_table_without_limits and memex_mwl_server_group_order enabled', () => {
    it('does not truncate server-provided groups', () => {
      setupBoardView()
      const {result} = renderHook(() => useVerticalGroups(), {wrapper: TestAppContainer})
      const verticalGroups = result.current.groupByFieldOptions

      expect(verticalGroups).toHaveLength(allIterations.length + 1)
    })

    it('does not apply client-side filtering to server-provided groups', () => {
      setupBoardView({filter: 'sprint:"Sprint 1"'})
      const {result} = renderHook(() => useVerticalGroups(), {wrapper: TestAppContainer})
      const verticalGroups = result.current.groupByFieldOptions

      expect(verticalGroups).toHaveLength(allIterations.length + 1)
    })

    it('respects the server-side group order', () => {
      setupBoardView({reverseServerOrder: true})
      const {result} = renderHook(() => useVerticalGroups(), {wrapper: TestAppContainer})
      const verticalGroups = result.current.groupByFieldOptions

      expect(verticalGroups).toHaveLength(allIterations.length + 1)
      expect(verticalGroups?.map(group => group.name)).toEqual([
        'No Sprint',
        'Sprint 6',
        'Sprint 5',
        'Sprint 4',
        'Sprint 3',
        'Sprint 2',
        'Sprint 1',
      ])
    })
  })
  describe('with memex_mwl_server_group_order disabled', () => {
    it('respects the client-side option order', () => {
      setupBoardView({reverseServerOrder: true, serverOrderFF: false})
      const {result} = renderHook(() => useVerticalGroups(), {wrapper: TestAppContainer})
      const verticalGroups = result.current.groupByFieldOptions

      expect(verticalGroups).toHaveLength(6)
      expect(verticalGroups?.map(group => group.name)).toEqual([
        'No Sprint',
        'Sprint 2',
        'Sprint 3',
        'Sprint 4',
        'Sprint 5',
        'Sprint 6',
      ])
    })
  })
})

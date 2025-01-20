import {renderHook, waitFor} from '@testing-library/react'

import {MemexColumnDataType, SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {ItemType} from '../../client/api/memex-items/item-type'
import ToastContainer from '../../client/components/toasts/toast-container'
import {useLoadRequiredFieldsForChartConfiguration} from '../../client/hooks/use-load-required-fields'
import {ColumnsStateProvider} from '../../client/state-providers/columns/columns-state-provider'
import {ProjectNumberContext} from '../../client/state-providers/memex/memex-state-provider'
import {ProjectMigrationStateProvider} from '../../client/state-providers/project-migration/project-migration-state-provider'
import {autoFillColumnServerProps} from '../../mocks/data/columns'
import {createMockEnvironment} from '../create-mock-environment'
import {existingProject} from '../state-providers/memex/helpers'
import {QueryClientWrapper} from '../test-app-wrapper'

function createMockWrapper() {
  createMockEnvironment({
    jsonIslandData: {
      'memex-columns-data': autoFillColumnServerProps([
        {
          id: 1,
          databaseId: 1,
          name: 'loaded-column',
          position: -1,
          userDefined: true,
          defaultColumn: false,
          dataType: MemexColumnDataType.Text,
        },
        {
          id: 2,
          databaseId: 2,
          name: 'unloaded-column',
          position: -1,
          userDefined: true,
          defaultColumn: false,
          dataType: MemexColumnDataType.Text,
        },
        {
          id: SystemColumnId.Status,
          databaseId: 7,
          name: SystemColumnId.Status,
          position: -1,
          userDefined: true,
          defaultColumn: false,
          dataType: MemexColumnDataType.SingleSelect,
          settings: {
            options: [
              {
                id: 'single-select-value',
                nameHtml: 'option-name',
                name: 'option-name',
                description: 'Description',
                descriptionHtml: 'Description',
                color: 'BLUE',
              },
            ],
          },
        },
      ]),
      'memex-items-data': [
        {
          id: 4,
          priority: 4,
          updatedAt: new Date().toISOString(),
          contentType: ItemType.Issue,
          content: {
            id: 5,
            url: '',
          },
          contentRepositoryId: 1,
          memexProjectColumnValues: [
            {
              memexProjectColumnId: SystemColumnId.Status,
              value: {
                id: 'single-select-value',
              },
            },
            {
              memexProjectColumnId: 1,
              value: {
                raw: 'some-string',
                html: 'some-html-string',
              },
            },
          ],
        },
      ],
    },
  })
  return function MockWrapper({children}: {children: React.ReactNode}) {
    return (
      <QueryClientWrapper>
        <ProjectNumberContext.Provider value={existingProject()}>
          <ColumnsStateProvider>
            <ProjectMigrationStateProvider>
              <ToastContainer>{children}</ToastContainer>
            </ProjectMigrationStateProvider>
          </ColumnsStateProvider>
        </ProjectNumberContext.Provider>
      </QueryClientWrapper>
    )
  }
}

describe('useLoadRequiredFieldsForChartConfiguration', () => {
  it('returns an empty list and no loading state if all fields are loaded', () => {
    const config = {
      filter: '',
      type: 'bar' as const,
      xAxis: {
        dataSource: {
          column: 'time' as const,
        },
      },
      yAxis: {aggregate: {operation: 'count' as const}},
    }

    const {result} = renderHook(() => useLoadRequiredFieldsForChartConfiguration(config), {
      wrapper: createMockWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.missingFieldIds).toEqual([])
  })
  it('returns a list of fields to load and loading state if some xAxis.dataSource.column are not loaded, then loads them and returns to the default state when a the fields are loaded', async () => {
    const config = {
      filter: '',
      type: 'bar' as const,
      xAxis: {
        dataSource: {
          column: 2,
        },
      },
      yAxis: {aggregate: {operation: 'count' as const}},
    }

    const {result} = renderHook(() => useLoadRequiredFieldsForChartConfiguration(config), {
      wrapper: createMockWrapper(),
    })

    expect(result.current.isLoading).toEqual(true)
    expect(result.current.missingFieldIds).toEqual([2])

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
  it('returns a list of fields to load and loading state if some xAxis.groupBy columns are not loaded, then loads them and returns to the default state when a the fields are loaded', async () => {
    const config = {
      filter: '',
      type: 'bar' as const,
      xAxis: {
        dataSource: {
          column: 'time' as const,
        },
        groupBy: {
          column: 2,
        },
      },
      yAxis: {aggregate: {operation: 'count' as const}},
    }
    const {result} = renderHook(() => useLoadRequiredFieldsForChartConfiguration(config), {
      wrapper: createMockWrapper(),
    })

    expect(result.current.isLoading).toEqual(true)
    expect(result.current.missingFieldIds).toEqual([2])

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
  it('returns a list of fields to load and loading state if some aggregated columns are not loaded, then loads them and returns to the default state when a the fields are loaded', async () => {
    const config = {
      filter: '',
      type: 'bar' as const,
      xAxis: {
        dataSource: {
          column: 'time' as const,
        },
      },
      yAxis: {aggregate: {operation: 'count' as const, columns: [2]}},
    }

    const {result} = renderHook(() => useLoadRequiredFieldsForChartConfiguration(config), {
      wrapper: createMockWrapper(),
    })

    expect(result.current.isLoading).toEqual(true)
    expect(result.current.missingFieldIds).toEqual([2])

    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('returns whether a config is invalid and if it is, does not load missing fields', async () => {
    const config = {
      filter: '',
      type: 'bar' as const,
      xAxis: {
        dataSource: {
          column: 2,
        },
      },
      yAxis: {aggregate: {operation: 'count' as const, columns: [300001]}},
    }

    const {result} = renderHook(() => useLoadRequiredFieldsForChartConfiguration(config), {
      wrapper: createMockWrapper(),
    })

    expect(result.current.isValid).toBe(false)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })
})

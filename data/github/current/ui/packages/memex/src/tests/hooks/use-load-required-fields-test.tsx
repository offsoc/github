import {act, renderHook} from '@testing-library/react'

import {
  type MemexColumn,
  type MemexProjectColumnId,
  SystemColumnId,
} from '../../client/api/columns/contracts/memex-column'
import ToastContainer from '../../client/components/toasts/toast-container'
import {useFindMissingColumnIds, useLoadColumnsWithItemColumnValues} from '../../client/hooks/use-load-required-fields'
import {useUpdateColumnValues} from '../../client/state-providers/memex-items/use-update-column-values'
import {DefaultColumns} from '../../mocks/mock-data'
import {seedJSONIsland} from '../../mocks/server/mock-server'
import {stubGetColumnsFn} from '../mocks/api/columns'
import {createColumnsStableContext, stubLoadedFieldIdsRef} from '../mocks/state-providers/columns-stable-context'
import {asMockHook} from '../mocks/stub-utilities'
import {createWrapperWithColumnsStableContext} from '../state-providers/columns/helpers'

jest.mock('../../client/state-providers/memex-items/use-update-column-values')

const addToastStub = jest.fn()
jest.mock('../../client/components/toasts/use-toasts-internal', () => {
  return () => ({
    addToast: addToastStub,
    getToastProps: () => ({}),
  })
})

function createWrapper() {
  const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
    <ToastContainer>{children}</ToastContainer>
  )

  return wrapper
}

describe('useFindMissingColumnIds', () => {
  it('only returns ids where there is no column data loaded yet', () => {
    // Tell the ColumnsStableContext that we don't have data for column with id 10,
    // so that it appears in our list of missing ids
    const loadedFieldIdsRefStub = stubLoadedFieldIdsRef(new Set([20, 30, SystemColumnId.Status]))

    const {result} = renderHook(() => useFindMissingColumnIds(), {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({loadedFieldIdsRef: loadedFieldIdsRefStub}),
      ),
    })

    let missingIds: Array<MemexProjectColumnId> | undefined = undefined
    act(() => {
      missingIds = result.current.findMissingColumnIds([10, 20, 30])
    })

    expect(missingIds).toBeDefined()
    expect(missingIds).toHaveLength(1)
    expect(missingIds![0]).toEqual(10)
  })

  it('includes SystemColumnId.Status id in ids searched', () => {
    // Tell the ColumnsStableContext that we don't have data for column with id Status,
    // so that it appears in our list of missing ids
    const loadedFieldIdsRefStub = stubLoadedFieldIdsRef(new Set([10, 20, 30]))

    const {result} = renderHook(() => useFindMissingColumnIds(), {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({loadedFieldIdsRef: loadedFieldIdsRefStub}),
      ),
    })

    let missingIds: Array<MemexProjectColumnId> | undefined = undefined
    act(() => {
      missingIds = result.current.findMissingColumnIds([10, 20, 30])
    })

    expect(missingIds).toBeDefined()
    expect(missingIds).toHaveLength(1)
    expect(missingIds![0]).toEqual(SystemColumnId.Status)
  })

  it('does not duplicate ids in returned array even when SystemColumnId.Status is explicitly passed to function', () => {
    // Tell the ColumnsStableContext that we don't have data for column with id Status,
    // so that it appears in our list of missing ids
    const loadedFieldIdsRefStub = stubLoadedFieldIdsRef(new Set([10, 20, 30]))

    const {result} = renderHook(() => useFindMissingColumnIds(), {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({loadedFieldIdsRef: loadedFieldIdsRefStub}),
      ),
    })

    let missingIds: Array<MemexProjectColumnId> | undefined = undefined
    act(() => {
      missingIds = result.current.findMissingColumnIds([10, 20, 30, SystemColumnId.Status])
    })

    expect(missingIds).toBeDefined()
    expect(missingIds).toHaveLength(1)
    expect(missingIds![0]).toEqual(SystemColumnId.Status)
  })
})

describe('useLoadColumnsWithItemColumnValues', () => {
  it('does not call client or memex items store if no ids are passed', async () => {
    const getColumnsStub = stubGetColumnsFn([])
    const updateColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

    const {result} = renderHook(() => useLoadColumnsWithItemColumnValues(), {wrapper: createWrapper()})
    await act(async () => {
      await result.current.loadColumnsWithItemColumnValues([])
    })

    expect(getColumnsStub).not.toHaveBeenCalled()
    expect(updateColumnValuesStub).not.toHaveBeenCalled()
  })

  it('calls useUpdateColumnValues hook for each column returned by api client', async () => {
    const getColumnsStub = stubGetColumnsFn([DefaultColumns[0]])
    const updateAllColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateAllColumnValues: updateAllColumnValuesStub})

    const {result} = renderHook(() => useLoadColumnsWithItemColumnValues(), {wrapper: createWrapper()})
    await act(async () => {
      await result.current.loadColumnsWithItemColumnValues([1])
    })

    expect(getColumnsStub).toHaveBeenCalled()
    expect(updateAllColumnValuesStub).toHaveBeenCalledWith(DefaultColumns[0])
  })

  it('adds toast when partial failures returned by api client', async () => {
    const column: MemexColumn = {
      dataType: 'trackedBy',
      id: 'Tracked by',
      name: 'Tracked by',
      position: 10,
      userDefined: false,
      defaultColumn: true,
      settings: {},
      databaseId: 10,
      partialFailures: {
        message: 'We encountered a problem retrieving the "Tracked by" data. Please try again later.',
      },
    }
    const getColumnsStub = stubGetColumnsFn([column])
    const updateAllColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateAllColumnValues: updateAllColumnValuesStub})

    const {result} = renderHook(() => useLoadColumnsWithItemColumnValues(), {wrapper: createWrapper()})
    await act(async () => {
      await result.current.loadColumnsWithItemColumnValues([1])
    })

    expect(getColumnsStub).toHaveBeenCalled()
    expect(updateAllColumnValuesStub).toHaveBeenCalledWith(column)
    expect(addToastStub).toHaveBeenCalledTimes(1)
  })

  it('skips api request when memex_mwl_limited_field_ids and memex_table_without_limits are enabled', async () => {
    seedJSONIsland('memex-enabled-features', ['memex_mwl_limited_field_ids', 'memex_table_without_limits'])
    const getColumnsStub = stubGetColumnsFn([DefaultColumns[0]])
    const updateAllColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateAllColumnValues: updateAllColumnValuesStub})

    const {result} = renderHook(() => useLoadColumnsWithItemColumnValues(), {wrapper: createWrapper()})
    await act(async () => {
      await result.current.loadColumnsWithItemColumnValues([1])
    })

    expect(getColumnsStub).not.toHaveBeenCalled()
    expect(updateAllColumnValuesStub).not.toHaveBeenCalled()
  })
})

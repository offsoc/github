import {act, renderHook} from '@testing-library/react'

import {createColumnModel} from '../../../client/models/column-model'
import {useSetColumnName} from '../../../client/state-providers/columns/use-set-column-name'
import {customSingleSelectColumn, titleColumn} from '../../../mocks/data/columns'
import {stubUpdateColumn} from '../../mocks/api/columns'
import {stubAllColumnsRefWithColumnModels, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext} from './helpers'

describe('useSetColumName', () => {
  describe('setName', () => {
    it('should update the name of a user-defined column', () => {
      const column = createColumnModel(customSingleSelectColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useSetColumnName, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      act(() => {
        result.current.setName(column, 'Updated Name')
      })

      for (const stub of [updateColumnStub]) {
        expect(stub).not.toHaveBeenCalled()
      }

      expect(setAllColumnsStub).toHaveBeenCalledTimes(1)

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      expect(nextState.name).toBe('Updated Name')
    })

    it('should ignore a state update for a system-defined column', () => {
      const column = createColumnModel(titleColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useSetColumnName, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      act(() => {
        result.current.setName(column, 'Updated Name')
      })

      for (const stub of [updateColumnStub, setAllColumnsStub]) {
        expect(stub).not.toHaveBeenCalled()
      }

      expect(column.name).not.toBe('Updated Name')
    })

    it('should ignore a state update if the new name of the column is the same as the current name', () => {
      const newName = customSingleSelectColumn.name

      const column = createColumnModel(customSingleSelectColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useSetColumnName, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      act(() => {
        expect(result.current.setName(column, newName)).toBeFalsy()
      })

      for (const stub of [setAllColumnsStub, updateColumnStub]) {
        expect(stub).not.toHaveBeenCalled()
      }

      expect(column.name).toBe(customSingleSelectColumn.name)
    })
  })

  describe('updateName', () => {
    it('should update the name of a user-defined column server side', async () => {
      const column = createColumnModel(customSingleSelectColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useSetColumnName, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      await act(async () => {
        const setColumnNamePromise = result.current.updateName(column, 'Updated Name')

        // test the synchronous optimistic update
        const [nextState] = setAllColumnsStub.mock.calls[0][0]
        expect(nextState.name).toBe('Updated Name')

        await setColumnNamePromise
      })

      for (const stub of [setAllColumnsStub, updateColumnStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      const [nextState] = setAllColumnsStub.mock.calls[0][0]

      expect(nextState.name).toBe('Updated Name')
      expect(updateColumnStub).toHaveBeenCalledWith({
        memexProjectColumnId: column.id,
        name: 'Updated Name',
      })
    })

    it('should ignore a state update for a system-defined column', async () => {
      const column = createColumnModel(titleColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useSetColumnName, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      await act(async () => {
        await result.current.updateName(column, 'Updated Name')
      })

      for (const stub of [setAllColumnsStub, updateColumnStub]) {
        expect(stub).not.toHaveBeenCalled()
      }

      expect(column.name).not.toBe('Updated Name')
    })

    it('should ignore a state update if the new name of the column is the same as the current name', async () => {
      const newName = customSingleSelectColumn.name

      const column = createColumnModel(customSingleSelectColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useSetColumnName, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      await act(async () => {
        await result.current.updateName(column, newName)
      })

      for (const stub of [setAllColumnsStub, updateColumnStub]) {
        expect(stub).not.toHaveBeenCalled()
      }

      expect(column.name).toBe(customSingleSelectColumn.name)
    })
  })
})

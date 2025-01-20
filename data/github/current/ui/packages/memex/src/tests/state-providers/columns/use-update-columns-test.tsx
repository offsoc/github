import {act, renderHook} from '@testing-library/react'

import {type ColumnModel, createColumnModel} from '../../../client/models/column-model'
import {useUpdateColumns} from '../../../client/state-providers/columns/use-update-columns'
import {DefaultColumns} from '../../../mocks/mock-data'
import {stubAllColumnsRefWithColumnModels, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {createWrapperWithColumnsStableContext, expectMockWasCalledWithColumns} from './helpers'

function getOptions(columnModel: ColumnModel) {
  if ('options' in columnModel.settings) return columnModel.settings.options
  throw new Error('Column model does not have options')
}

describe('useUpdateColumns', () => {
  describe('updateColumns', () => {
    it('replaces columns with incoming columns as models', () => {
      const setAllColumnsStub = stubSetAllColumnsFn()

      const {result} = renderHook(useUpdateColumns, {
        wrapper: createWrapperWithColumnsStableContext(createColumnsStableContext({setAllColumns: setAllColumnsStub})),
      })

      act(() => {
        result.current.updateColumns([DefaultColumns[0]])
      })

      expectMockWasCalledWithColumns(setAllColumnsStub, [DefaultColumns[0]])
    })
  })

  describe('updateColumnEntry', () => {
    it('updates a column entry in the list of columns', () => {
      const columnModel = createColumnModel(DefaultColumns[0])
      const assigneesColumnModel = createColumnModel(DefaultColumns[1])
      const allColumnsStub = stubAllColumnsRefWithColumnModels([assigneesColumnModel, columnModel])

      const setAllColumnsStub = stubSetAllColumnsFn()

      const {result} = renderHook(useUpdateColumns, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        ),
      })

      const newColumn = createColumnModel({...columnModel, settings: {...columnModel.settings, options: []}})

      expect(() => getOptions(columnModel)).toThrow()

      act(() => {
        result.current.updateColumnEntry(newColumn)
      })

      expectMockWasCalledWithColumns(setAllColumnsStub, [assigneesColumnModel, newColumn])

      expect(setAllColumnsStub).toHaveBeenCalled()
    })
  })
})

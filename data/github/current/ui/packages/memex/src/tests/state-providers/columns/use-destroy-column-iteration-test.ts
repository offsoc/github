import {act, renderHook} from '@testing-library/react'

import type {MemexColumn} from '../../../client/api/columns/contracts/memex-column'
import {IterationColumnModel} from '../../../client/models/column-model/custom/iteration'
import {useDestroyColumnIteration} from '../../../client/state-providers/columns/use-destroy-column-iteration'
import {useUpdateColumnValues} from '../../../client/state-providers/memex-items/use-update-column-values'
import {createColumn, createCustomIterationColumn} from '../../../mocks/data/columns'
import {stubUpdateColumn} from '../../mocks/api/columns'
import {generateIterationConfiguration} from '../../mocks/models/iteration-configuration'
import {stubAllColumnsRefWithColumnModels, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {asMockHook} from '../../mocks/stub-utilities'
import {assertIterationColumnModel} from '../../models/column-model'
import {createWrapperWithColumnsStableContext} from './helpers'

jest.mock('../../../client/state-providers/memex-items/use-update-column-values')

describe('useDestroyColumnIteration', () => {
  let column: IterationColumnModel
  let memexColumn: MemexColumn

  beforeEach(() => {
    memexColumn = createCustomIterationColumn()
    column = new IterationColumnModel(createColumn(memexColumn))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('destroyColumnIteration', () => {
    it('should remove the specified iteration from the iterations configuration', async () => {
      const iterationIdToDestroy = 'iteration-5'

      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const {configuration} = memexColumn.settings!

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({
        updateColumnValues: updateColumnValuesStub,
      })

      const expectedIterations = configuration!.iterations.filter(i => i.id !== iterationIdToDestroy)

      const updateColumnStub = stubUpdateColumn({
        ...memexColumn,
        settings: {
          configuration: generateIterationConfiguration(column.settings.configuration, {
            ...configuration!,
            iterations: expectedIterations,
          }),
        },
      })

      const {result} = renderHook(useDestroyColumnIteration, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      expect(column.settings.configuration?.iterations.length).toBe(3)
      expect(column.settings.configuration?.iterations[1].title).toBe('Iteration 5')

      await act(async () => {
        await result.current.destroyColumnIteration(column, iterationIdToDestroy)
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalled()
      }

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertIterationColumnModel(nextState)
      expect(nextState.settings.configuration?.iterations.length).toBe(2)
      expect(nextState.settings.configuration?.iterations[1].title).not.toBe('Iteration 5')
      expect(nextState.settings.configuration?.iterations).toEqual(expectedIterations)
    })

    it('should ignore state updates if the settings configuration is not defined', async () => {
      memexColumn.settings = {}

      column = new IterationColumnModel(createColumn(memexColumn))

      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useDestroyColumnIteration, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      await act(async () => {
        // iteration id is a valid id but we expect the iteration not to be removed
        await result.current.destroyColumnIteration(column, 'iteration-5')
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })

    it('should ignore state updates if the iteration to destroy is not found', async () => {
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const updateColumnStub = stubUpdateColumn(column)

      const {result} = renderHook(useDestroyColumnIteration, {
        wrapper: createWrapperWithColumnsStableContext(
          createColumnsStableContext({
            allColumnsRef: allColumnsStub,
            setAllColumns: setAllColumnsStub,
          }),
        ),
      })

      await act(async () => {
        await result.current.destroyColumnIteration(column, 'iteration-not-to-be-found')
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })
  })
})

import {act, renderHook} from '@testing-library/react'

import {IterationColumnModel} from '../../../client/models/column-model/custom/iteration'
import {useUpdateColumnIterationTitle} from '../../../client/state-providers/columns/use-update-column-iteration-title'
import {useUpdateColumnValues} from '../../../client/state-providers/memex-items/use-update-column-values'
import {createColumn, createCustomIterationColumn, customIterationColumn} from '../../../mocks/data/columns'
import {stubUpdateColumn} from '../../mocks/api/columns'
import {generateIterationConfiguration} from '../../mocks/models/iteration-configuration'
import {stubAllColumnsRefWithColumnModels, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {asMockHook} from '../../mocks/stub-utilities'
import {assertIterationColumnModel} from '../../models/column-model'
import {createWrapperWithContexts} from '../../wrapper-utils'
import {initQueryClient} from '../memex-items/query-client-api/helpers'

jest.mock('../../../client/state-providers/memex-items/use-update-column-values')

describe('useUpdateColumnIterationTitle', () => {
  let column: IterationColumnModel

  beforeEach(() => {
    const memexColumn = createCustomIterationColumn()
    column = new IterationColumnModel(createColumn(memexColumn))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateColumnIterationTitle', () => {
    it('should update an iteration title', async () => {
      const queryClient = initQueryClient()
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const {configuration} = customIterationColumn.settings!

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const updateColumnStub = stubUpdateColumn({
        ...customIterationColumn,
        settings: {
          configuration: generateIterationConfiguration(column.settings.configuration, {
            ...configuration!,
            iterations: [
              {
                ...configuration!.iterations[0],
                title: 'New Iteration 4',
              },
              ...configuration!.iterations.slice(1),
            ],
          }),
        },
      })

      const {result} = renderHook(useUpdateColumnIterationTitle, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      expect(column.settings.configuration?.iterations[0].title).toBe('Iteration 4')
      expect(column.settings.configuration?.iterations[0].titleHtml).toBe('Iteration 4')

      let updateColumnIterationTitlePromise!: Promise<void>

      act(() => {
        updateColumnIterationTitlePromise = result.current.updateColumnIterationTitle(column, {
          id: 'iteration-4',
          name: 'New Iteration 4',
        })
      })
      // test the synchronous optimistic update
      expect(column.settings.configuration?.iterations[0].title).toBe('New Iteration 4')

      await updateColumnIterationTitlePromise

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      // test the values from the server are persisted on the column
      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertIterationColumnModel(nextState)
      const {iterations} = nextState.settings.configuration

      expect(iterations[0].title).toBe('New Iteration 4')
      expect(iterations[0].titleHtml).toBe('New Iteration 4')
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should ignore a state update if the iteration to update is not found', async () => {
      const queryClient = initQueryClient()
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const updateColumnStub = stubUpdateColumn({...customIterationColumn})

      const {result} = renderHook(useUpdateColumnIterationTitle, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      await act(async () => {
        await result.current.updateColumnIterationTitle(column, {
          id: 'non existent iteration',
          name: 'New Iteration 4',
        })
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).not.toHaveBeenCalled()
      }

      const {iterations} = column.settings.configuration
      expect(iterations[0].title).toBe('Iteration 4')
      expect(iterations[0].titleHtml).toBe('Iteration 4')
    })
  })
})

import {act, renderHook} from '@testing-library/react'

import type {IterationConfiguration} from '../../../client/api/columns/contracts/iteration'
import {createColumnModel} from '../../../client/models/column-model'
import {IterationColumnModel} from '../../../client/models/column-model/custom/iteration'
import {useUpdateIterationConfiguration} from '../../../client/state-providers/columns/use-update-iteration-configuration'
import {useUpdateColumnValues} from '../../../client/state-providers/memex-items/use-update-column-values'
import {customIterationColumn} from '../../../mocks/data/columns'
import {DefaultColumns} from '../../../mocks/mock-data'
import {omit} from '../../../utils/omit'
import {stubUpdateColumn} from '../../mocks/api/columns'
import {generateIterationConfiguration} from '../../mocks/models/iteration-configuration'
import {stubAllColumnsRefWithColumnModels, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {asMockHook} from '../../mocks/stub-utilities'
import {assertIterationColumnModel} from '../../models/column-model'
import {createWrapperWithColumnsStableContext} from './helpers'

jest.mock('../../../client/state-providers/memex-items/use-update-column-values')

describe('updateIterationConfiguration', () => {
  let iterationChange: IterationConfiguration

  beforeEach(() => {
    iterationChange = {
      startDay: 3,
      duration: 14,
      iterations: [
        {
          title: 'Aardvark Iteration',
          startDate: '2022-01-27',
          duration: 13,
          id: 'iteration_option_0',
          titleHtml: 'Iteration 1',
        },
        {
          title: 'Iteration 2',
          startDate: '2022-02-09',
          duration: 14,
          id: 'iteration_option_1',
          titleHtml: 'Iteration 2',
        },
        {
          title: 'Iteration 3',
          startDate: '2022-02-23',
          duration: 14,
          id: 'iteration_option_2',
          titleHtml: 'Iteration 3',
        },
      ],
      completedIterations: [],
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should update iterations with a new configuration, removing "titleHtml" as part of the request', async () => {
    const columnModel = new IterationColumnModel(customIterationColumn)
    const allColumnsStub = stubAllColumnsRefWithColumnModels([columnModel])
    const setAllColumnsStub = stubSetAllColumnsFn()

    const updateColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

    const updateColumnStub = stubUpdateColumn({
      ...customIterationColumn,
      settings: {
        configuration: generateIterationConfiguration(columnModel.settings.configuration, iterationChange),
      },
    })

    const {result} = renderHook(useUpdateIterationConfiguration, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
      ),
    })

    expect(columnModel.settings.configuration).toMatchObject(customIterationColumn.settings!.configuration!)

    await act(async () => {
      await result.current.updateIterationConfiguration(columnModel, iterationChange)
    })

    for (const stub of [updateColumnStub, updateColumnValuesStub]) {
      expect(stub).toHaveBeenCalled()
    }

    const {iterations, completedIterations} = iterationChange
    const [nextState] = setAllColumnsStub.mock.calls[0][0]
    assertIterationColumnModel(nextState)
    expect(nextState.settings.configuration?.completedIterations).toEqual([])
    expect(nextState.settings.configuration?.iterations[0]).toEqual({
      title: 'Aardvark Iteration',
      startDate: '2022-01-27',
      duration: 13,
      id: 'iteration_option_0',
      titleHtml: 'Aardvark Iteration',
    })
    expect(updateColumnStub).toHaveBeenCalledWith({
      memexProjectColumnId: 20,
      settings: {
        configuration: {
          completedIterations: completedIterations.map(i => omit(i, ['titleHtml'])),
          iterations: iterations.map(i => omit(i, ['titleHtml'])),
          duration: 14,
          startDay: 3,
        },
      },
    })
  })

  it('should update an iteration that had no default configuration', async () => {
    const columnModel = new IterationColumnModel({...customIterationColumn, settings: {}})
    const allColumnsStub = stubAllColumnsRefWithColumnModels([columnModel])
    const setAllColumnsStub = stubSetAllColumnsFn()

    const updateColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

    const updateColumnStub = stubUpdateColumn({
      ...customIterationColumn,
      settings: {
        configuration: generateIterationConfiguration(columnModel.settings.configuration, iterationChange),
      },
    })
    const {result} = renderHook(useUpdateIterationConfiguration, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
      ),
    })

    await act(async () => {
      await result.current.updateIterationConfiguration(columnModel, iterationChange)
    })

    for (const stub of [updateColumnStub, updateColumnValuesStub]) {
      expect(stub).toHaveBeenCalled()
    }

    const {iterations, completedIterations} = iterationChange
    const [nextState] = setAllColumnsStub.mock.calls[0][0]
    assertIterationColumnModel(nextState)
    expect(nextState.settings.configuration.completedIterations).toEqual([])
    expect(nextState.settings.configuration.iterations).toEqual(
      iterationChange.iterations.map(i => ({...i, titleHtml: i.title})),
    )
    expect(updateColumnStub).toHaveBeenCalledWith({
      memexProjectColumnId: 20,
      settings: {
        configuration: {
          completedIterations: completedIterations.map(i => omit(i, ['titleHtml'])),
          iterations: iterations.map(i => omit(i, ['titleHtml'])),
          duration: 14,
          startDay: 3,
        },
      },
    })
  })

  it('should ignore an update if the column is not an iteration column', async () => {
    const columnModel = createColumnModel(DefaultColumns[0])
    const allColumnsStub = stubAllColumnsRefWithColumnModels([columnModel])
    const setAllColumnsStub = stubSetAllColumnsFn()

    const updateColumnStub = stubUpdateColumn(DefaultColumns[0])

    const updateColumnValuesStub = jest.fn()
    asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

    const {result} = renderHook(useUpdateIterationConfiguration, {
      wrapper: createWrapperWithColumnsStableContext(
        createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
      ),
    })

    await act(async () => {
      await result.current.updateIterationConfiguration(columnModel, iterationChange)
    })

    for (const stub of [updateColumnStub, updateColumnValuesStub]) {
      expect(stub).not.toHaveBeenCalled()
    }
  })
})

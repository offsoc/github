import {act, renderHook} from '@testing-library/react'

import {emptySingleSelectOption} from '../../../client/helpers/new-column'
import {type ColumnModel, createColumnModel} from '../../../client/models/column-model'
import {SingleSelectColumnModel} from '../../../client/models/column-model/custom/single-select'
import {useUpdateOptions} from '../../../client/state-providers/columns/use-update-options'
import {useUpdateColumnValues} from '../../../client/state-providers/memex-items/use-update-column-values'
import {customSingleSelectColumn} from '../../../mocks/data/columns'
import {aardvarkOptions} from '../../../mocks/data/single-select'
import {omit} from '../../../utils/omit'
import {stubAddOption, stubDestroyOption, stubUpdateColumn, stubUpdateOption} from '../../mocks/api/columns'
import {
  addOptionAtPosition,
  createColumnWithOptions,
  createOptions,
  destroyOptionById,
} from '../../mocks/models/column-options'
import {stubAllColumnsRefWithColumnModels, stubSetAllColumnsFn} from '../../mocks/state-providers/columns-context'
import {createColumnsStableContext} from '../../mocks/state-providers/columns-stable-context'
import {asMockHook} from '../../mocks/stub-utilities'
import {assertSingleSelectColumnModel} from '../../models/column-model'
import {createWrapperWithContexts} from '../../wrapper-utils'
import {initQueryClient} from '../memex-items/query-client-api/helpers'

jest.mock('../../../client/state-providers/memex-items/use-update-column-values')

describe('useUpdateOptions', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('updateOptions', () => {
    it.each([
      {
        action: 'add new options',
        initialOptions: [],
        expectedOptions: [
          {id: '1234', ...emptySingleSelectOption, name: 'first'},
          {id: '5678', ...emptySingleSelectOption, name: 'second'},
        ],
      },
      {
        action: 'update options',
        initialOptions: [
          {id: '1234', ...emptySingleSelectOption, name: 'first'},
          {id: '5678', ...emptySingleSelectOption, name: 'second'},
        ],
        expectedOptions: [
          {id: '1234', ...emptySingleSelectOption, name: 'third'},
          {id: '5678', ...emptySingleSelectOption, name: 'fourth'},
        ],
      },
      {
        action: 'reorder options',
        initialOptions: [
          {
            nameHtml: 'first',
            id: '1234',
            ...emptySingleSelectOption,
            name: 'first',
          },
          {
            nameHtml: 'second',
            id: '5678',
            ...emptySingleSelectOption,
            name: 'second',
          },
        ],
        expectedOptions: [
          {
            id: '5678',
            ...emptySingleSelectOption,
            name: 'banana',
          },
          {...emptySingleSelectOption, name: 'cherry'},
          {
            id: '1234',
            ...emptySingleSelectOption,
            name: 'apple',
          },
        ],
      },
      {
        action: 'clear options',
        initialOptions: [
          {id: '1234', ...emptySingleSelectOption, name: 'first'},
          {id: '5678', ...emptySingleSelectOption, name: 'second'},
        ],
        expectedOptions: [],
      },
    ])('should $action for a column', async ({initialOptions, expectedOptions}) => {
      const queryClient = initQueryClient()
      const column = new SingleSelectColumnModel(createColumnWithOptions(initialOptions))

      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()
      const updateColumnStub = stubUpdateColumn(createColumnWithOptions(expectedOptions))

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      await act(async () => {
        await result.current.updateOptions(column, expectedOptions)
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      expect(updateColumnStub).toHaveBeenCalledWith({
        memexProjectColumnId: 55,
        settings: {
          width: 200,
          options: expectedOptions,
        },
      })

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options).toMatchObject(expectedOptions)
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should update project items when column options are updated', async () => {
      const queryClient = initQueryClient()
      const column = new SingleSelectColumnModel(createColumnWithOptions([]))

      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const options = [
        {id: '1234', ...emptySingleSelectOption, name: 'first'},
        {id: '5678', ...emptySingleSelectOption, name: 'second'},
      ]

      const expectedColumnWithOptions = createColumnWithOptions(options)
      const updateColumnStub = stubUpdateColumn(expectedColumnWithOptions)
      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      await act(async () => {
        await result.current.updateOptions(column, options)
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options).toMatchObject(options)
      expect(updateColumnValuesStub).toHaveBeenCalledWith(expectedColumnWithOptions)
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should only update options with populated "names", ignoring empty values and removing them as part of the request', async () => {
      const queryClient = initQueryClient()
      const options = [
        {...emptySingleSelectOption, name: 'first'},
        {...emptySingleSelectOption, name: 'second'},
        {...emptySingleSelectOption, name: 'third'},
      ]
      const column = new SingleSelectColumnModel(createColumnWithOptions(options))

      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()
      const updateColumnStub = stubUpdateColumn(
        createColumnWithOptions(options.map((o, i) => (i === 1 ? o : {...o, name: `${o.name} opt`}))),
      )

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      const first = {id: '1', ...emptySingleSelectOption, name: 'first opt'}
      const third = {id: '2', ...emptySingleSelectOption, name: 'third opt'}

      await act(async () => {
        await result.current.updateOptions(column, [first, {id: '1', ...emptySingleSelectOption, name: ''}, third])
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      /**
       * List of options to update, should remove options with
       * empty option `name` as part of the request in this case
       * option with id of `1` is excluded
       */
      expect(updateColumnStub).toHaveBeenCalledWith({
        memexProjectColumnId: 55,
        settings: {
          width: 200,
          options: [first, third],
        },
      })

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options).toHaveLength(3)
      expect(nextState.settings.options).toMatchObject([{name: 'first opt'}, {name: 'second'}, {name: 'third opt'}])
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should remove "nameHtml" as part of the option update request', async () => {
      const queryClient = initQueryClient()
      const column = new SingleSelectColumnModel(createColumnWithOptions([{...emptySingleSelectOption, name: 'first'}]))

      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()
      const updateColumnStub = stubUpdateColumn(createColumnWithOptions([{...emptySingleSelectOption, name: 'second'}]))

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })
      assertSingleSelectColumnModel(column)
      const optionToUpdate = column.settings.options[0]
      expect(optionToUpdate).toEqual({
        id: '1',
        name: 'first',
        nameHtml: 'first',
        color: 'GRAY',
        description: '',
        descriptionHtml: '',
      })

      await act(async () => {
        await result.current.updateOptions(column, [
          {
            ...optionToUpdate,
            name: 'second',
          },
        ])
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      /**
       * List of options to update, should not include `nameHtml`
       * as part of the API request
       */
      expect(updateColumnStub).toHaveBeenCalledWith({
        memexProjectColumnId: 55,
        settings: {
          width: 200,
          options: [{id: '1', name: 'second', description: '', color: 'GRAY'}],
        },
      })

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options).toEqual([
        {id: '1', name: 'second', nameHtml: 'second', color: 'GRAY', description: '', descriptionHtml: ''},
      ])
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should set the option id to an empty string if the value of the option id matches "single-select-option"', async () => {
      const queryClient = initQueryClient()
      const singleSelectId = 'single-select-option'
      const column = new SingleSelectColumnModel(
        createColumnWithOptions([{id: singleSelectId, ...emptySingleSelectOption, name: 'first'}]),
      )
      assertSingleSelectColumnModel(column)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()
      const updateColumnStub = stubUpdateColumn(createColumnWithOptions([{...emptySingleSelectOption, name: 'second'}]))

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      const optionToUpdate = column.settings.options[0]
      expect(optionToUpdate).toEqual({
        id: singleSelectId,
        name: 'first',
        nameHtml: 'first',
        color: 'GRAY',
        description: '',
        descriptionHtml: '',
      })

      await act(async () => {
        await result.current.updateOptions(column, [
          {
            ...optionToUpdate,
            name: 'second',
          },
        ])
      })

      for (const stub of [updateColumnStub, setAllColumnsStub, updateColumnValuesStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      /**
       * The option to update should not contain `'single-select-option'`
       * as part of the request
       */
      expect(updateColumnStub).toHaveBeenCalledWith({
        memexProjectColumnId: 55,
        settings: {
          width: 200,
          options: [{id: '', name: 'second', description: '', color: 'GRAY'}],
        },
      })

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options).toEqual([
        {id: '1', name: 'second', nameHtml: 'second', color: 'GRAY', description: '', descriptionHtml: ''},
      ])
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })
  })

  describe('addColumnOption', () => {
    it('should add a new option to a column', async () => {
      const queryClient = initQueryClient()
      const column = new SingleSelectColumnModel(createColumnWithOptions([]))
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const expectedOption = {...emptySingleSelectOption, name: 'newAardvark'}
      const addOptionStub = stubAddOption(createColumnWithOptions([expectedOption]))

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      await act(async () => {
        await result.current.addColumnOption(column, expectedOption)
      })

      expect(setAllColumnsStub).toHaveBeenCalledTimes(2)
      expect(addOptionStub).toHaveBeenCalledTimes(1)

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options[0]).toMatchObject(expectedOption)
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it.each([
      {
        condition: 'new option with no position to the end',
        newOption: {name: 'newAardvark', description: 'New Aardvark', color: 'GRAY'},
      },
      // option positions are 1-indexed, therefore the following case should insert at the beginning
      {
        condition: 'new option with a position at the correct location',
        newOption: {name: 'newAardvark', position: 1, description: 'New Aardvark', color: 'GRAY'},
      },
    ] as const)('should add a $condition of the options array', async ({newOption}) => {
      const queryClient = initQueryClient()
      const column = new SingleSelectColumnModel(createColumnWithOptions([]))
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const persistedOptions = createOptions([
        {name: 'first', description: 'This is first', color: 'BLUE'},
        {name: 'second', description: 'This is second', color: 'GREEN'},
      ])
      const addOptionStub = stubAddOption(createColumnWithOptions(addOptionAtPosition(persistedOptions, newOption)))

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      await act(async () => {
        await result.current.addColumnOption(column, newOption)
      })

      expect(setAllColumnsStub).toHaveBeenCalledTimes(2)
      expect(addOptionStub).toHaveBeenCalledTimes(1)

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      const position = newOption.position ?? nextState.settings.options.length
      const option = nextState.settings.options[position - 1]
      expect(option).toMatchObject(omit(newOption, ['position']))
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should ignore a state update if the option has an empty "name" value', async () => {
      const queryClient = initQueryClient()
      const column = new SingleSelectColumnModel(createColumnWithOptions([]))
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const expectedOption = {...emptySingleSelectOption}
      const addOptionStub = stubAddOption(createColumnWithOptions([expectedOption]))

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      await act(async () => {
        await result.current.addColumnOption(column, expectedOption)
      })

      for (const stub of [setAllColumnsStub, addOptionStub]) {
        expect(stub).not.toHaveBeenCalled()
      }
    })
  })

  describe('moveColumnOption', () => {
    it('should update an option position', async () => {
      const queryClient = initQueryClient()
      const [optA, optB] = createOptions([
        {...emptySingleSelectOption, name: 'Aric'},
        {...emptySingleSelectOption, name: 'Derrick'},
      ])

      const column = new SingleSelectColumnModel(createColumnWithOptions([optA, optB]))
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const optionsWithHtml = [
        {...optB, nameHtml: 'Option B Name'},
        {...optA, nameHtml: 'Option A Name'},
      ]

      const updateOptionStub = stubUpdateOption(createColumnWithOptions(optionsWithHtml))

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })
      assertSingleSelectColumnModel(column)
      expect(column.settings.options).toMatchObject([optA, optB])

      let nextColumnsState: Array<ColumnModel> = []

      await act(async () => {
        const updateColumnOptionPromise = result.current.moveColumnOption(column, {...optA, position: 2})
        const [nextState] = setAllColumnsStub.mock.calls[0][0]
        assertSingleSelectColumnModel(nextState)
        // test the synchronous optimistic update
        expect(nextState.settings.options[0].name).toEqual('Derrick')
        expect(nextState.settings.options[0].nameHtml).toEqual('Derrick')
        expect(nextState.settings.options[1].name).toEqual('Aric')
        expect(nextState.settings.options[1].nameHtml).toEqual('Aric')

        await updateColumnOptionPromise
        nextColumnsState = setAllColumnsStub.mock.calls[1][0]
      })

      const [nextState] = nextColumnsState
      assertSingleSelectColumnModel(nextState)
      // test the values from the server are persisted on the column
      expect(nextState.settings.options[0].name).toEqual('Derrick')
      expect(nextState.settings.options[0].nameHtml).toEqual('Option B Name')
      expect(nextState.settings.options[1].name).toEqual('Aric')
      expect(nextState.settings.options[1].nameHtml).toEqual('Option A Name')

      expect(updateOptionStub).toHaveBeenCalledTimes(1)
      expect(setAllColumnsStub).toHaveBeenCalledTimes(2)
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })
  })

  describe('updateColumnOption', () => {
    it('should update an option for a column', async () => {
      const queryClient = initQueryClient()
      const options = createOptions([
        {id: 'option-a', ...emptySingleSelectOption, name: 'option A'},
        {id: 'option-b', ...emptySingleSelectOption, name: 'option B'},
        {id: 'option-c', ...emptySingleSelectOption, name: 'option C'},
      ])

      const column = new SingleSelectColumnModel(createColumnWithOptions(options))
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateColumnValuesStub = jest.fn()
      asMockHook(useUpdateColumnValues).mockReturnValue({updateColumnValues: updateColumnValuesStub})

      const [optionA, optionB, optionC] = options
      const persistedOptions = [optionA, {id: 'option-b', ...emptySingleSelectOption, name: 'B'}, optionC]
      const updateOptionStub = stubUpdateOption(createColumnWithOptions(persistedOptions))

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })
      assertSingleSelectColumnModel(column)
      expect(column.settings.options[1].nameHtml).toBe('option B')

      let nextColumnsState: Array<ColumnModel> | undefined = undefined

      await act(async () => {
        const updateColumnOptionPromise = result.current.updateColumnOption(column, {
          id: optionB.id,
          name: 'B',
        })
        const [nextState] = setAllColumnsStub.mock.calls[0][0]
        assertSingleSelectColumnModel(nextState)
        // test the synchronous optimistic update
        expect(nextState.settings.options[1].nameHtml).toBe('B')

        await updateColumnOptionPromise
        nextColumnsState = setAllColumnsStub.mock.calls[1][0]
      })

      const [nextState] = nextColumnsState!
      assertSingleSelectColumnModel(nextState)
      // test the values from the server are persisted on the column
      expect(nextState.settings.options[0]).toMatchObject(optionA)
      expect(nextState.settings.options[1]).toMatchObject({name: 'B', nameHtml: 'B'})
      expect(nextState.settings.options[2]).toMatchObject(optionC)

      expect(updateOptionStub).toHaveBeenCalledTimes(1)
      expect(setAllColumnsStub).toHaveBeenCalledTimes(2)
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })

    it('should ignore API request and a 2nd state update if `localOnly` is truthy', async () => {
      const queryClient = initQueryClient()
      const localOnly = true
      const options = createOptions([{...emptySingleSelectOption, name: 'dmarcey'}])

      const column = new SingleSelectColumnModel(createColumnWithOptions(options))
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const updateOptionStub = stubUpdateOption(column)

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      assertSingleSelectColumnModel(column)
      await act(async () => {
        const [option] = options
        const updateColumnOptionPromise = result.current.updateColumnOption(
          column,
          {...option, name: 'dmarcey'},
          localOnly,
        )

        const [nextState] = setAllColumnsStub.mock.calls[0][0]
        assertSingleSelectColumnModel(nextState)
        // test the synchronous optimistic update
        expect(nextState.settings.options[0].nameHtml).toBe('dmarcey')

        await updateColumnOptionPromise
      })

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      // test the values from the server are persisted on the column
      expect(nextState.settings.options).toMatchObject([{name: 'dmarcey', nameHtml: 'dmarcey'}])

      expect(updateOptionStub).not.toHaveBeenCalled()
      expect(setAllColumnsStub).toHaveBeenCalledTimes(1)
      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })
  })

  describe('destroyColumnOption', () => {
    it('should remove from options', async () => {
      const queryClient = initQueryClient()
      const column = createColumnModel(customSingleSelectColumn)
      const allColumnsStub = stubAllColumnsRefWithColumnModels([column])
      const setAllColumnsStub = stubSetAllColumnsFn()

      const optionIdToDelete = '3'
      const destroyColumnOptionStub = stubDestroyOption({
        ...customSingleSelectColumn,
        settings: {
          options: destroyOptionById(aardvarkOptions, optionIdToDelete),
        },
      })

      const {result} = renderHook(useUpdateOptions, {
        wrapper: createWrapperWithContexts({
          QueryClient: {queryClient},
          ColumnsStable: createColumnsStableContext({allColumnsRef: allColumnsStub, setAllColumns: setAllColumnsStub}),
        }),
      })

      assertSingleSelectColumnModel(column)
      expect(column.settings.options).toHaveLength(8)
      expect(column.settings.options[2].name).toBe('Derrick')

      await act(async () => {
        await result.current.destroyColumnOption(column, {id: optionIdToDelete})
      })

      for (const stub of [destroyColumnOptionStub, setAllColumnsStub]) {
        expect(stub).toHaveBeenCalledTimes(1)
      }

      const [nextState] = setAllColumnsStub.mock.calls[0][0]
      assertSingleSelectColumnModel(nextState)
      expect(nextState.settings.options).toHaveLength(7)
      expect(nextState.settings.options[2].name).not.toBe('Derrick')

      expect(destroyColumnOptionStub).toHaveBeenCalledWith({
        memexProjectColumnId: column.id,
        option: {id: optionIdToDelete},
      })

      expect(setAllColumnsStub).toHaveBeenCalledWith([nextState])
    })
  })
})

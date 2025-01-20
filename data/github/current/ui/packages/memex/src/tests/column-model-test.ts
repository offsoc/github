import {MemexColumnDataType, SystemColumnId} from '../client/api/columns/contracts/memex-column'
import type {PersistedOption} from '../client/api/columns/contracts/single-select'
import {createColumnModel} from '../client/models/column-model'
import {assertIterationColumnModel, assertSingleSelectColumnModel} from './models/column-model'

describe('Column Model', () => {
  it('sets up initial fields', () => {
    const columnModel = createColumnModel({
      dataType: MemexColumnDataType.Title,
      id: SystemColumnId.Title,
      databaseId: 1,
      name: 'Name',
      position: 1,
      userDefined: false,
      defaultColumn: false,
      settings: {width: 600},
    })

    expect(columnModel.id).toEqual(SystemColumnId.Title)
    expect(columnModel.name).toEqual('Name')
    expect(columnModel.dataType).toEqual(MemexColumnDataType.Title)
    expect(columnModel.settings.width).toEqual(600)
  })

  it('provides a default iteration configuration', () => {
    const columnModel = createColumnModel({
      dataType: MemexColumnDataType.Iteration,
      id: 200,
      databaseId: 1,
      name: 'Name',
      position: 1,
      userDefined: true,
      defaultColumn: false,
    })

    expect(columnModel.id).toEqual(200)
    expect(columnModel.name).toEqual('Name')
    expect(columnModel.dataType).toEqual(MemexColumnDataType.Iteration)
    expect(columnModel.settings.width).toEqual(200)
    assertIterationColumnModel(columnModel)
    expect(columnModel.settings.configuration).toEqual({
      startDay: expect.any(Number),
      duration: expect.any(Number),
      completedIterations: expect.any(Array),
      iterations: expect.any(Array),
    })
  })

  it('allows an iteration with valid configuratio', () => {
    const defaultConfig = {
      startDay: 1,
      completedIterations: [],
      iterations: [],
      duration: 10,
    }
    const columnModel = createColumnModel({
      dataType: MemexColumnDataType.Iteration,
      id: 200,
      databaseId: 1,
      name: 'Name',
      position: 1,
      userDefined: true,
      defaultColumn: false,
      settings: {
        configuration: defaultConfig,
        width: 100,
      },
    })

    expect(columnModel.id).toEqual(200)
    expect(columnModel.name).toEqual('Name')
    expect(columnModel.dataType).toEqual(MemexColumnDataType.Iteration)
    expect(columnModel.settings.width).toEqual(100)
    assertIterationColumnModel(columnModel)
    expect(columnModel.settings.configuration).toEqual(defaultConfig)
  })

  it('allows creating a single select with invalid options', () => {
    const columnModel = createColumnModel({
      dataType: MemexColumnDataType.SingleSelect,
      id: 200,
      databaseId: 1,
      name: 'Name',
      position: 10,
      userDefined: true,
      defaultColumn: false,
    })

    expect(columnModel.id).toEqual(200)
    expect(columnModel.name).toEqual('Name')
    expect(columnModel.dataType).toEqual(MemexColumnDataType.SingleSelect)
    expect(columnModel.settings.width).toEqual(200)
    assertSingleSelectColumnModel(columnModel)
    expect(columnModel.settings.options).toEqual([])
  })

  it('allows creating a single select with valid options', () => {
    const options: Array<PersistedOption> = [
      {
        id: '1',
        name: 'Option 1',
        nameHtml: 'Option 1',
        description: 'Option One',
        descriptionHtml: 'Option One',
        color: 'BLUE',
      },
    ]
    const columnModel = createColumnModel({
      dataType: MemexColumnDataType.SingleSelect,
      id: 200,
      databaseId: 1,
      name: 'Name',
      position: 10,
      userDefined: true,
      defaultColumn: false,
      settings: {width: 100, options},
    })

    expect(columnModel.id).toEqual(200)
    expect(columnModel.name).toEqual('Name')
    expect(columnModel.dataType).toEqual(MemexColumnDataType.SingleSelect)
    expect(columnModel.settings.width).toEqual(100)
    assertSingleSelectColumnModel(columnModel)
    expect(columnModel.settings.options).toEqual(options)
  })
})

import type {DefaultBodyType, StrictRequest} from 'msw'
import invariant from 'tiny-invariant'

import type {
  CreateColumnOptionRequest,
  CreateColumnOptionResponse,
  CreateMemexColumnRequest,
  CreateMemexColumnResponse,
  DestroyColumnOptionRequest,
  DestroyColumnOptionResponse,
  DestroyMemexColumnRequest,
  GetMemexColumnsRequest,
  GetMemexColumnsResponse,
  IDestroyMemexColumnResponse,
  UpdateColumnOptionRequest,
  UpdateColumnOptionResponse,
  UpdateMemexColumnRequest,
  UpdateMemexColumnResponse,
} from '../../client/api/columns/contracts/api'
import type {IColumnWithItems, ItemWithColumnData} from '../../client/api/columns/contracts/column-with-items'
import {
  type ColumnSettings,
  type MemexColumn,
  MemexColumnDataType,
  type MemexProjectColumnId,
  SystemColumnId,
} from '../../client/api/columns/contracts/memex-column'
import type {SingleSelectColumnData, StatusColumnData} from '../../client/api/columns/contracts/storage'
import {assertNever} from '../../client/helpers/assert-never'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {asSingleSelectValue} from '../../client/helpers/parsing'
import {addOptionAtPosition, destroyOptionById} from '../../tests/mocks/models/column-options'
import {generateIterationConfiguration} from '../../tests/mocks/models/iteration-configuration'
import {MemexRefreshEvents} from '../data/memex-refresh-events'
import {createRequestHandlerWithError} from '../msw-responders'
import {
  delete_destroyMemexColumn,
  delete_destroyMemexColumnOption,
  get_getMemexColumns,
  post_createMemexColumn,
  post_createMemexColumnOption,
  put_updateMemexColumn,
  put_updateMemexColumnOption,
} from '../msw-responders/columns'
import {BaseController} from './base-controller'
import {renderWithEmoji} from './column-value-utils'

let nextCustomColumnId = 100

export class ColumnsController extends BaseController {
  public get(): Array<IColumnWithItems> {
    return this.db.columns.all()
  }

  public async getById({memexProjectColumnIds}: GetMemexColumnsRequest): Promise<GetMemexColumnsResponse> {
    const memexProjectColumns = memexProjectColumnIds
      .map(id => this.db.columns.byId(id))
      .map(column => {
        return this.buildColumnWithItems(column, this.getColumnValuesForItems(column))
      })
    await this.server.sleep()
    return {
      memexProjectColumns,
    }
  }

  public create({
    memexProjectColumn: {dataType, settings, name, defaultColumn},
  }: CreateMemexColumnRequest): CreateMemexColumnResponse {
    let column: IColumnWithItems

    if (dataType) {
      let serverSettings: ColumnSettings = {}
      if (settings && settings.options) {
        //we need to add some ids to these options since they won't have them without the backend api
        //and without the ids, we won't be able to set keys on react components that depend on them
        serverSettings = {
          options: settings.options.map((option, index) => ({
            ...option,
            id: `settings_option_${index}`,
            nameHtml: option.name,
            descriptionHtml: option.description,
          })),
        }
      }

      if (settings && settings.configuration) {
        //we need to add some ids to these options since they won't have them without the backend api
        //and without the ids, we won't be able to set keys on react components that depend on them
        serverSettings = {
          configuration: {
            ...settings.configuration,
            iterations: settings.configuration.iterations.map((iteration, index) => ({
              ...iteration,
              id: `iteration_option_${index}`,
              titleHtml: iteration.title,
            })),
            completedIterations: settings.configuration.completedIterations.map((iteration, index) => ({
              ...iteration,
              id: `completed_iteration_option_${index}`,
              titleHtml: iteration.title,
            })),
          },
        }
      }

      const id = nextCustomColumnId++

      column = {
        id,
        databaseId: id,
        dataType,
        name: name || this.getNewColumnName(),
        position: this.db.columns.all().length + 1,
        userDefined: true,
        defaultColumn: true,
        settings: serverSettings,
      }
      this.db.columns.all().push(column)
    } else {
      column = not_typesafe_nonNullAssertion(this.db.columns.all().find(col => col.name === name))
      column.defaultColumn = !!defaultColumn
    }

    this.log(`Adding column with name ${column.name} and type ${column.dataType}`)
    if (column.dataType === MemexColumnDataType.Iteration) {
      const iterations = column.settings?.configuration?.iterations || []
      this.log(`Iteration field has ${iterations.length} iterations defined`)
      this.log(`Start dates: ${iterations.map(i => i.startDate)}`)
    }

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnCreate,
    })
    return {memexProjectColumn: column}
  }

  public update({memexProjectColumnId: id, ...payload}: UpdateMemexColumnRequest): UpdateMemexColumnResponse {
    if (payload.previousMemexProjectColumnId !== undefined) {
      return this.reorderColumn(id as number, payload.previousMemexProjectColumnId)
    }

    const column = this.db.columns.all().splice(
      this.db.columns.all().findIndex(x => x.id === id),
      1,
    )[0]
    invariant(column, 'column must exist')

    let change: keyof typeof payload
    for (change in payload) {
      if (change === 'settings') {
        let serverSettings: ColumnSettings = {}
        if (payload.settings && 'options' in payload.settings && payload.settings.options) {
          const options = payload.settings.options
          const existingOptionCount = options.filter(o => o.id).length
          serverSettings = {
            options: payload.settings.options.map((option, index) => ({
              ...option,
              id: option.id ? option.id : `settings_option_${index + existingOptionCount}`,
              nameHtml: option.name,
              descriptionHtml: option.description,
            })),
          }
          column[change] = serverSettings
        } else if (payload.settings && 'configuration' in payload.settings && payload.settings.configuration) {
          const existingSettings = column.settings?.configuration

          if (!existingSettings) {
            throw new Error('Iterations field in invalid state - no existing settings to update')
          }

          const {configuration} = payload.settings

          serverSettings = {
            configuration: generateIterationConfiguration(existingSettings, configuration, renderWithEmoji),
          }
          column[change] = serverSettings
        }
      } else if (change === 'width') {
        const serverSettings = column.settings || {}
        column.settings = {...serverSettings, width: payload.width}
      } else if (change === 'name') {
        if (payload.name) {
          column.name = payload.name
        }
      } else if (change === 'previousMemexProjectColumnId') {
        continue
      } else {
        assertNever(change)
      }
    }

    const itemsForColumn = this.getColumnValuesForItems(column)
    this.db.columns.all().push(column)

    this.log(`Updating column with name ${column.name} with changes ${JSON.stringify(payload)}`)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
    })
    return {
      memexProjectColumn: this.buildColumnWithItems(column, itemsForColumn),
    }
  }

  public destroy({memexProjectColumnId}: DestroyMemexColumnRequest): IDestroyMemexColumnResponse {
    const column = this.db.columns.all().splice(
      this.db.columns.all().findIndex(x => x.id === memexProjectColumnId),
      1,
    )[0]
    invariant(column, 'column must exist')
    this.log(`Destroying column ${memexProjectColumnId} with name ${column.name} changes`)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnDestroy,
    })
  }

  public addOption({memexProjectColumnId, option}: CreateColumnOptionRequest): CreateColumnOptionResponse {
    const column = this.db.columns.byId(memexProjectColumnId)
    if (!column.settings || !column.settings.options) {
      column.settings = {options: []}
    }

    const persistedOptions = column.settings.options
    column.settings.options = addOptionAtPosition(persistedOptions, option)

    this.log(`Adding option for column with name ${column.name} with name ${option.name}`)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
    })
    return {memexProjectColumn: column}
  }

  public updateOption({
    memexProjectColumnId,
    option: {id, position, ...changes},
  }: UpdateColumnOptionRequest): UpdateColumnOptionResponse {
    const column = this.db.columns.byId(memexProjectColumnId)
    let index = column.settings?.options?.findIndex(o => o.id === id) ?? -1
    const option = not_typesafe_nonNullAssertion(column.settings?.options?.splice(index, 1)[0])
    const newOption = {...option, ...changes}
    if (changes.name) {
      newOption.nameHtml = changes.name
    }
    if (changes.description !== undefined) {
      newOption.descriptionHtml = changes.description
    }
    if (position != null) {
      index = position - 1 // position is 1-indexed on the server
    }
    column.settings?.options?.splice(index, 0, newOption)

    this.log(
      `Updating option ${option.id} for column with name ${column.name} with name ${newOption.name} and position ${position}`,
    )

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
    })
    return {
      memexProjectColumn: column,
    }
  }

  public destroyOption({memexProjectColumnId, option: {id}}: DestroyColumnOptionRequest): DestroyColumnOptionResponse {
    const column = this.db.columns.byId(memexProjectColumnId)
    invariant(column.settings, 'settings must be defined')
    invariant(column.settings.options, 'options must be defined')
    column.settings.options = destroyOptionById(column.settings.options, id)

    this.log(`Destroying option ${id} for column with name ${column.name}`)

    this.server.liveUpdate.queueSocketMessage({
      type: MemexRefreshEvents.MemexProjectColumnUpdate,
    })
    return {memexProjectColumn: column}
  }

  private getNewColumnName(): string {
    const numUserDefinedColumns = this.db.columns.all().filter(col => col.userDefined === true).length
    return `New Field${numUserDefinedColumns > 0 ? ` ${numUserDefinedColumns + 1}` : ''}`
  }

  private getColumnValuesForItems(column: IColumnWithItems) {
    return this.db.memexItems.getActive().map(item => {
      let columnValue = item.memexProjectColumnValues.find(col => col.memexProjectColumnId === column.id)

      if (columnValue && column.dataType === MemexColumnDataType.SingleSelect) {
        const singleSelectValue = asSingleSelectValue(columnValue.value)

        const optionId = singleSelectValue?.id

        const storedOption =
          column.settings && column.settings.options && column.settings.options.find(o => o.id === optionId)

        if (!storedOption) {
          columnValue = {...columnValue, value: null} as SingleSelectColumnData | StatusColumnData
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          this.log(`clearing column value: ${columnValue}`)
        }
      }

      return {
        memexProjectItemId: item.id,
        value: columnValue?.value,
      }
    })
  }

  private reorderColumn(repositionedColumnId: number, previousMemexColumnId: MemexProjectColumnId | null) {
    const allColumns = this.db.columns.all()

    const repositionedColumnIndex = allColumns.findIndex(({databaseId}) => databaseId === repositionedColumnId)
    const repositionedColumn = allColumns[repositionedColumnIndex]
    invariant(repositionedColumn, 'column must exist')

    // reinserting reordered column into its new position
    let previousColumnIndex = allColumns.findIndex(({databaseId}) => databaseId === previousMemexColumnId)
    previousColumnIndex = previousColumnIndex > -1 ? previousColumnIndex : allColumns.length - 1

    const reorderedColumns: Array<IColumnWithItems> = [
      ...allColumns.slice(0, previousColumnIndex + 1),
      repositionedColumn,
      ...allColumns.slice(previousColumnIndex + 1),
    ]

    // updating position of all custom fields for consistency
    let position = 1
    for (const column of reorderedColumns) {
      ;(column as MemexColumn).position = position
      position += 1
    }

    this.db.columns.setColumns(reorderedColumns)

    const itemsForColumn = this.getColumnValuesForItems(repositionedColumn)
    return {
      memexProjectColumn: this.buildColumnWithItems(repositionedColumn, itemsForColumn),
    }
  }

  private buildColumnWithItems(
    column: MemexColumn,
    memexProjectColumnValues: Array<ItemWithColumnData<any>>,
  ): IColumnWithItems {
    return {...column, memexProjectColumnValues}
  }

  public override handlers = [
    post_createMemexColumn(async body => {
      return this.create(body)
    }),
    put_updateMemexColumn(async body => {
      return this.update(body)
    }),
    delete_destroyMemexColumn(async body => {
      this.destroy(body)
    }),
    get_getMemexColumns(async (_body, req) => {
      return this.getById({
        memexProjectColumnIds: getColumnIdsFromParams(req),
      })
    }),
    post_createMemexColumnOption(async body => {
      return this.addOption(body)
    }),
    put_updateMemexColumnOption(async body => {
      return this.updateOption(body)
    }),
    delete_destroyMemexColumnOption(async body => {
      return this.destroyOption(body)
    }),
  ]

  public override errorHandlers = [
    createRequestHandlerWithError('post', 'memex-column-create-api-data', 'Failed to create column'),
    createRequestHandlerWithError('put', 'memex-column-update-api-data', 'Failed to update column'),
    createRequestHandlerWithError('post', 'memex-column-option-create-api-data', 'Failed to create column option'),
    createRequestHandlerWithError('put', 'memex-column-option-update-api-data', 'Failed to update column option'),
  ]
}

function getColumnIdsFromParams(req: StrictRequest<DefaultBodyType>) {
  const params = new URL(req.url).searchParams
  const systemColumnIds = new Set<string>(Object.values(SystemColumnId))
  return params.getAll('columnIds[]').map(columnId => {
    if (systemColumnIds.has(columnId)) {
      return columnId as SystemColumnId
    }
    /**
     * make numbers for non-system columns
     */
    return parseInt(columnId, 10)
  })
}

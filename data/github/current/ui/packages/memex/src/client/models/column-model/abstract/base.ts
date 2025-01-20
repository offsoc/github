import type {MemexColumn, MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'

const DEFAULT_COLUMN_WIDTH = 200

export abstract class BaseColumnModel {
  public declare readonly id: number | SystemColumnId
  public declare readonly databaseId: number
  public declare readonly dataType: MemexColumnDataType
  public declare readonly name: string
  public declare readonly position: number
  public declare readonly defaultColumn: boolean
  public declare readonly userDefined: boolean

  public declare readonly settings: {
    width: number
  }

  constructor(column: MemexColumn) {
    this.id = column.id
    this.name = column.name
    this.dataType = column.dataType
    this.userDefined = column.userDefined
    this.databaseId = column.databaseId
    this.position = column.position || -1
    this.defaultColumn = column.defaultColumn
    this.settings = {
      width: DEFAULT_COLUMN_WIDTH,
      ...column.settings,
    }
  }
}

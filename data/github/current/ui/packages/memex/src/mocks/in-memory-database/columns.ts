import invariant from 'tiny-invariant'

import type {IColumnWithItems} from '../../client/api/columns/contracts/column-with-items'
import type {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import {stringToSyntheticId} from '../server/mock-server-parsing'
import {deepCopy} from './utils'

export class ColumnsCollection {
  private columns: Array<IColumnWithItems>

  constructor(columns: Array<IColumnWithItems> = []) {
    this.columns = deepCopy(columns)
  }

  public all() {
    return this.columns
  }

  public setColumns(columns: Array<IColumnWithItems>) {
    this.columns = columns
  }

  public byId(id: SystemColumnId | number): IColumnWithItems {
    const column = this.columns.find(c => c.id === id)
    if (!column) throw new Error(`Column with id ${id} not found`)
    return column
  }

  public bySyntheticIdString(id: string): IColumnWithItems {
    return this.byId(stringToSyntheticId(id))
  }

  public add(column: IColumnWithItems) {
    this.columns.push(column)
  }

  public remove(id: SystemColumnId | number): IColumnWithItems {
    const col = this.columns.splice(
      this.columns.findIndex(x => x.id === id),
      1,
    )[0]
    invariant(col, 'Column not found')
    return col
  }
}

import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class TextColumnModel extends BaseColumnModel {
  public declare readonly id: number
  public declare readonly dataType: typeof MemexColumnDataType.Text
  public declare readonly userDefined: true
}

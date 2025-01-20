import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class NumberColumnModel extends BaseColumnModel {
  public declare readonly id: number
  public declare readonly dataType: typeof MemexColumnDataType.Number
  public declare readonly userDefined: true
}

import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class TrackedByColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.TrackedBy
  public declare readonly dataType: typeof MemexColumnDataType.TrackedBy
  public declare readonly userDefined: false
}

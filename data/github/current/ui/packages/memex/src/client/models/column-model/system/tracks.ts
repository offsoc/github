import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class TracksColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Tracks
  public declare readonly dataType: typeof MemexColumnDataType.Tracks
  public declare readonly userDefined: false
}

import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class MilestoneColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Milestone
  public declare readonly dataType: typeof MemexColumnDataType.Milestone
  public declare readonly userDefined: false
}

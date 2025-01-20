import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class AssigneesColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Assignees
  public declare readonly dataType: typeof MemexColumnDataType.Assignees
  public declare readonly userDefined: false
}

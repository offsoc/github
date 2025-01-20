import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class ParentIssueColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.ParentIssue
  public declare readonly dataType: typeof MemexColumnDataType.ParentIssue
  public declare readonly userDefined: false
}

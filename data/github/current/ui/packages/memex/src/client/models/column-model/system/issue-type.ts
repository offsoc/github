import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class IssueTypeColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.IssueType
  public declare readonly dataType: typeof MemexColumnDataType.IssueType
  public declare readonly userDefined: false
}

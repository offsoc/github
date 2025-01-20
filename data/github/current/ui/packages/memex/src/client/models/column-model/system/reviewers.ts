import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class ReviewersColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Reviewers
  public declare readonly dataType: typeof MemexColumnDataType.Reviewers
  public declare readonly userDefined: false
}

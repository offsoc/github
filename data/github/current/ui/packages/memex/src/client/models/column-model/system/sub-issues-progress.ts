import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {ProgressConfiguration} from '../../../api/columns/contracts/progress'
import {BaseColumnModel} from '../abstract/base'

export class SubIssuesProgressColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.SubIssuesProgress
  public declare readonly dataType: typeof MemexColumnDataType.SubIssuesProgress
  public declare readonly userDefined: false
  public declare readonly settings: {
    width: number
    progressConfiguration: ProgressConfiguration
  }
}

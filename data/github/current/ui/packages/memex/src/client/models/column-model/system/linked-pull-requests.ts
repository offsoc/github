import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class LinkedPullRequestsColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.LinkedPullRequests
  public declare readonly dataType: typeof MemexColumnDataType.LinkedPullRequests
  public declare readonly userDefined: false
}

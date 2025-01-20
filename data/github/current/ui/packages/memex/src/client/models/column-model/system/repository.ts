import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class RepositoryColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Repository
  public declare readonly dataType: typeof MemexColumnDataType.Repository
  public declare readonly userDefined: false
}

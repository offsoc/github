import type {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class LabelsColumnModel extends BaseColumnModel {
  public declare readonly id: typeof SystemColumnId.Labels
  public declare readonly dataType: typeof MemexColumnDataType.Labels
  public declare readonly userDefined: false
}

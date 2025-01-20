import type {MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {BaseSingleSelectColumnModel} from '../abstract/base-single-select'

export class SingleSelectColumnModel extends BaseSingleSelectColumnModel {
  public declare readonly id: number
  public declare readonly dataType: typeof MemexColumnDataType.SingleSelect
  public declare readonly userDefined: true
}

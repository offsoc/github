import type {IterationConfiguration} from '../../../api/columns/contracts/iteration'
import type {MemexColumn, MemexColumnDataType} from '../../../api/columns/contracts/memex-column'
import {BaseColumnModel} from '../abstract/base'

export class IterationColumnModel extends BaseColumnModel {
  public declare readonly id: number
  public declare readonly dataType: typeof MemexColumnDataType.Iteration
  public declare readonly userDefined: true
  public declare readonly settings: {
    width: number
    /**
     * In the event of no iterations being defined, this will be undefined
     */
    configuration: IterationConfiguration
  }

  constructor(column: MemexColumn) {
    super({
      ...column,
      settings: {
        ...column.settings,
        configuration: column.settings?.configuration ?? getDefaultConfiguration(),
      },
    })
  }
}

/**
 * When no configuration exists, provide a default
 * to avoid null references or spreading undefined checks
 */
function getDefaultConfiguration(): IterationConfiguration {
  return {
    startDay: new Date().getDay() || 7,
    duration: 14,
    iterations: [],
    completedIterations: [],
  }
}

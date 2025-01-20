import {useCallback} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {useNumberCardData} from '../hooks/use-number-card-data'
import type CardProps from '../types/card-props'
import {NumberCard} from './NumberCard'

export function MeanTimeToRemediateCard({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const {currentPeriodState, previousPeriodState, trend} = useNumberCardData<{value: number; alertCount: number}>({
    startDate,
    endDate,
    query,
    endpoint: usePaths().meanTimeToRemediatePath,
    resultsReducer: useCallback(results => {
      const sum = results.reduce((acc, result) => acc + result.value * result.alertCount, 0)
      const alertCount = results.reduce((acc, result) => acc + result.alertCount, 0)
      return alertCount === 0 ? 0 : Math.round(sum / alertCount)
    }, []),
  })

  return (
    <NumberCard
      title="Mean time to remediate"
      description="Average age of closed alerts (excludes alerts closed as false positive)"
      trend={trend}
      currentPeriodState={currentPeriodState}
      previousPeriodState={previousPeriodState}
      metric={{singular: 'day', plural: 'days'}}
      sx={sx}
    />
  )
}

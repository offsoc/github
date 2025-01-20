import {useCallback} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {useNumberCardData} from '../hooks/use-number-card-data'
import type CardProps from '../types/card-props'
import {NumberCard} from './NumberCard'

export function AgeOfAlertsCard({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const {currentPeriodState, previousPeriodState, trend} = useNumberCardData<{value: number; alertCount: number}>({
    startDate,
    endDate,
    query,
    endpoint: usePaths().ageOfAlertsPath,
    resultsReducer: useCallback(results => {
      const totalAge = results.reduce((acc, result) => acc + result.value * result.alertCount, 0)
      const alertCount = results.reduce((acc, result) => acc + result.alertCount, 0)
      return alertCount === 0 ? 0 : Math.round(totalAge / alertCount)
    }, []),
  })

  return (
    <NumberCard
      title="Age of alerts"
      description="Average age of open alerts"
      trend={trend}
      currentPeriodState={currentPeriodState}
      previousPeriodState={previousPeriodState}
      metric={{singular: 'day', plural: 'days'}}
      sx={sx}
    />
  )
}

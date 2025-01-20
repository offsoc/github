import {useCallback} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {useNumberCardData} from '../hooks/use-number-card-data'
import type CardProps from '../types/card-props'
import {NumberCard} from './NumberCard'

export function ReopenedAlertsCard({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const {currentPeriodState, previousPeriodState, trend} = useNumberCardData<{count: number}>({
    startDate,
    endDate,
    query,
    endpoint: usePaths().reopenedAlertsPath,
    resultsReducer: useCallback(results => results.reduce((acc, result) => acc + result.count, 0), []),
  })

  return (
    <NumberCard
      title="Reopened alerts"
      trend={trend}
      currentPeriodState={currentPeriodState}
      previousPeriodState={previousPeriodState}
      description="Total open alerts that were reopened during the period"
      sx={sx}
    />
  )
}

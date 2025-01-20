import {useCallback} from 'react'

import {usePaths} from '../../common/contexts/Paths'
import {useNumberCardData} from '../hooks/use-number-card-data'
import type CardProps from '../types/card-props'
import {NumberCard} from './NumberCard'

export function NetResolveRateCard({startDate, endDate, query = '', sx = {}}: CardProps): JSX.Element {
  const {currentPeriodState, previousPeriodState, trend} = useNumberCardData<{openCount: number; closedCount: number}>({
    startDate,
    endDate,
    query,
    endpoint: usePaths().netResolveRatePath,
    resultsReducer: useCallback(results => {
      const closedCount = results.reduce((acc, result) => acc + result.closedCount, 0)
      let openCount = results.reduce((acc, result) => acc + result.openCount, 0)
      if (openCount === 0) {
        openCount = 1
      }
      return Math.round((closedCount / openCount) * 100)
    }, []),
  })

  return (
    <NumberCard
      title="Net resolve rate"
      description="Percentage of closed alerts to newly created alerts"
      trend={trend}
      currentPeriodState={currentPeriodState}
      previousPeriodState={previousPeriodState}
      metric="%"
      flipTrendColor={true}
      sx={sx}
    />
  )
}

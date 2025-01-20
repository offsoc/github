import DataCard from '@github-ui/data-card'
import {Box, type SxProp} from '@primer/react'

import {TrendIndicator} from '../../common/components/trend-indicator'

export type NumberCardProps = SxProp & {
  title?: string
  description?: string
  trend?: number
  currentPeriodState: DataState
  previousPeriodState: DataState
  metric?: string | {singular: string; plural: string} | undefined
  flipTrendColor?: boolean
}

interface LoadingState {
  kind: 'loading'
}

interface ErrorState {
  kind: 'error'
  msg?: string
}

interface ReadyState {
  kind: 'ready'
  count: number
}

export type DataState = LoadingState | ErrorState | ReadyState

export function isReadyState(state: DataState): state is ReadyState {
  return state.kind === 'ready'
}

export function isLoadingState(state: DataState): state is LoadingState {
  return state.kind === 'loading'
}

export function isErrorState(state: DataState): state is ErrorState {
  return state.kind === 'error'
}

export function NumberCard({
  title = '',
  description = '',
  trend = undefined,
  currentPeriodState,
  previousPeriodState,
  metric = undefined,
  flipTrendColor = false,
  sx = {},
}: NumberCardProps): JSX.Element {
  return (
    <DataCard
      cardTitle={title}
      loading={isLoadingState(currentPeriodState)}
      error={isErrorState(currentPeriodState)}
      sx={sx}
    >
      <Box sx={{display: 'flex'}}>
        {isReadyState(currentPeriodState) && <DataCard.Counter count={currentPeriodState.count} metric={metric} />}{' '}
        <TrendIndicator
          loading={isLoadingState(currentPeriodState) || isLoadingState(previousPeriodState)}
          error={isErrorState(currentPeriodState) || isErrorState(previousPeriodState)}
          value={trend}
          flipColor={flipTrendColor}
          sx={{ml: 2}}
        />
      </Box>
      <DataCard.Description>{description}</DataCard.Description>
    </DataCard>
  )
}

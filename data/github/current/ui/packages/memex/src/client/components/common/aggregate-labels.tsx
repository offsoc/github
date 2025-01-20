import {testIdProps} from '@github-ui/test-id-props'
import {CounterLabel, Label} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {FieldAggregate} from '../../hooks/use-aggregation-settings'

interface AggregateLabelsProps {
  aggregates: Array<FieldAggregate>
  hideItemsCount: boolean
  itemsCount: number
  counterSx?: BetterSystemStyleObject
  columnLimit?: number
}

export function getAggregateDisplayValue(aggregate: FieldAggregate): string {
  if (Number.isInteger(aggregate.sum)) return aggregate.sum.toString()
  const rounded = aggregate.sum.toFixed(aggregate.maxDecimalPlaces)
  // Remove trailing zeroes (e.g., 123.190 -> 123.19) after the decimal point
  return rounded.replace(/\.?0+$/, '')
}

export const AggregateLabels = ({
  aggregates,
  hideItemsCount,
  itemsCount,
  columnLimit,
  counterSx,
}: AggregateLabelsProps) => {
  const {itemCountContent, sx} = getColumnLimitAndCountState({columnLimit, itemsCount})
  return (
    <>
      {!hideItemsCount && (
        <CounterLabel
          sx={{
            ...counterSx,
            ...sx,
          }}
          {...testIdProps('column-items-counter')}
        >
          {itemCountContent}
        </CounterLabel>
      )}
      {aggregates.map(aggregate => (
        <Label
          sx={{...counterSx, color: 'fg.muted'}}
          {...testIdProps(`column-sum-${aggregate.name}`)}
          key={`aggregate-sum-${aggregate.name}`}
        >
          {aggregate.name}: {getAggregateDisplayValue(aggregate)}
        </Label>
      ))}
    </>
  )
}

const LimitStyles: Record<'danger' | 'default', BetterSystemStyleObject> = {
  default: {
    color: 'fg.muted',
  },
  danger: {
    color: 'danger.fg',
    backgroundColor: 'danger.subtle',
  },
}

function getColumnLimitAndCountSx({
  columnLimit,
  itemsCount,
}: {
  columnLimit: number
  itemsCount: number
}): BetterSystemStyleObject {
  if (columnLimit < itemsCount) {
    return LimitStyles.danger
  }

  return LimitStyles.default
}

function getColumnLimitAndCountState({
  columnLimit,
  itemsCount,
}: {
  columnLimit: number | undefined
  itemsCount: number
}): {
  itemCountContent: string | number
  sx: BetterSystemStyleObject
} {
  if (typeof columnLimit === 'undefined') {
    return {
      itemCountContent: itemsCount,
      sx: LimitStyles.default,
    }
  }

  return {
    itemCountContent: `${itemsCount} / ${columnLimit}`,
    sx: getColumnLimitAndCountSx({columnLimit, itemsCount}),
  }
}

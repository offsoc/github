import type {OcticonProps} from '@primer/react'
import {ActionList, CircleBadge, CounterLabel, Text} from '@primer/react'
import type {ReactElement} from 'react'
import React from 'react'
import {ColorByIndex} from './Shared'

interface ListData {
  label: string
  value: number
  color?: string
  icon?: ReactElement<OcticonProps>
}

export interface ListProps {
  data: ListData[]
  showPercentages?: boolean
}

function List({data, showPercentages}: ListProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  const formatValue = (value: number) => {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
      maximumSignificantDigits: 3,
    }).format(value)
  }

  function renderListItem(item: ListData, index: number) {
    const percentageOfTotal = total ? parseFloat(((item.value / total) * 100).toFixed(2)) : 0
    const color = item.color ?? ColorByIndex(index)
    const counterContent = showPercentages
      ? `${percentageOfTotal}% (${formatValue(item.value)})`
      : formatValue(item.value)

    return (
      <React.Fragment key={`${item.label}-${index}`}>
        {index > 0 && <ActionList.Divider sx={{marginY: 0, backgroundColor: 'border.default'}} />}
        <ActionList.Item sx={{display: 'flex', paddingLeft: 0}}>
          <ActionList.LeadingVisual>
            {item.icon ?? <CircleBadge inline size={12} sx={{backgroundColor: color}} />}
          </ActionList.LeadingVisual>
          <Text className="mr-1" sx={{flexGrow: 1}}>
            {item.label}
          </Text>
          <ActionList.TrailingVisual>
            <CounterLabel>{counterContent}</CounterLabel>
          </ActionList.TrailingVisual>
        </ActionList.Item>
      </React.Fragment>
    )
  }

  function renderList(items: ListData[]) {
    return items.map((item, index) => renderListItem(item, index))
  }

  return <ActionList variant="full">{renderList(data)}</ActionList>
}

List.displayName = 'DataCard.List'

export default List

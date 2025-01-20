import {Box, Text} from '@primer/react'
import type {Chart, TooltipModel} from 'chart.js'
import React from 'react'
import {createPortal} from 'react-dom'

type SupportedTypeMapping = {bar: TooltipModel<'bar'>; line: TooltipModel<'line'>}
type SupportedChartType = keyof SupportedTypeMapping
type SupportedTooltipModel<T extends SupportedChartType = SupportedChartType> = SupportedTypeMapping[T]
type SupportedTooltipItem<T extends SupportedChartType = SupportedChartType> =
  SupportedTypeMapping[T]['dataPoints'][number]

interface CustomTooltipProps<T extends SupportedChartType> {
  tooltipContext: {chart: Chart; tooltip: SupportedTooltipModel<T>}
  customTitle?: (title: string, items: Array<SupportedTooltipItem<T>>) => string
  itemSort?: (itemA: SupportedTooltipItem<T>, itemB: SupportedTooltipItem<T>) => number
  itemValueTransform?: (item: SupportedTooltipItem<T>) => string
  showTotal?: boolean
}
export function CustomTooltip<T extends SupportedChartType>({
  tooltipContext,
  customTitle,
  itemSort,
  itemValueTransform,
  showTotal = false,
}: CustomTooltipProps<T>): React.ReactPortal | null {
  const {chart, tooltip} = tooltipContext

  if (chart.canvas == null) {
    return null
  }

  if (!tooltip.opacity) {
    return null
  }

  const getPositionStyles = (): {top: number; left: number; transform?: string} => {
    const canvasPos = chart.canvas.getBoundingClientRect()
    const posStyles: {top: number; left: number; transform?: string} = {
      top: canvasPos.top + window.scrollY + tooltip.caretY,
      left: canvasPos.left + window.scrollX + tooltip.caretX,
    }

    const margin = 16
    const transformations = []

    switch (tooltip.xAlign) {
      case 'left':
        posStyles.left += margin
        break
      case 'center':
        transformations.push('translateX(-50%)')
        break
      case 'right':
        transformations.push('translateX(-100%)')
        transformations.push(`translateX(-${margin}px)`)
        break
    }

    switch (tooltip.yAlign) {
      case 'bottom':
        transformations.push('translateY(-100%)')
        transformations.push(`translateY(-${margin}px)`)
        break
      case 'center':
        transformations.push('translateY(-50%)')
        break
      case 'top':
        posStyles.top += margin
        break
    }

    if (transformations.length > 0) {
      posStyles.transform = transformations.join(' ')
    }

    return posStyles
  }

  const isLineItem = (item: SupportedTooltipItem): item is SupportedTooltipItem<'line'> => {
    // eslint-disable-next-line github/no-dataset
    const itemType = item.dataset.type || item.chart.config.type
    return itemType === 'line'
  }

  const width = 12
  const getIconElement = (function (): (item: SupportedTooltipItem) => JSX.Element {
    const strokeWidth = 2

    const shouldUseLineIcon = (item: SupportedTooltipItem): boolean => {
      // eslint-disable-next-line github/no-dataset
      return isLineItem(item) && item.dataset.fill === false
    }

    // Only line items have border dashes
    const lineItems = tooltip.dataPoints.filter(isLineItem)

    const lineBorderDashes = lineItems
      .filter(shouldUseLineIcon)
      // eslint-disable-next-line github/no-dataset
      .map(item => item.dataset.borderDash as number[] | undefined)
    const lineMaxStrokeLength = Math.max(
      ...lineBorderDashes?.map(arr => {
        if (arr == null) {
          return 0
        }

        // If an odd number of values are provided, SVG repeats the values twice to create a full dash-gap sequence
        if (arr.length % 2 === 1) {
          arr = [...arr, ...arr]
        }

        // Also double when only 2 values are provided to show at least 2 dashes in the icon
        if (arr.length === 2) {
          arr = [...arr, ...arr]
        }

        // The last value is a gap length. Subtract it to give the icon as much room as possible to render the sequence
        return arr.reduce((acc, curr) => acc + curr, 0) - arr[arr.length - 1]!
      }),
    )
    const lineStrokeDashRatio = lineMaxStrokeLength / width

    const diameter = width
    const innerRadius = (diameter - strokeWidth) / 2
    const circleBorderDashes = lineItems
      .filter(item => !shouldUseLineIcon(item))
      // eslint-disable-next-line github/no-dataset
      .map(item => item.dataset.borderDash as [number, number] | undefined)
    const circleMaxStrokeLength = Math.max(...circleBorderDashes?.map(arr => (arr != null ? arr[0] + arr[1] : 0)))
    const minNumOfFullDashGapSequences = 2 // Show at least 2 full dash-gap sequences on the circle
    const circleStrokeDashRatio = (circleMaxStrokeLength * minNumOfFullDashGapSequences) / (2 * Math.PI * innerRadius)

    return function (item: SupportedTooltipItem) {
      let iconElement: JSX.Element | null = null

      // eslint-disable-next-line github/no-dataset
      const borderDash = (isLineItem(item) ? item.dataset.borderDash : undefined) as [number, number] | undefined
      // eslint-disable-next-line github/no-dataset
      const {label: series, backgroundColor, borderColor} = item.dataset

      if (shouldUseLineIcon(item)) {
        const lineStrokeDasharray = borderDash?.map(n => n / lineStrokeDashRatio).join(' ')
        const height = width
        const y = height / 2
        iconElement = (
          <svg aria-label={`Legend icon for series ${series}`} width={width} height={height}>
            <line
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={borderColor as string}
              strokeWidth={strokeWidth}
              strokeDasharray={lineStrokeDasharray}
            />
          </svg>
        )
      } else {
        const circleStrokeDasharray = borderDash?.map(n => n / circleStrokeDashRatio).join(' ')
        iconElement = (
          <svg aria-label={`Legend icon for series ${series}`} width={diameter} height={diameter}>
            <circle
              cx={diameter / 2}
              cy={diameter / 2}
              r={innerRadius}
              fill={backgroundColor as string}
              stroke={borderColor as string}
              strokeWidth={strokeWidth}
              strokeDasharray={circleStrokeDasharray}
              strokeDashoffset={((diameter - strokeWidth) * Math.PI) / 4} // Start stroke at the top of the circle
            />
          </svg>
        )
      }

      return iconElement
    }
  })()

  const numberFormatter = Intl.NumberFormat('en-US', {notation: 'standard'})

  const getTotalAlertsCount = (): string => {
    const values = tooltip.dataPoints.map(item => item.parsed.y)
    const total = values.reduce((acc, curr) => {
      if (typeof curr === 'number') {
        return acc + curr
      }
      return acc
    }, 0)

    return numberFormatter.format(total)
  }

  const getItemRowElements = (function (): () => JSX.Element[] {
    const items = itemSort ? [...tooltip.dataPoints].sort(itemSort) : tooltip.dataPoints
    const getValue =
      itemValueTransform ??
      ((item: SupportedTooltipItem): string => {
        const value = item.parsed.y
        let formattedValue = ''
        if (typeof value === 'number') {
          // strip all commas because parseFloat will ignore everything after it
          formattedValue = numberFormatter.format(value)
        }

        return formattedValue
      })

    return () => {
      return items.map(item => {
        // eslint-disable-next-line github/no-dataset
        const series = item.dataset.label

        return (
          <React.Fragment key={`${item.label}-${series}`}>
            {getIconElement(item)}
            <span>{series}</span>
            <Text className="text-emphasized" sx={{justifySelf: 'end'}}>
              {getValue(item)}
            </Text>
          </React.Fragment>
        )
      })
    }
  })()

  const getTitle = (): string => {
    const title = tooltip.title.join(' ')
    if (customTitle) {
      return customTitle(title, tooltip.dataPoints)
    }

    return title
  }

  const tooltipElement = (function (): JSX.Element {
    return (
      <Box
        className={'position-absolute text-small no-wrap color-bg-default border rounded-2 p-2'}
        sx={{pointerEvents: 'none', ...getPositionStyles()}}
      >
        <span className="d-block color-fg-muted text-emphasized mb-2">{getTitle()}</span>
        <Box sx={{display: 'grid', alignItems: 'center', gridTemplateColumns: `${width}px auto auto`, gap: '4px 8px'}}>
          {getItemRowElements()}
        </Box>
        {showTotal && (
          <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
            <span>Total</span>
            <span className="text-emphasized">{getTotalAlertsCount()}</span>
          </Box>
        )}
      </Box>
    )
  })()

  return createPortal(tooltipElement, document.body)
}

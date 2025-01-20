import {useMemo} from 'react'

interface Props {
  width?: number
  height?: number
  uniqueKey: string
  label?: string
  points: number[]
}

const strokeWidth = 2
const defaultWidth = 120
const defaultHeight = 25
export function Sparkline({uniqueKey, points, width = defaultWidth, height = defaultHeight, label}: Props) {
  const coordinates = useMemo(() => getCoordinates(points, width, height - strokeWidth), [points, width, height])

  const gradientId = `gradient-${uniqueKey}`
  const maskId = `sparkline-${uniqueKey}`

  return (
    <div style={{height}}>
      <svg
        data-testid={`${uniqueKey}-sparkline`}
        aria-label={label}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="1" y2="0">
            <stop offset="0%" stopColor="var(--color-calendar-graph-day-L1-bg)" />
            <stop offset="10%" stopColor="var(--color-calendar-graph-day-L2-bg)" />
            <stop offset="25%" stopColor="var(--color-calendar-graph-day-L3-bg)" />
            <stop offset="50%" stopColor="var(--color-calendar-graph-day-L4-bg)" />
          </linearGradient>
          <mask id={maskId} x="0" y="0" width={width} height={height}>
            <polyline
              transform={`translate(0, ${height - strokeWidth / 2}) scale(1,-1)`}
              points={coordinates.join(' ')}
              fill="transparent"
              stroke="#8cc665"
              strokeWidth={strokeWidth}
            />
          </mask>
        </defs>

        <g>
          <rect
            x="0"
            y="0"
            width={width}
            height={height}
            style={{
              stroke: 'none',
              fill: `url(#${gradientId})`,
              mask: `url(#${maskId})`,
            }}
          />
        </g>
      </svg>
    </div>
  )
}

export function getCoordinates(points: number[], width: number, height: number): string[] {
  const scaledPoints = rescale(points.length < 2 ? [0, 0] : points, height)
  const xOffset = width / (scaledPoints.length - 1)

  const coordinates = []
  for (let i = 0; i < scaledPoints.length; i++) {
    const y = scaledPoints[i]!
    coordinates.push(`${xOffset * i},${y}`)
  }

  return coordinates
}

/*
 * Scale the y-axis of the graph to fit within the maximum pixel height.
 * Prevents commit counts greater than the pixel height from skewing the
 * graph.
 */
function rescale(points: number[], height: number): number[] {
  const maxPoint = Math.max(...points)
  if (maxPoint <= height) {
    return points
  }
  return points.map(point => roundToTwoDecimalPlaces((point / maxPoint) * height))
}

function roundToTwoDecimalPlaces(value: number) {
  return Math.round(value * 100) / 100
}

import {Box, Tooltip} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

interface AheadBehindCountProps {
  aheadCount: number
  behindCount: number
  maxDiverged?: number
  width?: number
  sx?: BetterSystemStyleObject
}

export default function AheadBehindCount({
  aheadCount,
  behindCount,
  maxDiverged,
  width = AheadBehindCountWidth,
  sx = {},
}: AheadBehindCountProps) {
  const aheadBehindCount = aheadCount + behindCount
  // if maxDiverged is undefined (0 is falsey),
  // then calculate the percent relative to the sum of the aheadBehindCount
  const aheadPercent =
    maxDiverged !== undefined
      ? scaleAheadBehind(aheadCount, maxDiverged)
      : Math.floor((aheadCount / aheadBehindCount) * 100)
  const behindPercent = maxDiverged !== undefined ? scaleAheadBehind(behindCount, maxDiverged) : 100 - aheadPercent

  return (
    <Box
      sx={{
        ...sx,
        display: 'inline-block',
        color: 'fg.muted',
      }}
      aria-label={`Ahead behind count: ${aheadBehindCount}`}
      className="branch-a-b-count"
      role="img"
    >
      <Tooltip aria-label={`Ahead behind count: ${aheadBehindCount}`}>
        <Box
          sx={{
            display: 'flex',
            width,
          }}
        >
          <CountHalf aheadOrBehind="behind" count={behindCount} percentage={behindPercent} />
          <CountHalf aheadOrBehind="ahead" count={aheadCount} percentage={aheadPercent} />
        </Box>
      </Tooltip>
    </Box>
  )
}

const CountHalf = ({
  aheadOrBehind,
  count,
  percentage,
}: {
  aheadOrBehind: 'ahead' | 'behind'
  count: number
  percentage: number
}) => (
  <Box
    sx={{
      position: 'relative',
      width: '50%',
      paddingBottom: 1,
      ...(aheadOrBehind === 'ahead'
        ? {
            textAlign: 'left',
            borderLeft: '1px solid',
            borderColor: 'border.default',
          }
        : {
            textAlign: 'right',
          }),
    }}
  >
    <Box
      sx={{
        position: 'relative',
        display: 'block',
        top: '-1px',
        paddingX: 1,
        fontSize: 0,
      }}
    >
      {count}
    </Box>
    <Box
      data-testid={`ahead-behind-${percentage}`}
      sx={{
        position: 'absolute',
        width: `${percentage}%`,
        minWidth: 1,
        height: '4px',
        ...(aheadOrBehind === 'ahead'
          ? {
              left: 0,
              borderRadiusTopRight: 2,
              borderRadiusBottomRight: 2,
            }
          : {
              right: 0,
              borderRadiusTopLeft: 2,
              borderRadiusBottomLeft: 2,
            }),
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          height: '100%',
          backgroundColor: count > 0 ? 'neutral.muted' : 'transparent',
          ...(aheadOrBehind === 'ahead'
            ? {
                left: 0,
              }
            : {
                right: 0,
              }),
        }}
        className="anim-grow-x"
      />
    </Box>
  </Box>
)

export const AheadBehindCountWidth = 150

// Borrowed from app/view_models/branches/ahead_behind_view.rb
export function scaleAheadBehind(aheadBehindCount: number, maxDiverged: number): number {
  aheadBehindCount = aheadBehindCount <= 0 ? 0 : Math.log10(aheadBehindCount)
  maxDiverged = maxDiverged <= 0 ? 0 : Math.log10(maxDiverged)
  // Calculate where the number falls between 0 and max diverged
  // with an output range of 0 and 1
  const uninterpolatedNumber = maxDiverged > 0 ? aheadBehindCount / maxDiverged : 0
  // Calculate where the number is between 0 and 100
  const interpolatedNumber = uninterpolatedNumber * 100
  return parseFloat(interpolatedNumber.toFixed(2))
}

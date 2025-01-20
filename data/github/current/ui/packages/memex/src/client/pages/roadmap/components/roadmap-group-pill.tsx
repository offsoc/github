import {testIdProps} from '@github-ui/test-id-props'
import {Box, Label} from '@primer/react'
import {memo, useRef} from 'react'

import useIsVisible from '../../../components/board/hooks/use-is-visible'
import {ROADMAP_PILL_HEIGHT} from '../../../components/roadmap/constants'
import {formatISODateString} from '../../../helpers/parsing'
import {useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {useRoadmapGetViewport} from '../roadmap-view-provider'
import {ROADMAP_PILL_Z_INDEX} from '../roadmap-z-index'
import {getTooltipText} from '../tooltip-helper'
import {NavigationArrow} from './roadmap-pill-buttons'
import {RoadmapCell} from './roadmap-table-layout'

const PILL_PADDING = 16
const PILL_STICKY_MARGIN = 8

const roadmapCellStyles = {
  backgroundColor: 'initial',
  zIndex: ROADMAP_PILL_Z_INDEX,
  display: 'flex',
  alignItems: 'center',
  width: '100%',
}
const pillStyles = {
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  lineHeight: 1.5,
  left: 0,
  height: ROADMAP_PILL_HEIGHT,
  fontSize: '14px',
  fontWeight: 'normal',
  backgroundColor: 'canvas.default',
  padding: `0 ${PILL_PADDING}px`,
  borderColor: 'border.default',
  borderRadius: '14px',
  borderWidth: '2px',
}

type RoadmapGroupPillProps = {
  startDate?: Date
  endDate?: Date
  pillOffsetLeft: number
  pillWidth: number
}

/**
 * Roadmap Group Pill renders with the position and size determined by the min/max of the dates of the items in the group.
 */
export const RoadmapGroupPill = memo(function RoadmapGroupPill({
  startDate,
  endDate,
  pillOffsetLeft,
  pillWidth,
}: RoadmapGroupPillProps) {
  const getViewport = useRoadmapGetViewport()
  const tableWidth = useRoadmapTableWidth()
  const ref = useRef<HTMLDivElement | null>(null)
  const {isVisible} = useIsVisible({ref})

  const leadingEdgeRef = useRef<HTMLDivElement | null>(null)
  const {isVisible: isLeadingEdgeVisible} = useIsVisible({ref: leadingEdgeRef})

  // Relative positioning within the visible roadmap viewport.  Add 1 to avoid fractional floating point errors.
  const viewport = getViewport()
  const isBefore = !isVisible && pillOffsetLeft + pillWidth <= viewport.left + 1
  const isAfter = !isVisible && pillOffsetLeft >= viewport.right - 1

  const timeSpanText = getTooltipText({start: startDate, end: endDate})

  const visiblePill = (
    <Label
      sx={pillStyles}
      style={{
        width: pillWidth,
      }}
      className="roadmap-pill"
      {...testIdProps('roadmap-view-group-header-item')}
    />
  )

  const pillContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexShrink: 0,
          color: 'fg.muted',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          textAlign: 'left',
          width: 'min-content',
        }}
      >
        {timeSpanText}
      </Box>
    </>
  )

  return (
    <RoadmapCell
      role="gridcell"
      data-date-start={startDate ? formatISODateString(startDate) : undefined}
      data-date-end={endDate ? formatISODateString(endDate) : undefined}
      sx={roadmapCellStyles}
    >
      <Box
        ref={leadingEdgeRef}
        role={'presentation'}
        sx={{
          position: 'absolute',
          width: PILL_PADDING - PILL_STICKY_MARGIN,
        }}
        style={{left: pillOffsetLeft}}
      />
      <Box
        ref={ref}
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
        }}
        style={{left: pillOffsetLeft}}
      >
        {visiblePill}
      </Box>
      {isVisible ? (
        <Box
          sx={{
            position: isLeadingEdgeVisible ? 'absolute' : 'sticky',
            display: 'flex',
            alignItems: 'center',
          }}
          style={{
            left: isLeadingEdgeVisible ? pillOffsetLeft + PILL_PADDING : tableWidth + PILL_STICKY_MARGIN,
          }}
        >
          {pillContent}
        </Box>
      ) : isBefore || isAfter ? (
        <NavigationArrow isBefore={isBefore} startDate={startDate} endDate={endDate} />
      ) : null}
    </RoadmapCell>
  )
})

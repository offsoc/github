import {testIdProps} from '@github-ui/test-id-props'
import {ArrowLeftIcon, ArrowRightIcon, IterationsIcon, PlusIcon} from '@primer/octicons-react'
import {Box, IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {clsx} from 'clsx'
import {memo, useCallback, useState} from 'react'

import {ROADMAP_PILL_HEIGHT} from '../../../components/roadmap/constants'
import {useRoadmapDateFieldsMenu} from '../../../features/roadmap/roadmap-date-fields-menu'
import {not_typesafe_nonNullAssertion} from '../../../helpers/non-null-assertion'
import type {RoadmapColumn, TimeSpan} from '../../../helpers/roadmap-helpers'
import {useRoadmapSettings, useRoadmapTableWidth} from '../../../hooks/use-roadmap-settings'
import {isIterationColumnModel} from '../../../models/column-model/guards'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {useNavigate} from '../../../router'
import {useProjectRouteParams} from '../../../router/use-project-route-params'
import {PROJECT_SETTINGS_FIELD_ROUTE} from '../../../routes'
import {RoadmapResources} from '../../../strings'
import {formatDateUtc} from '../date-utils'
import {
  PillAreaFocusType,
  type RoadmapPillAreaFocusWrapperProps,
  useRoadmapPillAreaFocus,
} from '../hooks/use-roadmap-pill-area-focus'
import {useUpdateRoadmapDates} from '../hooks/use-update-roadmap-dates'
import {
  useRoadmapGetTimeSpan,
  useRoadmapGetViewport,
  useRoadmapNavigation,
  useRoadmapView,
} from '../roadmap-view-provider'
import {ROADMAP_NAVIGATION_ARROW_Z_INDEX} from '../roadmap-z-index'
import {dateFieldsConfigured, getTooltipText} from '../tooltip-helper'

const ADD_BUTTON_ICON_WIDTH = 22
const ADD_BUTTON_MARGIN = 8
const ADD_BUTTON_WIDTH = ADD_BUTTON_MARGIN + ADD_BUTTON_ICON_WIDTH

const defaultButtonStyles: BetterSystemStyleObject = {
  borderRadius: '5px',
  backgroundColor: 'canvas.default',
  border: '1px solid',
  borderColor: 'border.muted',
  padding: '0',
  color: 'fg.muted',
  width: ADD_BUTTON_ICON_WIDTH,
  position: 'relative',

  '&.is-focused': {
    outline: 'none',
  },

  '&.is-focused::before': {
    content: '""',
    position: 'absolute',
    width: 'calc(100% - 2px)',
    height: 'calc(100% - 2px)',
    border: '2px solid',
    borderColor: 'accent.emphasis',
    inset: -1,
    borderRadius: '5px',
  },
}

const hoverButtonStyles: BetterSystemStyleObject = {
  ...defaultButtonStyles,
  backgroundColor: 'unset',
  border: 'none',
  '&.roadmap-add-date-button:hover': {
    backgroundColor: 'unset',
    border: 'none',
  },
}

const ghostPillStyles: BetterSystemStyleObject = {
  position: 'absolute',
  height: ROADMAP_PILL_HEIGHT,
  backgroundColor: 'canvas.default',
  borderStyle: 'dotted',
  borderWidth: '1px',
  borderColor: 'fg.muted',
  borderRadius: '5px',
  opacity: 0.7,
}

/**
 * Renders an arrow button to navigate/scroll to the roadmap pill if it is out of view.
 */
type NavigationArrowProps = {
  isBefore: boolean
  startDate?: Date
  endDate?: Date
  role?: React.AriaRole
  wrapperProps?: RoadmapPillAreaFocusWrapperProps
  onFocusInternalElement?: React.FocusEventHandler<Element>
  arrowButtonRef?: React.RefObject<HTMLButtonElement>
  className?: string
}

export const NavigationArrow = memo(function NavigationArrow({
  isBefore,
  startDate,
  endDate,
  role,
  wrapperProps,
  onFocusInternalElement,
  arrowButtonRef,
  className,
}: NavigationArrowProps) {
  const {scrollToDate} = useRoadmapNavigation()
  const getViewport = useRoadmapGetViewport()
  const tableWidth = useRoadmapTableWidth()
  const viewport = getViewport()

  const onArrowClick = useCallback(() => {
    if (startDate) {
      scrollToDate(startDate, true)
    }
  }, [scrollToDate, startDate])

  const tooltip = startDate
    ? RoadmapResources.scrollToDateText(startDate)
    : endDate
      ? RoadmapResources.scrollToDateText(endDate)
      : ''

  return (
    <Box
      role={role}
      sx={{
        position: 'sticky',
        zIndex: ROADMAP_NAVIGATION_ARROW_Z_INDEX,
      }}
      // Separate from sx to avoid recomputing the `sx` CSS class when the table width changes
      style={{
        left: isBefore
          ? tableWidth + ADD_BUTTON_MARGIN
          : tableWidth + (viewport.right - viewport.left) - ADD_BUTTON_WIDTH,
      }}
      {...(wrapperProps ? wrapperProps : {})}
    >
      <IconButton
        tooltipDirection={isBefore ? 'e' : 'w'}
        onClick={onArrowClick}
        variant="invisible"
        icon={isBefore ? ArrowLeftIcon : ArrowRightIcon}
        {...testIdProps('roadmap-navigation-button')}
        sx={defaultButtonStyles}
        aria-label={tooltip}
        ref={arrowButtonRef ?? null}
        className={clsx(className)}
        {...(onFocusInternalElement ? {onFocus: onFocusInternalElement} : {})}
      />
    </Box>
  )
})

export const NavigationArrowWithFocusContext = memo(function NavigationArrowWithFocusContext(props: {
  isBefore: boolean
  startDate?: Date
  endDate?: Date
  role?: React.AriaRole
}) {
  const {wrapperProps, onFocusInternalElement, arrowButtonRef, focusType} = useRoadmapPillAreaFocus()
  return (
    <NavigationArrow
      wrapperProps={wrapperProps}
      onFocusInternalElement={onFocusInternalElement}
      arrowButtonRef={arrowButtonRef}
      className={focusType === PillAreaFocusType.ArrowButton ? 'is-focused' : undefined}
      {...props}
    />
  )
})

type AddDateButtonProps = {
  /** The item to add a date to. */
  item: MemexItemModel
  /** The target date to add or use to lookup the corresponding iteration value. If undefined, add to today. */
  date: Date | undefined
  /** The x offset for the button in the roadmap, if hovered. */
  offsetX: number
  /** Whether this is the default, non-hovered button to add to today.  Supports keyboard use on focus. */
  isDefaultAddButton?: boolean
  /** Optionally suppress showing the tooltip */
  hideTooltip?: boolean
  /** Optionally suppress showing the placeholder for adding */
  hidePlaceholder?: boolean
}

/**
 * Renders an Add date/iteration + button with variable styling/behavior based on hover or default button positioning
 */
export const AddDateButton = memo(function AddDateButton({
  item,
  date,
  offsetX,
  isDefaultAddButton,
  hideTooltip,
  hidePlaceholder,
}: AddDateButtonProps) {
  const getTimeSpan = useRoadmapGetTimeSpan()
  const {today} = useRoadmapView()
  const {updateItemDates} = useUpdateRoadmapDates()
  const {dateFields} = useRoadmapSettings()
  const tableWidth = useRoadmapTableWidth()
  const {setOpenDateConfigurationMenu} = useRoadmapDateFieldsMenu()
  const navigate = useNavigate()
  const {wrapperProps, onFocusInternalElement, addDateButtonRef, focusType} = useRoadmapPillAreaFocus()
  const projectRouteParams = useProjectRouteParams()
  const hasDateFields = dateFieldsConfigured(dateFields)
  const addToToday = isDefaultAddButton || !date
  const targetDate = addToToday ? today : date
  const timeSpan = getTimeSpan(targetDate)
  const isMissingIteration = !timeSpan.start || !timeSpan.end

  let tooltip: string | undefined
  if (isMissingIteration) {
    tooltip = RoadmapResources.noIterationConfiguredTooltip(formatDateUtc(targetDate))
  } else if (hasDateFields) {
    tooltip = getTooltipText(timeSpan)
    tooltip = addToToday ? `Add to today at ${tooltip}` : `Add to ${tooltip}`
  } else {
    tooltip = RoadmapResources.noDateFieldsConfiguredTooltip
  }

  const onClick = useCallback(() => {
    if (!hasDateFields) {
      setOpenDateConfigurationMenu(true)
    } else if (isMissingIteration) {
      const iterationField = getIterationField(
        !timeSpan.start ? not_typesafe_nonNullAssertion(dateFields[0]) : not_typesafe_nonNullAssertion(dateFields[1]),
      )
      if (iterationField) {
        navigate({
          pathname: PROJECT_SETTINGS_FIELD_ROUTE.generatePath({
            ...projectRouteParams,
            fieldId: iterationField.id,
          }),
        })
      }
    } else if (targetDate) {
      updateItemDates(item, timeSpan)
    }
  }, [
    dateFields,
    hasDateFields,
    isMissingIteration,
    item,
    navigate,
    setOpenDateConfigurationMenu,
    targetDate,
    timeSpan,
    updateItemDates,
    projectRouteParams,
  ])

  const [isFocused, setIsFocused] = useState<boolean>(false)

  const onFocus = useCallback(
    (e: React.FocusEvent<HTMLButtonElement>) => {
      setIsFocused(true)
      if (onFocusInternalElement) onFocusInternalElement(e)
    },
    [onFocusInternalElement],
  )

  const onBlur = useCallback(() => setIsFocused(false), [])
  const showPlaceholder = !hidePlaceholder && !(isDefaultAddButton && !isFocused) && !isMissingIteration
  const icon = (isDefaultAddButton && !isFocused) || !isMissingIteration ? PlusIcon : IterationsIcon
  const buttonSx = addToToday || isMissingIteration ? defaultButtonStyles : hoverButtonStyles
  const {sx, style} = isDefaultAddButton
    ? {
        sx: {
          position: 'sticky',
          zIndex: ROADMAP_NAVIGATION_ARROW_Z_INDEX,
        } satisfies BetterSystemStyleObject,
        // Separate from sx to avoid recomputing the `sx` CSS class when the table width changes
        style: {
          left: tableWidth + ADD_BUTTON_MARGIN,
        },
      }
    : {
        sx: {
          position: 'absolute',
          zIndex: ROADMAP_NAVIGATION_ARROW_Z_INDEX,
          // When rendering the icon button tooltip, we want to remove the animation so that the tooltip doesn't
          // appear to fade in and out as the cursor is moved across the row
          '[popover]:popover-open': {
            // Show popover without animation
            opacity: hideTooltip ? 0 : 1,
            animation: 'none',
          },
        } satisfies BetterSystemStyleObject,
        style: {left: offsetX - ADD_BUTTON_ICON_WIDTH / 2},
      }

  return (
    <>
      {showPlaceholder && <PillPlaceholder timeSpan={timeSpan} />}
      <Box sx={sx} style={style} role="gridcell" {...wrapperProps}>
        <IconButton
          // We are using the tooltip as a rendering hint here because we want to ensure that the tooltip position
          // gets updated whenever the actively hovered day changes - otherwise it may lag behind the cursor
          key={tooltip}
          tooltipDirection={hasDateFields && !isMissingIteration && !addToToday ? 'n' : 'e'}
          onClick={onClick}
          onFocus={onFocus}
          onBlur={onBlur}
          variant="invisible"
          icon={icon}
          sx={buttonSx}
          {...testIdProps('roadmap-add-date-button')}
          className={clsx('roadmap-add-date-button', {
            'is-focused': focusType === PillAreaFocusType.AddDateButton,
          })}
          aria-label={tooltip}
          ref={addDateButtonRef}
        />
      </Box>
    </>
  )
})

/**
 * Renders a placholder time span indicating where a pill will be added based on the date/iteration
 */
const PillPlaceholder = ({timeSpan}: {timeSpan: TimeSpan}) => {
  const {getX, columnWidth} = useRoadmapView()
  const spanStartLeftOffset = timeSpan.start ? getX(timeSpan.start) : 0
  const spanEndLeftOffset = timeSpan.end ? getX(timeSpan.end) : 0

  return (
    <Box
      role="gridcell"
      sx={ghostPillStyles}
      style={{
        width: spanEndLeftOffset - spanStartLeftOffset + columnWidth,
        left: spanStartLeftOffset,
      }}
    >
      &nbsp;
    </Box>
  )
}

function getIterationField(column: RoadmapColumn) {
  if (column && column !== 'none' && isIterationColumnModel(column)) {
    return column
  }
}

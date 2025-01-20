import {useMemo, useRef, useState} from 'react'
import type {CheckStateRollup} from '../../../page-data/payloads/status-checks'
import {countChecksByGroup} from '../../../helpers/status-check-helpers'
import styles from './StatusCheckStatesIcon.module.css'
import {clsx} from 'clsx'
import {CircleOcticon} from '@primer/react'
import {HEADER_ICON_SIZE} from '../../../constants'
import {CheckIcon, XIcon} from '@primer/octicons-react'

const icons: {[key: string]: JSX.Element} = {
  PASSING: (
    <CircleOcticon
      icon={() => <CheckIcon size={16} />}
      className="bgColor-success-emphasis fgColor-onEmphasis"
      size={HEADER_ICON_SIZE}
    />
  ),
  FAILING: (
    <CircleOcticon
      icon={() => <XIcon size={16} />}
      className="bgColor-danger-emphasis fgColor-onEmphasis"
      size={HEADER_ICON_SIZE}
    />
  ),
}

export const sectionNames = {
  FAILURE: ['CANCELLED', 'ERROR', 'FAILURE', 'STALE', 'STARTUP_FAILURE', 'TIMED_OUT'],
  PENDING: [
    '_UNKNOWN_VALUE',
    'EXPECTED',
    'QUEUED',
    'PENDING',
    'WAITING',
    'REQUESTED',
    'ACTION_REQUIRED',
    'IN_PROGRESS',
  ],
  SKIPPED: ['SKIPPED', 'NEUTRAL'],
  SUCCESS: ['SUCCESS', 'COMPLETED'],
}

const transition = {
  length: 1000, // ms
  delay: 0, // ms
}

const sectionColorMapping = {
  FAILURE: 'var(--fgColor-danger)',
  SUCCESS: 'var(--fgColor-success)',
  PENDING: 'var(--fgColor-attention)',
  SKIPPED: 'var(--fgColor-neutral)',
}

const strokeWidth = 12
const radius = 100 / 2 - strokeWidth / 2
const circumference = 2 * Math.PI * radius
const svgSettings = {
  gapPercent: 5,
  strokeWidth,
  size: 32, // px
  circleSize: 100, // px
  radius,
  circumference,
  percentToDegree: 360 / 100, // deg
  percentToPx: circumference / 100, // px
}

type DashArray = `${number} ${number}`
type Transform = `rotate(${string}deg)`
type SectionName = keyof typeof sectionNames
type Section = {
  name: SectionName
  percentage: number
  dashArray: DashArray
  transform: Transform
  stroke: string | undefined
}

function dashArray(percentage: number): DashArray {
  return `${Math.max(percentage * svgSettings.percentToPx, 0)} ${svgSettings.circumference}`
}

const sumOfPriorParts = (percentage: number, previousStrokes: number[]) => {
  if (percentage === 0) return percentage
  let sum = 0
  for (let i = 0; i < previousStrokes.length; i++) {
    const stroke = previousStrokes[i]
    if (!stroke) continue
    sum += stroke + svgSettings.gapPercent
  }
  return sum
}

function transform(percentage: number, previousStrokes: number[], index: number, numOfSections: number): Transform {
  let additionalStrokeOffset = 0
  const isNotFirstOrLastSection = index !== 0 || index !== numOfSections - 1
  const onlyTwoSections = numOfSections === 2

  // To keep visual gap between start and end sections, we need to add additional gaps to sections between start and end sections.
  // If there are only 2 groups, we also need to add additonal stroke offset.
  if ((isNotFirstOrLastSection && numOfSections > 1) || onlyTwoSections) {
    additionalStrokeOffset = 2.5
  }

  const strokeOffset = sumOfPriorParts(percentage, previousStrokes)

  return `rotate(${-90 + (strokeOffset + additionalStrokeOffset) * svgSettings.percentToDegree}deg)`
}

function isValidSectionKey(key: string): key is SectionName {
  return Object.keys(sectionNames).includes(key)
}

function getPercentage(
  sectionName: SectionName,
  count: number,
  totalCount: number,
  numberOfSections: number,
  sectionsNotMeetingMinimumPercentage: string[],
  percentageReduction: number,
): number {
  let percentage = (count / totalCount) * 100

  // Remove 5% from each section to ensure a visual gap between SVG circle strokes
  if (numberOfSections > 1) percentage -= svgSettings.gapPercent

  // Add back 5% to the percentage, so that the SVG circle stroke is visible for smaller sections.
  if (sectionsNotMeetingMinimumPercentage.includes(sectionName)) return percentage + 5

  return percentage - percentageReduction
}

function getPercentageReduction(sectionsNotMeetingMinimumPercentage: string[], numOfSections: number) {
  // Percentage reduction is dynamically calculated # of sections and # of sections that don't meet minimum percentage
  let percentageReduction = 0

  if (sectionsNotMeetingMinimumPercentage.length === 3) {
    // 15% gap / (sections count - 3)
    percentageReduction = 15 / (numOfSections - 3)
  } else if (sectionsNotMeetingMinimumPercentage.length === 2) {
    // 10% gap / (sections count - 2)
    percentageReduction = 10 / (numOfSections - 2)
  } else if (sectionsNotMeetingMinimumPercentage.length === 1) {
    // 5% gap / (sections count - 1)
    percentageReduction = 5 / (numOfSections - 1)
  }

  return percentageReduction
}

function isBelowSixPercent(count: number, totalCount: number) {
  return (count / totalCount) * 100 < 6
}

export function buildSectionsData(statusRollupSummary: CheckStateRollup[]): Section[] {
  const countsBySection = countChecksByGroup(statusRollupSummary, sectionNames)
  // Order matters here as we want the Icon's color wheel starting and ending in this order:
  // 1. SUCCESS
  // 2. SKIPPED
  // 3. PENDING
  // 4. FAILURE
  const orderedSections = [
    {name: 'SUCCESS', count: countsBySection['SUCCESS'] ?? 0},
    {name: 'SKIPPED', count: countsBySection['SKIPPED'] ?? 0},
    {name: 'PENDING', count: countsBySection['PENDING'] ?? 0},
    {name: 'FAILURE', count: countsBySection['FAILURE'] ?? 0},
  ]
    // Remove null values.
    .flatMap(section => (section ? [section] : []))
    // Remove counts that are < 1 as we don't need to run calculations or render them.
    .filter(section => {
      if (!section.count) return false
      return section.count > 0
    })
  const totalCount = orderedSections.reduce((acc, section) => acc + section.count, 0)
  const previousStrokes: number[] = []
  const numOfSections = orderedSections.length ?? 0
  const sectionsNotMeetingMinimumPercentage = orderedSections
    .filter(({count}) => isBelowSixPercent(count, totalCount))
    .map(section => section.name)
  const percentageReduction = getPercentageReduction(sectionsNotMeetingMinimumPercentage, numOfSections)

  return (
    orderedSections
      .map((section, index) => {
        if (!isValidSectionKey(section.name)) return null
        const count = section.count

        if (!count) return null

        const percentage = getPercentage(
          section.name,
          count,
          totalCount,
          numOfSections,
          sectionsNotMeetingMinimumPercentage,
          percentageReduction,
        )
        const data = {
          name: section.name,
          percentage,
          dashArray: dashArray(percentage),
          transform: transform(percentage, previousStrokes, index, numOfSections),
          stroke: sectionColorMapping[section.name],
        }

        previousStrokes.push(percentage)

        return data
      })
      // Remove null values
      .flatMap(section => (section ? [section] : []))
  )
}
/**
 * Returns a SVG Circle Element
 * The colored sections are grouped by status.
 * Each section's size is propertional to the percentage of status checks in the group.
 * There are 4 colored groupings.
 * The grouping color scheme matches the styling of the Status Check rows by state.
 *
 * @param CheckStateRollup[]
 */
export function StatusCheckStatesIcon({statusRollupSummary}: {statusRollupSummary: CheckStateRollup[]}) {
  const [shouldAnimate, setAnimate] = useState(false)
  const prevStatusRollupSummary = useRef<CheckStateRollup[] | undefined>(undefined)

  const sections = useMemo(() => buildSectionsData(statusRollupSummary), [statusRollupSummary])

  // We don't want to animate in if the initial state is already the completed one (e.g. just passing checks, or just failing checks).
  const allChecksPassing = statusRollupSummary.length === 1 && statusRollupSummary[0]?.state === 'SUCCESS'
  const allChecksFailing = statusRollupSummary.length === 1 && statusRollupSummary[0]?.state === 'FAILURE'
  const shouldRenderSVG = allChecksPassing || allChecksFailing ? shouldAnimate : true

  useMemo(() => {
    if (prevStatusRollupSummary.current !== undefined && statusRollupSummary.length > 0) {
      setAnimate(true)
    }
    prevStatusRollupSummary.current = statusRollupSummary
  }, [statusRollupSummary])

  return (
    <div className={styles.iconWrapper}>
      {allChecksPassing && (
        <div className={clsx(styles['icon'], shouldAnimate && styles['icon-animate'])}>{icons.PASSING}</div>
      )}
      {allChecksFailing && (
        <div className={clsx(styles['icon'], shouldAnimate && styles['icon-animate'])}>{icons.FAILING}</div>
      )}

      {shouldRenderSVG && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${svgSettings.circleSize} ${svgSettings.circleSize}`}
          shapeRendering="crispEdges"
          width={svgSettings.size}
          height={svgSettings.size}
          style={{userSelect: 'none'}}
          fill="none"
          aria-hidden="true"
        >
          {sections.map(section => (
            <circle
              key={section.name}
              cx={svgSettings.circleSize / 2}
              cy={svgSettings.circleSize / 2}
              r={radius}
              style={{
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeDashoffset: 0,
                strokeWidth: svgSettings.strokeWidth,
                transition: `all ${transition.length}ms ease ${transition.delay}ms`,
                transformOrigin: '50% 50%',
                shapeRendering: 'geometricPrecision',
                strokeDasharray: section.dashArray,
                transform: section.transform,
                stroke: section.stroke,
              }}
            />
          ))}
        </svg>
      )}
    </div>
  )
}

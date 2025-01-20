import {useTheme} from '@primer/react'
import {useMemo} from 'react'
import styles from './ProgressCircle.module.css'
import {useNamedColor, type ColorName} from '@github-ui/use-named-color'
import {clsx} from 'clsx'

type Size = 14 | 16

export interface ProgressCircleProps {
  percentCompleted: number
  size?: Size
  color?: ColorName
  svgClassName?: string
}

interface ProgressCircleInternalProps extends Omit<ProgressCircleProps, 'size'> {
  size: Size
  accent: string
}

interface CompletedIconProps extends Omit<ProgressCircleProps, 'size' | 'percentCompleted'> {
  size: Size
  accent: string
}

function CompletedIcon({size, accent}: CompletedIconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox={`0 0 16 16`}
      className={styles.completedIcon}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0206 11.1074C9.68518 11.3949 9.18014 11.3561 8.8926 11.0206L5.8926 7.52061C5.62055 7.20322 5.63873 6.72989 5.93432 6.4343L7.43432 4.9343C7.74674 4.62188 8.25327 4.62188 8.56569 4.9343C8.87811 5.24672 8.87811 5.75325 8.56569 6.06567L7.58953 7.04182L10.1074 9.97935C10.3949 10.3148 10.3561 10.8198 10.0206 11.1074Z"
        fill={accent}
      />

      <circle
        className={styles.animatedCircle}
        stroke={accent}
        strokeWidth="2"
        fill="transparent"
        cx="50%"
        cy="50%"
        r={Math.floor(size / 2) - 1}
      />
    </svg>
  )
}

const ProgressCircleInternal = ({percentCompleted, size, accent, svgClassName}: ProgressCircleInternalProps) => {
  const {theme} = useTheme()
  const strokeWidth = 15
  const radius = Math.floor(100 - strokeWidth) / 2
  const lineCapDiameter = 15
  const lineCapRadius = Math.ceil(lineCapDiameter / 2)
  const circleRotateAdjustment = -75
  const percentCompletedCalculated = percentCompleted >= 100 ? 100 : Math.max(percentCompleted - lineCapRadius, 1)

  const Background = useMemo(
    () => (
      <circle
        className={styles.circle}
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={theme?.colors.border.default}
        strokeWidth={strokeWidth}
      />
    ),
    [radius, strokeWidth, theme],
  )

  const Shade = useMemo(
    () => (
      <circle
        className={styles.circleProgressShade}
        cx="50"
        cy="50"
        r="20"
        fill="none"
        pathLength="100"
        stroke={accent}
        strokeDasharray="100"
        strokeDashoffset={percentCompletedCalculated === 100 ? 0 : 100 - percentCompletedCalculated - lineCapRadius}
        strokeWidth="40"
        style={{
          transform: `rotate(${circleRotateAdjustment - lineCapDiameter}deg)`,
        }}
      />
    ),
    [accent, circleRotateAdjustment, lineCapRadius, lineCapDiameter, percentCompletedCalculated],
  )

  const Ring = useMemo(
    () => (
      <circle
        className={styles.circleProgress}
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        pathLength="100"
        stroke={accent}
        strokeDasharray="100"
        strokeDashoffset={100 - percentCompletedCalculated}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        style={{
          transform: `rotate(${circleRotateAdjustment}deg)`,
        }}
      />
    ),
    [accent, circleRotateAdjustment, percentCompletedCalculated, radius, strokeWidth],
  )

  return (
    <svg
      className={clsx(styles.ringSvg, svgClassName)}
      height={size}
      width={size}
      role="presentation"
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      {percentCompleted > 0 ? Shade : null}

      {Background}

      {percentCompleted > 0 ? Ring : null}
    </svg>
  )
}

export function ProgressCircle({percentCompleted, size = 16, color = 'PURPLE', svgClassName}: ProgressCircleProps) {
  const {accent} = useNamedColor(color)
  // useNamedColor (and useTheme) both can return 'undefined', so provide a fallback that hopefully never is used
  if (!accent) {
    return null
  }

  return percentCompleted === 100 ? (
    <CompletedIcon size={size} accent={accent} />
  ) : (
    <ProgressCircleInternal
      percentCompleted={percentCompleted}
      size={size}
      accent={accent}
      svgClassName={svgClassName}
    />
  )
}

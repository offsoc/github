type PercentageCirclerInternalProps = {
  // from zero to one
  progress: number
  // radius of the circle in pixels
  radius?: number
  // showing success
  isSuccess?: boolean
}

export function PercentageCircle({progress, radius = 11, isSuccess = false}: PercentageCirclerInternalProps) {
  return (
    <svg
      width={radius * 2 + 2}
      height={radius * 2 + 2}
      data-target="tracked-issues-progress.progress"
      data-circumference="38"
      style={{transform: 'rotate(-90deg)'}}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        stroke="var(--borderColor-default, var(--color-border-default))"
        strokeWidth="2"
        fill="transparent"
        cx="50%"
        cy="50%"
        r={radius}
      />
      <circle
        style={{transition: 'stroke-dashoffset 0.35s'}}
        stroke={
          isSuccess ? 'var(--fgColor-done, var(--color-done-fg))' : 'var(--fgColor-default, var(--color-fg-default))'
        }
        strokeWidth="2"
        strokeDasharray={2.0 * Math.PI * radius}
        strokeDashoffset={2.0 * Math.PI * radius * (1.0 - progress)}
        strokeLinecap="round"
        fill="transparent"
        cx="50%"
        cy="50%"
        r={radius}
      />
    </svg>
  )
}

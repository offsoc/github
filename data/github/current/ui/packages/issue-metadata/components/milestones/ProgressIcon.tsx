import {TEST_IDS} from '../../constants/test-ids'

type ProgressIconProps = {
  progress: number
}

export const ProgressIcon = ({progress}: ProgressIconProps) => {
  return (
    <svg
      role="presentation"
      width="16"
      height="16"
      data-target="tracked-issues-progress.progress"
      data-circumference="38"
      style={{transform: 'rotate(-90deg)'}}
      data-testid={TEST_IDS.milestoneProgressIcon}
    >
      {progress < 1 ? null : (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.0206 11.1074C9.68518 11.3949 9.18014 11.3561 8.8926 11.0206L5.8926 7.52061C5.62055 7.20322 5.63873 6.72989 5.93432 6.4343L7.43432 4.9343C7.74674 4.62188 8.25327 4.62188 8.56569 4.9343C8.87811 5.24672 8.87811 5.75325 8.56569 6.06567L7.58953 7.04182L10.1074 9.97935C10.3949 10.3148 10.3561 10.8198 10.0206 11.1074Z"
          fill="var(--fgColor-done, var(--color-done-fg))"
        />
      )}

      <circle
        stroke="var(--borderColor-default, var(--color-border-default))"
        strokeWidth="2"
        fill="transparent"
        cx="50%"
        cy="50%"
        r="6"
      />
      <circle
        style={{transition: 'stroke-dashoffset 0.35s'}}
        stroke="var(--fgColor-done, var(--color-done-fg))"
        strokeWidth="2"
        strokeDasharray={38}
        strokeDashoffset={38 - progress * 38}
        strokeLinecap="round"
        fill="transparent"
        cx="50%"
        cy="50%"
        r="6"
      />
    </svg>
  )
}

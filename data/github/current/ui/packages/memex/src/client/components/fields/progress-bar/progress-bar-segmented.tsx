import {testIdProps} from '@github-ui/test-id-props'
import {useNamedColor} from '@github-ui/use-named-color'
import {ProgressBar} from '@primer/react'
import {clsx} from 'clsx'

import styles from './progress-bar.module.css'
import type {ProgressBarCustomProps} from './types'

export const ProgressBarSegmented = ({
  color,
  completed,
  consistentContentSizing,
  hideNumerals,
  name,
  percentCompleted,
  total,
  ...progressBarProps
}: ProgressBarCustomProps) => {
  const {accent} = useNamedColor(color)
  const segmentsCount = Math.min(total, 22)
  const segmentsProgress = Math.floor((segmentsCount * percentCompleted) / 100)
  const segmentsProgressOrMinProgress = Math.max(segmentsProgress, 1)
  const segmentsCompleteAdjusted = total <= segmentsCount ? completed : segmentsProgressOrMinProgress
  const segmentsComplete = percentCompleted === 0 ? 0 : segmentsCompleteAdjusted
  const segmentsIncomplete = segmentsCount - segmentsComplete

  const containerClasses = clsx(styles.containerSegmented, {
    [`${styles.consistentContentSizing}`]: consistentContentSizing,
  })

  return (
    <div className={containerClasses} {...testIdProps('progress-bar-segmented')}>
      {!hideNumerals && (
        <span className={styles.textCount}>
          {completed} / {total}
        </span>
      )}

      <ProgressBar
        aria-label={name}
        aria-valuenow={percentCompleted}
        aria-valuetext={`${percentCompleted}% complete`}
        className={styles.segmented}
        inline
        {...progressBarProps}
      >
        {new Array(segmentsComplete).fill(null).map((_, i) => (
          <ProgressBar.Item key={i} className={styles.barItemComplete} sx={{backgroundColor: accent}} />
        ))}
        {new Array(segmentsIncomplete).fill(null).map((_, i) => (
          <ProgressBar.Item key={i} className={styles.barItemIncomplete} sx={{backgroundColor: accent}} />
        ))}
      </ProgressBar>

      {!hideNumerals && <span className={styles.textPercentage}>{percentCompleted}%</span>}
    </div>
  )
}

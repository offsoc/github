import {testIdProps} from '@github-ui/test-id-props'
import {useNamedColor} from '@github-ui/use-named-color'
import {ProgressBar} from '@primer/react'
import {clsx} from 'clsx'

import styles from './progress-bar.module.css'
import type {ProgressBarCustomProps} from './types'

export const ProgressBarSolid = ({
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

  const containerClasses = clsx(styles.containerSolid, {
    [`${styles.consistentContentSizing}`]: consistentContentSizing,
  })

  return (
    <div className={containerClasses} {...testIdProps('progress-bar-solid')}>
      {!hideNumerals && (
        <span className={styles.textCount}>
          {completed} / {total}
        </span>
      )}

      <ProgressBar
        aria-label={name}
        aria-valuenow={percentCompleted}
        aria-valuetext={`${percentCompleted}% complete`}
        className={styles.solid}
        inline
        {...progressBarProps}
      >
        <ProgressBar.Item
          progress={percentCompleted}
          className={styles.barItemComplete}
          sx={{backgroundColor: accent}}
        />
        <ProgressBar.Item
          progress={100 - percentCompleted}
          className={styles.barItemIncomplete}
          sx={{backgroundColor: accent}}
        />
      </ProgressBar>

      {!hideNumerals && <span className={styles.textPercentage}>{percentCompleted}%</span>}
    </div>
  )
}

import {ProgressCircle} from '@github-ui/progress-circle'
import {testIdProps} from '@github-ui/test-id-props'
import type {ColorName} from '@github-ui/use-named-color'
import {Label} from '@primer/react'

import styles from './progress-bar.module.css'
import type {ProgressBarAdditionalProps} from './types'

export const ProgressBarRing = ({
  color,
  completed,
  name,
  percentCompleted,
  total,
}: ProgressBarAdditionalProps & {color: ColorName}) => {
  return (
    <Label aria-label={name} className={styles.containerRing} variant="secondary" {...testIdProps('progress-bar-ring')}>
      <ProgressCircle percentCompleted={percentCompleted} size={14} color={color} />
      <span>
        {completed} / {total}
      </span>
    </Label>
  )
}

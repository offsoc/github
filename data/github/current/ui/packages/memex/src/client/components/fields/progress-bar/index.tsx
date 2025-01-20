import type {ColorName} from '@github-ui/use-named-color'

import {ProgressBarRing} from './progress-bar-ring'
import {ProgressBarSegmented} from './progress-bar-segmented'
import {ProgressBarSolid} from './progress-bar-solid'
import {type ProgressBarCustomProps, ProgressBarVariants, type ProgressBarVariantsUnion} from './types'

export {ProgressBarVariants} from './types'

export const ProgressBar = ({
  color = 'PURPLE',
  name = 'Progress',
  variant,
  ...props
}: ProgressBarCustomProps & {
  color?: ColorName
  variant?: ProgressBarVariantsUnion
}) => {
  switch (variant) {
    case ProgressBarVariants.SEGMENTED:
      return <ProgressBarSegmented {...props} color={color} name={name} />
    case ProgressBarVariants.RING:
      return <ProgressBarRing {...props} color={color} name={name} />
    default:
      return <ProgressBarSolid {...props} color={color} name={name} />
  }
}

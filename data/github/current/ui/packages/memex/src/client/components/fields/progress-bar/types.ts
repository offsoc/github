import type {ColorName} from '@github-ui/use-named-color'
import type {ProgressBarProps} from '@primer/react'

import type {ProgressConfiguration} from '../../../api/columns/contracts/progress'
import {ProgressBarVariants} from '../../../api/columns/contracts/progress'

export type ProgressBarAdditionalProps = {
  completed: number
  consistentContentSizing?: boolean
  hideNumerals?: boolean
  name?: string
  percentCompleted: number
  total: number
  color?: ColorName
}

export type ProgressBarVariantsUnion = ProgressConfiguration['variant']

export {ProgressBarVariants}

export type ProgressBarCustomProps = ProgressBarProps & ProgressBarAdditionalProps

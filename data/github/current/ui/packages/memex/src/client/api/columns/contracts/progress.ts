import type {ColorName} from '@github-ui/use-named-color'

export const ProgressBarVariants = {
  SEGMENTED: 'SEGMENTED',
  SOLID: 'SOLID',
  RING: 'RING',
} as const

export interface ProgressConfiguration {
  variant?: (typeof ProgressBarVariants)[keyof typeof ProgressBarVariants]
  hideNumerals?: boolean
  color?: ColorName
}

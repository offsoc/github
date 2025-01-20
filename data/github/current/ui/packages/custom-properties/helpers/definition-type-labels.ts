import type {ValueType} from '@github-ui/custom-properties-types'

export const definitionTypeLabels: Record<ValueType, string> = {
  string: 'Text',
  ['single_select']: 'Single select',
  ['multi_select']: 'Multi select',
  ['true_false']: 'True/false',
}

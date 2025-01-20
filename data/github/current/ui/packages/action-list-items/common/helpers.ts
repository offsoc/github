import type {ActionListProps} from '@primer/react'

import type {SelectType} from './types'

export const getActionListSelectionVariant = (selectType: SelectType) => {
  let selectionVariant: ActionListProps['selectionVariant'] = undefined
  if (selectType === 'multiple') {
    selectionVariant = 'multiple'
  } else if (selectType === 'instant') {
    selectionVariant = 'single'
  }
  return selectionVariant
}

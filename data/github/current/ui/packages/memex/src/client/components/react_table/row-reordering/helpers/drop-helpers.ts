import type {Over} from '@github-ui/drag-and-drop'

import type {DropSide as DropSideType} from '../../../../helpers/dnd-kit/drop-helpers'
import {DropSide} from '../../../../helpers/dnd-kit/drop-helpers'

export const getSashPosition = (over: Over | null, side: DropSideType): number | null => {
  if (!over) return null

  return side === DropSide.BEFORE ? over.rect.top : over.rect.bottom
}

import {ItemType} from '../../../../api/memex-items/item-type'
import type {MemexItemModel} from '../../../../models/memex-item-model'
import {getClipboardContentFromRowAndColumn} from './get-clipboard-content-from-row-and-column'
import type {ClipboardColumnModel} from './types'

export const getItemsClipboardContents = (
  items: ReadonlyArray<MemexItemModel>,
  fields: ReadonlyArray<ClipboardColumnModel>,
) =>
  items
    .filter(item => item.contentType !== ItemType.RedactedItem)
    .map(item => fields.map(field => getClipboardContentFromRowAndColumn(field, item)))

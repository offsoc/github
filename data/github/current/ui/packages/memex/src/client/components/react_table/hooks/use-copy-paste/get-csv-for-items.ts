import {SystemColumnId} from '../../../../api/columns/contracts/memex-column'
import type {ColumnModel} from '../../../../models/column-model'
import type {MemexItemModel} from '../../../../models/memex-item-model'
import {buildPlaintextTableForClipboardContent} from './build-plaintext-table-for-clipboard-content'
import {ClipboardOnly_UrlColumnModel} from './constants'
import {getItemsClipboardContents} from './get-items-clipboard-contents'
import type {ClipboardColumnModel} from './types'

type Props = {
  items: Array<MemexItemModel>
  withHeaders: boolean
  selectedFields: ReadonlyArray<ColumnModel>
}

export const getCsvForItems = ({items, withHeaders, selectedFields}: Props) => {
  const noItemsHaveUrls = items.every(item => item.contentType === 'DraftIssue')

  // Inject a URL column, but only if any of the items have URLs (or it would just be an annoying empty column)
  const selectedFieldsWithUrl = noItemsHaveUrls
    ? selectedFields
    : selectedFields.flatMap<ClipboardColumnModel>(field =>
        field.id === SystemColumnId.Title ? [field, ClipboardOnly_UrlColumnModel] : [field],
      )

  const header = withHeaders ? selectedFieldsWithUrl.map(field => field.name) : undefined
  const rows = getItemsClipboardContents(items, selectedFieldsWithUrl)

  return buildPlaintextTableForClipboardContent(rows, header)
}

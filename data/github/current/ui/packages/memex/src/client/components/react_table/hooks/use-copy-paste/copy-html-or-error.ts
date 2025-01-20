import type {Dispatch} from 'react'

import {copyHtml} from '../../../../helpers/clipboard'
import type {ColumnModel} from '../../../../models/column-model'
import type {MemexItemModel} from '../../../../models/memex-item-model'
import type {AddToastProps} from '../../../toasts/use-toasts'
import {buildHtmlTableForClipboardContent} from './build-html-table-for-clipboard-content'
import {ClipboardActionTypes} from './constants'
import type {CopyOptions} from './copy-options'
import {getItemsClipboardContents} from './get-items-clipboard-contents'
import type {ClipboardAction} from './types'

type Props = {
  items: Array<MemexItemModel>
  clipboardDispatch: Dispatch<ClipboardAction>
  itemsToCsv: (items: Array<MemexItemModel>, copyOptions?: CopyOptions) => string | undefined
  addToast: (args: AddToastProps) => number
  withHeaders: boolean
  selectedFields: ReadonlyArray<ColumnModel>
}

export const copyHtmlOrError = async ({
  items,
  clipboardDispatch,
  itemsToCsv,
  addToast,
  withHeaders,
  selectedFields,
}: Props) => {
  const header = withHeaders ? selectedFields.map(field => field.name) : undefined
  const rowClipboardContents = getItemsClipboardContents(items, selectedFields)
  const html = buildHtmlTableForClipboardContent(rowClipboardContents, header) ?? ''
  const csv = itemsToCsv(items, {withHeaders, selectedFields})

  try {
    await copyHtml(html, csv)

    clipboardDispatch({
      type: ClipboardActionTypes.UPDATE_CLIPBOARD,
      state: rowClipboardContents,
    })
  } catch (error) {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({
      message: 'Could not copy items. Please check the page permissions and try again.',
      type: 'error',
      keepAlive: false,
    })
  }
}

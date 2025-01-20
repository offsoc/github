import type {Dispatch} from 'react'
import type {Cell} from 'react-table'

import type {UpdateColumnValueAction} from '../../../../api/columns/contracts/domain'
import type {MemexItemModel} from '../../../../models/memex-item-model'
import {HistoryResources} from '../../../../strings'
import type {AddToastProps} from '../../../toasts/use-toasts'
import type {TableDataType} from '../../table-data-type'
import {buildPlaintextTableForClipboardContent} from './build-plaintext-table-for-clipboard-content'
import {ClipboardActionTypes} from './constants'
import {PasteValidationFailure} from './errors'
import {getOnlyCell} from './get-only-cell'
import type {ClipboardAction, ClipboardState} from './types'
import {buildUpdateFromClipboardContent} from './update-builders/build-update-from-clipboard-content'

type Props = {
  cell: Pick<Cell<TableDataType>, 'column' | 'row'>
  selectedItems: Array<MemexItemModel>
  currentClipboard: ClipboardState
  clipboardDispatch: Dispatch<ClipboardAction>
  updateItems: (
    items: Array<MemexItemModel>,
    update: UpdateColumnValueAction,
    description?: string,
    sourceRepoId?: number | null | undefined,
  ) => Promise<void>
  addToast: (args: AddToastProps) => number
}

export const updateItemsOrError = async ({
  cell,
  selectedItems,
  currentClipboard,
  clipboardDispatch,
  updateItems,
  addToast,
}: Props) => {
  let navigatorClipboardText = ''
  try {
    navigatorClipboardText = await navigator.clipboard.readText()
  } catch (error) {
    // can be permission denied - in which case we just ignore
  }

  let currentClipboardState: ClipboardState = currentClipboard
  let shouldUseNavigatorClipboard = false

  // If the current clipboard is empty and
  // navigator.clipboard is not, then use navigator.clipboard
  if (currentClipboard.type === 'empty') {
    shouldUseNavigatorClipboard = !!navigatorClipboardText
  }

  // If the current clipboard is populated (not empty) and
  // navigator.clipboard is not empty and different than the current clipboard, use navigator.clipboard
  if (currentClipboard.type === 'populated') {
    shouldUseNavigatorClipboard =
      !!navigatorClipboardText &&
      navigatorClipboardText !== buildPlaintextTableForClipboardContent(currentClipboard.value)
  }

  if (shouldUseNavigatorClipboard) {
    currentClipboardState = {
      type: 'populated',
      value: [
        [
          {
            dataType: 'text',
            text: navigatorClipboardText,
            value: {
              raw: navigatorClipboardText,
              html: navigatorClipboardText,
            },
          },
        ],
      ],
    }

    // Clear the current clipboard, as it is no longer in sync with navigator.clipboard
    clipboardDispatch({
      type: ClipboardActionTypes.CLEAR_CLIPBOARD,
    })
  }

  // This shouldn't happen given the above implementation
  if (currentClipboardState.type === 'empty') {
    return
  }

  const targetItems = selectedItems.length === 0 ? [cell.row.original] : selectedItems

  const firstCellContent = getOnlyCell(currentClipboardState.value)
  if (!firstCellContent) return

  // If there is no column associated with the current clipboard contents, just paste the text from the
  // clipboard instead, without any context of where it came from. This is usually the case when the user
  // has copied text from outside of memex and is trying to paste it into the project.
  const pasteContent = firstCellContent.dataType && firstCellContent.columnId ? firstCellContent : firstCellContent.text

  const column = cell.column.columnModel
  if (!pasteContent || !column) return

  const sourceRepo =
    typeof pasteContent === 'object' && 'repositoryId' in pasteContent ? pasteContent.repositoryId : undefined

  try {
    const update = buildUpdateFromClipboardContent(pasteContent, column)
    if (update) await updateItems(targetItems, update, HistoryResources.paste, sourceRepo)
  } catch (error) {
    if (error instanceof PasteValidationFailure) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        message: error.message,
        type: 'warning',
      })
    } else {
      throw error
    }
  }
}

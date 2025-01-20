import {memo, type ReactNode, useCallback, useContext, useMemo} from 'react'
import type {Cell} from 'react-table'

import {useBulkUpdateItems} from '../../../../hooks/use-bulk-update-items'
import {useVisibleFields} from '../../../../hooks/use-visible-fields'
import type {MemexItemModel} from '../../../../models/memex-item-model'
import useToasts from '../../../toasts/use-toasts'
import type {TableDataType} from '../../table-data-type'
import {ClipboardActionTypes} from './constants'
import {copyHtmlOrError} from './copy-html-or-error'
import type {CopyOptions} from './copy-options'
import {createCopyPasteContext} from './create-copy-paste-context'
import {emptyClipboard} from './empty-clipboard'
import {getCsvForItems} from './get-csv-for-items'
import {isCellCopySourceForClipboard} from './is-cell-copy-source-for-clipboard'
import {updateItemsOrError} from './update-items-or-error'
import {useClipboardReducer} from './use-clipboard-reducer'

export const createCopyPasteContextAndProvider = () => {
  const CopyPasteContext = createCopyPasteContext()

  const CopyPasteProvider = memo(function CopyPasteProvider({children}: {children: ReactNode}) {
    const [state, clipboardDispatch] = useClipboardReducer(emptyClipboard)
    const value = useMemo(() => ({state, clipboardDispatch}), [state, clipboardDispatch])
    return <CopyPasteContext.Provider value={value}>{children}</CopyPasteContext.Provider>
  })

  const useCopyPaste = () => {
    const {state: currentClipboard, clipboardDispatch} = useContext(CopyPasteContext)
    const {visibleFields} = useVisibleFields()
    const {addToast} = useToasts()

    const clearClipboard = useCallback(() => {
      clipboardDispatch({type: ClipboardActionTypes.CLEAR_CLIPBOARD})
    }, [clipboardDispatch])

    const {bulkUpdateSingleColumnValue: updateItems} = useBulkUpdateItems()

    const paste = useCallback(
      /**
       * models: The rows affected by this paste. Can be more than one if multiple cells are selected.
       */
      async (cell: Pick<Cell<TableDataType>, 'column' | 'row'>, selectedItems: Array<MemexItemModel>) => {
        updateItemsOrError({cell, selectedItems, addToast, updateItems, currentClipboard, clipboardDispatch})
      },
      [addToast, updateItems, currentClipboard, clipboardDispatch],
    )

    const isCellCopySource = useCallback(
      (cell: Pick<Cell<TableDataType>, 'column' | 'row'>) => {
        return isCellCopySourceForClipboard({cell, clipboard: currentClipboard})
      },
      [currentClipboard],
    )

    const itemsToCsv = useCallback(
      (items: Array<MemexItemModel>, {withHeaders = false, selectedFields = visibleFields}: CopyOptions = {}) => {
        return getCsvForItems({items, withHeaders, selectedFields})
      },
      [visibleFields],
    )

    const copyItems = useCallback(
      async (items: Array<MemexItemModel>, {withHeaders = false, selectedFields = visibleFields}: CopyOptions = {}) => {
        copyHtmlOrError({items, withHeaders, selectedFields, clipboardDispatch, addToast, itemsToCsv})
      },
      [visibleFields, itemsToCsv, clipboardDispatch, addToast],
    )

    return {paste, clearClipboard, isCellCopySource, copyItems, itemsToCsv}
  }

  return {CopyPasteContext, CopyPasteProvider, useCopyPaste}
}

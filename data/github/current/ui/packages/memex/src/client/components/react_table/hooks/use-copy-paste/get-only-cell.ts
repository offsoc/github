import {not_typesafe_nonNullAssertion} from '../../../../helpers/non-null-assertion'
import type {ClipboardTable} from './types'

/** If only one cell is in the clipboard, get it. */
export const getOnlyCell = (clipboardTable: ClipboardTable) => {
  if (clipboardTable.length !== 1) return

  const firstColumn = not_typesafe_nonNullAssertion(clipboardTable[0])
  if (firstColumn?.length !== 1) return

  return not_typesafe_nonNullAssertion(firstColumn[0])
}

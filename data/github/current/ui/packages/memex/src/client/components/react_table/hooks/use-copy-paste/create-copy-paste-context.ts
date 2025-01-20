import {createContext} from 'react'

import {emptyClipboard} from './empty-clipboard'
import type {ClipboardContentValue} from './types'

export const createCopyPasteContext = () => {
  const CopyPasteContext = createContext<ClipboardContentValue>({
    state: emptyClipboard,
    clipboardDispatch: () => void 0,
  })
  CopyPasteContext.displayName = 'CopyPaste'
  return CopyPasteContext
}

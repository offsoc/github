import {isMacOS} from '@github-ui/get-os'
import {useCallback, useEffect} from 'react'

import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {isInsidePortal} from '../../helpers/portal-elements'
import {useCopyPaste} from './hooks/use-copy-paste'
import {clearFocus, focusGlobalOmnibar, isCellFocus, useTableNavigation} from './navigation'
import {useTableDispatch} from './table-provider'
import {useDeselectAll} from './use-deselect-all'
import {setRowMenuOpen} from './use-row-menu-shortcut'

export type UseTableFocusColumnOptions<_D extends object> = {
  // An optional property to declare whether a column is non-navigable
  nonNavigable?: boolean
}

export type UseTableFocusColumnProps<_D extends object> = {
  nonNavigable?: boolean
}

export type CellExtraProps = {
  dropdownRef: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}

export type EditorCellExtraProps = {
  replaceContents: boolean
}

export const useTableFocus = () => {
  const {
    state: {focus},
    navigationDispatch,
  } = useTableNavigation()
  const dispatch = useTableDispatch()
  const {clearClipboard} = useCopyPaste()
  const deselectAll = useDeselectAll()

  const onKeyDown: React.KeyboardEventHandler = useCallback(
    e => {
      if (!focus || (isCellFocus(focus) && focus.details.meta.editing)) {
        return
      }

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.key === '\\' && (isMacOS() ? e.metaKey : e.ctrlKey) && e.shiftKey && isCellFocus(focus)) {
        // This isn't related to focus, but it seems that by default we can only register a
        // single onKeyDown handler on the table, so we need to build some infrastructure
        // to change that before we can put this elsewhere.
        e.stopPropagation()
        e.preventDefault()
        dispatch(setRowMenuOpen(focus))
      }
    },
    [focus, dispatch],
  )

  const onBlur: React.FocusEventHandler<HTMLElement> = useCallback(
    e => {
      const relatedTarget = e.relatedTarget as HTMLElement | null

      const newFocusIsInsideTable = e.currentTarget.contains(relatedTarget)
      const newFocusIsInsidePortal = isInsidePortal(relatedTarget)

      const newFocusOutsideTable = !newFocusIsInsidePortal && !newFocusIsInsideTable

      const oldFocusWasSuspended = focus?.type === 'coordinate' && focus.details.meta.suspended

      if (newFocusOutsideTable && !oldFocusWasSuspended) {
        navigationDispatch(clearFocus())
      }
    },
    [navigationDispatch, focus],
  )

  useEffect(() => {
    const globalOnKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcutFromEvent(e)

      if (shortcut === SHORTCUTS.CTRL_SPACE) {
        // NOTE: If changing this shortcut, also update Resources.newItemPlaceholderUnfocused
        e.stopPropagation()
        e.preventDefault()
        navigationDispatch(focusGlobalOmnibar())
      }

      if (shortcut === SHORTCUTS.ESCAPE) {
        clearClipboard()
        deselectAll()
      }
    }

    addEventListener('keydown', globalOnKeyDown)

    return () => removeEventListener('keydown', globalOnKeyDown)
  }, [dispatch, navigationDispatch, clearClipboard, deselectAll])

  return {onKeyDown, onBlur}
}

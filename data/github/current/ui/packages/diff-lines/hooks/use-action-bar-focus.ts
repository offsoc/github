import type {RefObject} from 'react'
import {useCallback, useState} from 'react'

import {useMarkersDialogContext} from '../contexts/MarkersDialogContext'
import {isGridNavigationKey} from './use-grid-navigation'

type ActionBarFocus = {
  isActionBarFocused: boolean
  handleCellBlur: (event: React.FocusEvent) => void
  handleCellFocus: () => void
  handleCellMouseEnter: () => void
  handleCellMouseLeave: () => void
  handleActionBarBlur: (event: React.FocusEvent) => void
  handleActionBarFocusCapture: (event: React.FocusEvent) => void
  handleActionBarKeydownCapture: (event: React.KeyboardEvent) => void
}

export function useActionBarFocus({cellRef}: {cellRef: RefObject<HTMLTableCellElement>}): ActionBarFocus {
  const {showActionBar, hideActionBar, anyMenuOpen} = useMarkersDialogContext()
  const [isActionBarFocused, setIsActionBarFocused] = useState(false)

  const handleCellFocus = useCallback(() => {
    showActionBar()
  }, [showActionBar])

  const handleCellBlur = useCallback(
    (event: React.FocusEvent) => {
      if (anyMenuOpen) return
      if (cellRef.current && cellRef.current.contains(event.relatedTarget)) return
      hideActionBar()
    },
    [anyMenuOpen, cellRef, hideActionBar],
  )

  const handleCellMouseEnter = useCallback(() => {
    showActionBar()
  }, [showActionBar])

  const handleCellMouseLeave = useCallback(() => {
    if (anyMenuOpen) return
    if (cellRef.current === document.activeElement || cellRef.current?.contains(document.activeElement)) return
    hideActionBar()
  }, [anyMenuOpen, cellRef, hideActionBar])

  const handleActionBarBlur = useCallback(
    (e: React.FocusEvent) => {
      if (cellRef.current) {
        if (anyMenuOpen) return
        if (!cellRef.current.contains(e.relatedTarget)) {
          hideActionBar()
          setIsActionBarFocused(false)
        } else if (cellRef.current === e.relatedTarget) {
          // if the user shift-tabs back into the cell, we want to keep the action bar visible
          // but we want to `aria-hide` it again to avoid reading out its content
          setIsActionBarFocused(false)
        }
      }
    },
    [anyMenuOpen, cellRef, hideActionBar],
  )

  const handleActionBarFocusCapture = useCallback(
    (e: React.FocusEvent) => {
      if (anyMenuOpen) return
      e.stopPropagation()
      setIsActionBarFocused(true)
    },
    [anyMenuOpen],
  )

  const handleActionBarKeydownCapture = useCallback(
    (e: React.KeyboardEvent) => {
      if (anyMenuOpen) return
      // prevent focus zone from processing keystrokes on the button, since we want it to behave like it's not in the grid
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (isGridNavigationKey(e.key)) {
        e.stopPropagation()
      }
    },
    [anyMenuOpen],
  )

  return {
    isActionBarFocused,
    handleCellBlur,
    handleCellFocus,
    handleCellMouseEnter,
    handleCellMouseLeave,
    handleActionBarBlur,
    handleActionBarFocusCapture,
    handleActionBarKeydownCapture,
  }
}

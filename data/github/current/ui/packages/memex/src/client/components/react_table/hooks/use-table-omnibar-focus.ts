import {useCallback, useEffect, useMemo, useRef} from 'react'

import {SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {handleKeyboardNavigation, suppressEvents, suppressOmnibarEvents} from '../../../navigation/keyboard'
import {FocusType} from '../../../navigation/types'
import type {OmnibarRef} from '../../omnibar/omnibar'
import {
  focusGroupOmnibar,
  focusOmnibar,
  isGroupOmnibarFocus,
  isOmnibarFocus,
  moveTableFocus,
  useTableNavigation,
} from '../navigation'

export function useTableOmnibarFocus(groupId?: string) {
  const {
    state: {focus},
    navigationDispatch,
  } = useTableNavigation()
  const omnibarRef = useRef<OmnibarRef>(null)

  const hasFocus = useCallback(
    () => !!(groupId && focus && isGroupOmnibarFocus(focus, groupId)) || !!(focus && isOmnibarFocus(focus)),
    [focus, groupId],
  )

  const handleFocus = useCallback(() => {
    if (groupId) {
      navigationDispatch(focusGroupOmnibar(groupId))
    } else {
      navigationDispatch(focusOmnibar())
    }
  }, [navigationDispatch, groupId])

  useEffect(() => {
    if (hasFocus()) {
      omnibarRef.current?.focus()
    }
  }, [hasFocus])

  const onFocus = useCallback(() => {
    handleFocus()
  }, [handleFocus])

  const onKeyDown: React.KeyboardEventHandler = useCallback(
    e => {
      const result = handleKeyboardNavigation(navigationDispatch, e)
      if (result.action) {
        suppressOmnibarEvents(e, result.keyAsShortcut)
      } else if (result.keyAsShortcut === SHORTCUTS.ESCAPE) {
        navigationDispatch(moveTableFocus({focusType: FocusType.Focus, details: {previousFocus: true}}))
        suppressEvents(e)
      }
    },
    [navigationDispatch],
  )

  return useMemo(
    () => ({
      onKeyDown,
      onFocus,
      omnibarRef,
    }),
    [onFocus, onKeyDown, omnibarRef],
  )
}

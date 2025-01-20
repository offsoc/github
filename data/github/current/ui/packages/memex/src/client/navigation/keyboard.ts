import {shortcutFromEvent, SHORTCUTS} from '../helpers/keyboard-shortcuts'
import {createNavigateAction, type FocusAction, type NavigateAction} from './context'
import {type Focus, FocusType, NavigationDirection} from './types'

/** Helper function to suppress events related to global navigation */
export function suppressEvents(e: React.UIEvent) {
  e.stopPropagation()
  e.preventDefault()
}

export function suppressOmnibarEvents(e: React.KeyboardEvent, keyAsShortcut: string) {
  if (
    keyAsShortcut === SHORTCUTS.META_ARROW_LEFT ||
    keyAsShortcut === SHORTCUTS.META_ARROW_RIGHT ||
    keyAsShortcut === SHORTCUTS.ARROW_LEFT ||
    keyAsShortcut === SHORTCUTS.ARROW_RIGHT
  ) {
    // allow default action to continue
    e.stopPropagation()
  } else {
    suppressEvents(e)
  }
}

export function handleKeyboardNavigation<T extends Focus, S>(
  dispatch: React.Dispatch<FocusAction<T, S>>,
  e: React.KeyboardEvent,
) {
  const result = keyDownEventToNavigateAction<S>(e)
  if (result.action) {
    dispatch(result.action)
  }
  return result
}

function keyDownEventToNavigateAction<S>(e: React.KeyboardEvent): {
  keyAsShortcut: string
  action: null | NavigateAction<S>
} {
  const keyAsShortcut = shortcutFromEvent(e)
  let action: NavigateAction<S> | null = null
  switch (keyAsShortcut) {
    case SHORTCUTS.META_HOME: {
      action = createNavigateAction({
        y: NavigationDirection.First,
        x: NavigationDirection.First,
        focusType: FocusType.Focus,
      })

      break
    }
    case SHORTCUTS.SHIFT_ARROW_UP:
    case SHORTCUTS.SHIFT_ARROW_DOWN:
      // do nothing, will be handled by selection
      break
    case SHORTCUTS.ARROW_UP: {
      action = createNavigateAction({y: NavigationDirection.Previous, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.META_ARROW_UP: {
      action = createNavigateAction({y: NavigationDirection.First, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.ARROW_DOWN: {
      action = createNavigateAction({y: NavigationDirection.Next, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.META_ARROW_DOWN: {
      action = createNavigateAction({y: NavigationDirection.Last, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.ARROW_LEFT: {
      action = createNavigateAction({x: NavigationDirection.Previous, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.META_ARROW_LEFT: {
      action = createNavigateAction({x: NavigationDirection.First, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.ARROW_RIGHT: {
      action = createNavigateAction({x: NavigationDirection.Next, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.META_ARROW_RIGHT: {
      action = createNavigateAction({x: NavigationDirection.Last, focusType: FocusType.Focus})
      break
    }
    case SHORTCUTS.META_END: {
      action = createNavigateAction({
        x: NavigationDirection.Last,
        y: NavigationDirection.Last,
        focusType: FocusType.Focus,
      })
      break
    }
  }
  return {keyAsShortcut, action}
}

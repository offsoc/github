import {createContext, useContext, useEffect, useMemo, useReducer} from 'react'

import type {UndoUi} from '../../api/stats/contracts'
import {useCommands} from '../../commands/hook'
import {shortcutFromEvent, SHORTCUTS} from '../../helpers/keyboard-shortcuts'
import {usePostStats} from '../../hooks/common/use-post-stats'

interface Action {
  /** Short description of the action, like "update items" or "reorder columns". */
  description: string
  /**
   * Function that can be called to undo the action.
   * @param uiTrigger Description of the source of the event, for telemetry.
   */
  revert: (uiTrigger: UndoUi) => void
}

/**
 * When registering new actions, we don't care about the telemetry data since the revert effect shouldn't depend on
 * how the action was reverted.
 */
interface RegisterAction extends Action {
  revert: () => void
}

interface HistoryContext {
  /** The most recent action on the history stack. If not present, undo is not available. */
  lastAction?: Action
  /** Register an action onto the stack. */
  registerAction: (action: RegisterAction) => void
}

const HistoryContext = createContext<HistoryContext | null>(null)

/** Ordered by newest -> oldest so the first item is always most recent. */
type History = ReadonlyArray<RegisterAction>

/** Maximum number of items to store in the stack before dropping older items. */
const MAX_STACK_SIZE = 5

const reduceHistory = (prev: History, action: {type: 'removeLast'} | {type: 'register'; data: RegisterAction}) => {
  switch (action.type) {
    case 'removeLast':
      return prev.slice(1)
    case 'register':
      return [action.data, ...prev].slice(0, MAX_STACK_SIZE)
  }
}

export const HistoryProvider = ({children}: {children: React.ReactNode}) => {
  const [[_lastAction], dispatch] = useReducer(reduceHistory, [])

  const {postStats} = usePostStats()

  const lastAction = useMemo<Action | undefined>(
    () =>
      _lastAction && {
        ..._lastAction,
        revert: ui => {
          _lastAction.revert()
          dispatch({type: 'removeLast'})
          postStats({name: 'undo', ui, context: _lastAction.description})
        },
      },
    [_lastAction, postStats],
  )

  const value = useMemo<HistoryContext>(
    () => ({
      lastAction,
      registerAction: action => dispatch({type: 'register', data: action}),
    }),
    [lastAction],
  )

  useCommands(
    () =>
      lastAction
        ? ['z', `Undo ${lastAction.description}`, 'undo', () => lastAction.revert('command_palette_command')]
        : null,
    [lastAction],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isUndo = shortcutFromEvent(event) === SHORTCUTS.META_Z
      const isFocusedOnInput =
        document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement
      if (isUndo && !isFocusedOnInput && lastAction && !event.defaultPrevented) {
        event.preventDefault()
        lastAction.revert('keyboard_shortcut')
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lastAction, postStats])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export const useHistory = () => useContext(HistoryContext)

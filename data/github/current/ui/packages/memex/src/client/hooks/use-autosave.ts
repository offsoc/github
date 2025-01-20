import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {useCallback, useState} from 'react'

import {replaceShortCodesWithEmojis} from '../helpers/emojis'

type AutosaveProps = {
  initialValue: string
  commitFn: (s: string) => Promise<any>
}

export const CommitState = {
  None: 'none',
  Successful: 'successful',
  Failed: 'failed',
} as const
export type CommitState = ObjectValues<typeof CommitState>

/**
 * This hook manages the local and the persisted state of the field it is hooked into.
 * The component is expecting 2 parameters
 * - initialValue: the default value of the field it's attaching to
 * - commitFn: a function that performs data persistence
 *    - is async (expected to do a Network request)
 *    - commits the value saved in localValue
 *    - expected to throw an error when it fails: values for isError, isSuccess are based on this
 *
 * It is exposing the following objects and functions:
 *
 * localValue: The client value (string atm, can be extended to generic) of the components that uses the hook
 *
 * setLocalValue: function that should be called to update the localValue
 *
 * handleChange: a onChange handler; internally using setLocalValue
 *
 * handleBlur: a blur handler that triggers the commit function to persist localValue
 *
 * handleKeyDown: a keyDown handler listening for Enter (to commit localValue) or Esc (to revert to the original value
 *
 * isSuccess, isError: boolean values indicating the state of the commit function
 */
export const useAutosave = ({initialValue, commitFn}: AutosaveProps) => {
  const [localValue, setLocalValue] = useSyncedState(initialValue)
  const [hasChanged, setHasChanged] = useState(false)
  const [commitState, setCommitState] = useState<CommitState>(CommitState.None)

  const revertValue = useCallback(() => {
    setLocalValue(initialValue)
    setHasChanged(false)
  }, [setLocalValue, setHasChanged, initialValue])

  const saveValue = useCallback(async () => {
    if (!hasChanged) return

    const trimmedValue = localValue.trim()

    if (trimmedValue.length === 0) {
      setCommitState(CommitState.Failed)
      return
    }

    setLocalValue(trimmedValue)

    try {
      await commitFn(replaceShortCodesWithEmojis(trimmedValue))
      setCommitState(CommitState.Successful)
    } catch {
      setCommitState(CommitState.Failed)
    }
    setHasChanged(false)
  }, [hasChanged, localValue, setLocalValue, commitFn])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasChanged(true)
      setCommitState(CommitState.None)
      setLocalValue(replaceShortCodesWithEmojis(e.target.value))
    },
    [setLocalValue, setHasChanged],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      setCommitState(CommitState.None)

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (event.key) {
        case 'Enter':
          saveValue()
          break

        case 'Escape':
          if (hasChanged) event.stopPropagation()
          revertValue()
          break
      }
    },
    [saveValue, revertValue, hasChanged],
  )
  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const onBlur = useCallback(() => {
    if (document.hasFocus()) {
      saveValue()
    }
  }, [saveValue])

  return {
    localValue,
    setLocalValue,
    isSuccess: commitState === CommitState.Successful,
    isError: commitState === CommitState.Failed,
    inputProps: {
      onChange,
      onBlur,
      ...inputCompositionProps,
    },
  }
}

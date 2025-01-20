import {noop} from '@github-ui/noop'
import {useCallback, useRef} from 'react'

import {useControlledProp} from './use-controlled-prop'
/**
 * Encapsulates menu visibility interaction for a combobox. Since some comboboxes
 * may want to control the state themselves (rather than delegating control to useCombobox),
 * this hook sets up the standard times when the menu would open and close, but also exposes
 * a `setIsOpen` dispatch for custom behavior.
 * @param props Optional parameter with an optional isOpen boolean, in the case that this
 * behavior should no-op. This is necessary because it is expected that a different hook or component
 * could use this hook (like useTextExpander), but it will also be used directly by useCombobox.
 * In that case, this hook will essentially no-op for its usage in useCombobox.
 */
export const useComboboxMenuVisibilityBehavior = (props?: {isOpen?: boolean}) => {
  const [isOpen, setIsOpen, isControlled] = useControlledProp('isOpen', false, props)
  const interactingWithList = useRef(false)

  const inputOnFocus = isControlled
    ? noop
    : () => {
        setIsOpen(true)
      }

  const inputOnBlur = isControlled
    ? noop
    : () => {
        // We don't want to close the list if the blur event
        // is due to clicking on an item in the list
        if (interactingWithList.current === false) {
          setIsOpen(false)
        }
      }

  const onResetListInteraction = useCallback(() => {
    return isControlled
      ? noop
      : () => {
          interactingWithList.current = false
        }
  }, [isControlled])

  const itemOnMouseDown = isControlled
    ? noop
    : () => {
        interactingWithList.current = true
      }
  return {isOpen, setIsOpen, itemOnMouseDown, inputOnBlur, inputOnFocus, onResetListInteraction}
}

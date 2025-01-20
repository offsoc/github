import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useState} from 'react'

/**
 * This hook defines the initial behaviour for cell editors when displayed in the table.
 *
 * This ensures the provided input receives focus once, and an optional callback for any
 * open-related work can be run inside the component.
 *
 * @param inputRef Input element that should receive focus.
 * @param onOpen Callback to run before the input receives focus.
 */
export function useOnCellEditorFocus(inputRef: React.RefObject<HTMLInputElement>, onOpen?: () => void) {
  const [cellEditorHasFocus, setCellEditorHasFocus] = useState(false)

  useLayoutEffect(() => {
    if (!cellEditorHasFocus && inputRef.current) {
      setCellEditorHasFocus(true)
      if (onOpen) {
        onOpen()
      }
      inputRef.current.focus()
    }
  }, [cellEditorHasFocus, inputRef, onOpen])
}

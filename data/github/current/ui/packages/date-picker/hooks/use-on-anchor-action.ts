import {useDatePickerContext} from '../components/Provider'

/**
 * Handle actions on an anchor element that might open the datepicker.
 */
export const useOnAnchorAction = () => {
  const {isOpen, open, close} = useDatePickerContext()
  return (event: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in event) {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (![' ', 'Enter', 'ArrowDown'].includes(event.key)) return
      event.preventDefault()
      open('anchor-key-press')
    } else if (isOpen) {
      close('anchor-click')
    } else {
      open('anchor-click')
    }
  }
}

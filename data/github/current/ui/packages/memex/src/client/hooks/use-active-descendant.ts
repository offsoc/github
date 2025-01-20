import {useEffect} from 'react'

/**
 * For use inside of a "combobox" element, this hook will set the `aria-activedescendant`
 * on the input to reflect the item with secondary focus, so that the interaction
 * is accessible to screen readers.
 *
 * @param inputRef Textbox ref controlling the listbox
 * @param selectedIndex Index of the list item that currently has secondary focus
 * @param getListItemId Given a list item index, returns the id of the list item
 */
export const useActiveDescendant = ({
  inputRef,
  selectedIndex,
  getListItemId,
}: {
  inputRef: React.RefObject<HTMLElement>
  selectedIndex: number
  getListItemId: (idx: number) => string | undefined
}) => {
  useEffect(() => {
    const current = inputRef.current

    if (current) {
      const listItemId = getListItemId(selectedIndex)

      if (selectedIndex === -1 || !listItemId) {
        current.removeAttribute('aria-activedescendant')
      } else {
        current.setAttribute('aria-activedescendant', listItemId)
      }
    }

    return () => {
      current?.removeAttribute('aria-activedescendant')
    }
  }, [inputRef, selectedIndex, getListItemId])
}

import Combobox, {type FirstOptionSelectionMode} from '@github/combobox-nav'
import {useLayoutEffect} from '@github-ui/use-layout-effect'
import {useCallback, useEffect, useId, useRef, useState} from 'react'

export type ComboboxCommitEvent<T> = {
  /** The underlying `combobox-commit` event. */
  nativeEvent: Event & {target: HTMLElement}
  /** The option that was committed. */
  option: T
}

type UseComboboxSettings<T> = {
  /** When open, the combobox will start listening for keyboard events. */
  isOpen: boolean
  /**
   * The list used to select items. This should usually be a Primer `ActionList`. The
   * list must contain items with `role="option"`.
   */
  listElement: HTMLOListElement | HTMLUListElement | null
  /**
   * The input this belongs to. The input value is not controlled by this component, but
   * the element reference is used to bind keyboard events and attributes.
   */
  inputElement: HTMLInputElement | HTMLTextAreaElement | null
  /** Called when the user applies the selected suggestion. */
  onCommit: (event: ComboboxCommitEvent<T>) => void
  /**
   * The array of available options. `useCombobox` doesn't render the options, but it does
   * need to know what they are (for callbacks) and when they change (for binding events
   * and attributes).
   */
  options: T[]
  /**
   * If `true`, suggestions will be applied with both `Tab` and `Enter`, instead of just
   * `Enter`. This may be expected behavior for users used to IDEs, but use caution when
   * hijacking browser tabbing capability.
   * @default false
   */
  tabInsertsSuggestions?: boolean
  /**
   * Indicates the default behaviour for the first option when the list is shown:
   *
   *  - `'none'`: Don't auto-select the first option at all.
   *  - `'active'`: Place the first option in an 'active' state where it is not
   *    selected (is not the `aria-activedescendant`) but will still be applied
   *    if the user presses `Enter`. To select the second item, the user would
   *    need to press the down arrow twice. This approach allows quick application
   *    of selections without disrupting screen reader users. In this mode, style
   *    the default option using the selector `[data-combobox-option-default]`.
   *  - `'selected'`: Select the first item by navigating to it. This allows quick
   *    application of selections and makes it faster to select the second item,
   *    but can be disruptive or confusing for screen reader users.
   */
  firstOptionSelectionMode?: FirstOptionSelectionMode
}

/**
 * Lightweight hook wrapper around the GitHub `Combobox` class from `@github/combobox-nav`.
 * With this hook, keyboard navigation through suggestions is automatically handled and
 * accessibility attributes are added.
 *
 * `useCombobox` will set nearly all necessary attributes by effect, but you **must** set
 * `role="option"` on list items in order for them to be 'seen' by the combobox. Style the
 * currently highlighted option with the `[aria-selected="true"]` selector.
 */
export const useCombobox = <T>({
  isOpen,
  listElement: list,
  inputElement: input,
  onCommit: externalOnCommit,
  options,
  tabInsertsSuggestions = false,
  firstOptionSelectionMode = 'none',
}: UseComboboxSettings<T>) => {
  const id = useId()
  const optionIdPrefix = `combobox-${id}__option`

  const isOpenRef = useRef(isOpen)

  const [comboboxInstance, setComboboxInstance] = useState<Combobox | null>(null)

  /** Get all option element instances. */
  const getOptionElements = useCallback(
    () => [...(list?.querySelectorAll('[role=option]') ?? [])] as HTMLElement[],
    [list],
  )

  const onCommit = useCallback(
    (e: Event) => {
      const nativeEvent = e as Event & {target: HTMLElement}
      const indexAttr = nativeEvent.target.getAttribute('data-combobox-list-index')
      const index = indexAttr !== null ? parseInt(indexAttr, 10) : NaN
      const option = options[index]
      if (option) externalOnCommit({nativeEvent, option})
    },
    [options, externalOnCommit],
  )

  // Prevent focus leaving the input when clicking an item
  const onOptionMouseDown = useCallback((e: MouseEvent) => e.preventDefault(), [])

  useEffect(
    function initializeComboboxInstance() {
      if (input && list) {
        if (!list.getAttribute('role')) list.setAttribute('role', 'listbox')

        const cb = new Combobox(input, list, {tabInsertsSuggestions, firstOptionSelectionMode})

        // By using state instead of a ref here, we trigger the toggleKeyboardEventHandling
        // effect. Otherwise we'd have to depend on isOpen in this effect to start the instance
        // if it's initially open
        setComboboxInstance(cb)

        return () => {
          cb.destroy()
          setComboboxInstance(null)
        }
      }
    },
    [input, list, tabInsertsSuggestions, firstOptionSelectionMode],
  )

  useEffect(
    function toggleKeyboardEventHandling() {
      const wasOpen = isOpenRef.current

      // It cannot be open if the instance hasn't yet been initialized
      isOpenRef.current = isOpen && comboboxInstance !== null

      if (isOpen === wasOpen || !comboboxInstance) return

      if (isOpen) {
        comboboxInstance.start()
      } else {
        comboboxInstance.stop()
      }
    },
    [isOpen, comboboxInstance],
  )

  useEffect(
    function bindCommitEvent() {
      list?.addEventListener('combobox-commit', onCommit)
      return () => list?.removeEventListener('combobox-commit', onCommit)
    },
    [onCommit, list],
  )

  useLayoutEffect(() => {
    const optionElements = getOptionElements()
    // Ensure each option has a unique ID (required by the Combobox class), but respect user provided IDs
    for (const [i, option] of optionElements.entries()) {
      if (!option.id || option.id.startsWith(optionIdPrefix)) option.id = `${optionIdPrefix}-${i}`
      option.setAttribute('data-combobox-list-index', i.toString())
      option.addEventListener('mousedown', onOptionMouseDown)
    }

    comboboxInstance?.resetSelection()

    return () => {
      for (const option of optionElements) option.removeEventListener('mousedown', onOptionMouseDown)
    }
  }, [getOptionElements, optionIdPrefix, options, comboboxInstance, onOptionMouseDown])
}

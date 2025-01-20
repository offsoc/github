import Combobox from '@github/combobox-nav'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useCallback, useEffect, useRef} from 'react'

import {useComboboxMenuVisibilityBehavior} from './use-combobox-menu-visibility-behavior'
import {useControlledProp} from './use-controlled-prop'
import {useProvidedRefOrCreate} from './use-provided-ref-or-create'

let nextId = 1

export interface UseAutocompleteProps<T> {
  items: Array<T>
  onSelectedItemChange: (item: T) => void
  isOpen?: boolean
  inputValue?: string
}

export interface GetInputPropsAdditionalHandlers {
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface GetItemPropsAdditionalHandlers {
  onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void
}

const handleEvent = <TEvent, TUserProps>(
  event: TEvent,
  ownHandler: (event: TEvent) => void,
  userProps: TUserProps | undefined,
  key: keyof TUserProps,
) => {
  if (userProps?.[key]) {
    const handler = userProps[key]
    if (typeof handler === 'function') {
      handler(event)
    }
  }
  ownHandler(event)
}

/**
 * A hook which provides behavior compliant with the ARIA combo box Design Pattern:
 * (https://www.w3.org/TR/wai-aria-practices/#combobox).
 * In addition to the state of the menu and current input value,
 * useCombobox returns a set of props getter functions which should be applied to the relevant
 * elements in order to provide the correct behavior.
 * Builds on top of useComboboxMenuVisibilityBehavior to handle the visibility of the menu items
 * @param props - Requires a list of items, and onSelectedItemChange callback. Optionally accepts isOpen
 * and inputValue. For each of these that are provided, state of those parameters are delegated to the consumer,
 * rather than tracked internally in the hook.
 * @param userInputRef An optional ref to the input to which the behavior is being added.
 * If not provided, will be created and tracked by the hook.
 */
export const useAutocomplete = <T>(
  props: UseAutocompleteProps<T>,
  userInputRef?: React.RefObject<HTMLInputElement>,
) => {
  const [inputValue, setInputValue] = useControlledProp('inputValue', '', props)
  const {isOpen, setIsOpen, inputOnBlur, inputOnFocus, itemOnMouseDown, onResetListInteraction} =
    useComboboxMenuVisibilityBehavior(props)

  const listRef = useRef<HTMLUListElement>(null)
  const itemsRef = useRef<Array<T>>(props.items)
  const comboboxRef = useRef<Combobox>()

  const onSelectedItemChangeRef = useRef<(item: T) => void>(props.onSelectedItemChange)

  const id = useRef(nextId++)
  const inputId = useRef(`combobox-input-${id.current}`)
  const listId = useRef(`combobox-list-${id.current}`)

  const inputRef = useProvidedRefOrCreate(userInputRef)

  if (itemsRef.current !== props.items) {
    itemsRef.current = props.items
  }

  if (onSelectedItemChangeRef.current !== props.onSelectedItemChange) {
    onSelectedItemChangeRef.current = props.onSelectedItemChange
  }

  const selectItem = useCallback(
    (index: number) => {
      if (itemsRef.current) {
        const selectedItem = itemsRef.current[index]
        if (selectedItem) {
          onSelectedItemChangeRef.current(selectedItem)
        }

        onResetListInteraction()

        if (inputRef.current) {
          inputRef.current.focus()
        }
        setIsOpen(false)
      }
    },
    [onResetListInteraction, setIsOpen, inputRef],
  )

  const onComboboxCommit = useCallback(
    (e: Event) => {
      const dataListIndex = (e.target as HTMLElement).getAttribute('data-list-index')
      if (dataListIndex) {
        selectItem(parseInt(dataListIndex))
      }
    },
    [selectItem],
  )

  useEffect(() => {
    if (isOpen) {
      comboboxRef.current?.start()
    } else {
      comboboxRef.current?.stop()
    }
  }, [isOpen])

  const trackingOnComboboxCommit = useTrackingRef(onComboboxCommit)
  useEffect(() => {
    const list = listRef.current

    if (inputRef.current && listRef.current) {
      comboboxRef.current = new Combobox(inputRef.current, listRef.current)

      const handler = (e: Event) => {
        trackingOnComboboxCommit.current(e)
      }
      listRef.current.addEventListener('combobox-commit', handler)

      return function cleanup() {
        comboboxRef.current?.destroy()
        list?.removeEventListener('combobox-commit', handler)
      }
    }
  }, [inputRef, trackingOnComboboxCommit])

  useEffect(() => {
    if (isOpen) {
      comboboxRef.current?.start()
    } else {
      comboboxRef.current?.stop()
    }
  }, [isOpen])

  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const getInputProps = (additionalHandlers?: GetInputPropsAdditionalHandlers) => {
    return {
      ref: inputRef,
      id: inputId.current,
      type: 'text',
      value: inputValue,
      onFocus: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleEvent(e, inputOnFocus, additionalHandlers, 'onFocus')
      },
      onBlur: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleEvent(e, inputOnBlur, additionalHandlers, 'onBlur')
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleEvent(e, inputOnChange, additionalHandlers, 'onChange')
      },
    }
  }
  const getListProps = () => {
    return {ref: listRef, id: listId.current}
  }
  const getItemProps = (_item: T, index: number, additionalHandlers?: GetItemPropsAdditionalHandlers) => {
    return {
      role: 'option',
      id: `combobox-${id.current}-item-${index}`,
      'data-list-index': index,
      onMouseDown: (e: React.MouseEvent<HTMLLIElement>) => {
        handleEvent(e, itemOnMouseDown, additionalHandlers, 'onMouseDown')
      },
    }
  }

  const selectFirstItem = () => {
    if (inputRef.current && listRef.current) {
      comboboxRef.current?.clearSelection()
      // navigate() with no 3rd parameter will increment the
      // selected index by 1. Since we have first cleared the
      // selection, this in this scenario we will select the first item.
      comboboxRef.current?.navigate(1)
    }
  }

  return {inputValue, setInputValue, getInputProps, getListProps, getItemProps, isOpen, selectFirstItem}
}

import {type FocusEventHandler, useEffect} from 'react'

import {
  type GetInputPropsAdditionalHandlers,
  type GetItemPropsAdditionalHandlers,
  useAutocomplete,
  type UseAutocompleteProps,
} from './use-autocomplete'
import {useComboboxMenuVisibilityBehavior} from './use-combobox-menu-visibility-behavior'

interface UseTextExpanderProps<TItem> extends UseAutocompleteProps<TItem> {
  textExpanderOnChange: (text: string) => void
  expansionKey?: string
}

/**
 * Provides behavior for a single character enabling combobox interaction.
 * Builds on top of `useCombobox` but manages detecting when the expansion key
 * is input in order to show the list of items. In addition to UseComboboxProps,
 * the hook also expects a `textExpanderOnChange` prop that is called when the input
 * value changes if the component is in text-expansion mode (the input starts with the expansion key)
 * @param props `useComboboxProps` along with textExpanderOnChange
 * @param inputRef An optional ref to the <input /> which will be used for text-expansion. If not provided,
 * useCombobox will create and return one.
 * @type TItem repesents the type of each item in the list of items
 */
export const useTextExpander = <TItem>(
  {
    items,
    onSelectedItemChange,
    textExpanderOnChange,
    expansionKey = '#',
    ...comboboxProps
  }: UseTextExpanderProps<TItem>,
  inputRef?: React.RefObject<HTMLInputElement>,
) => {
  const {inputOnBlur, isOpen, setIsOpen, itemOnMouseDown, onResetListInteraction} = useComboboxMenuVisibilityBehavior()
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.startsWith(expansionKey)) {
      if (!isOpen) {
        setIsOpen(true)
      }
      textExpanderOnChange(e.target.value.substr(1))
    } else {
      setIsOpen(false)
    }
  }
  const modifiedOnSelectedItemChange = (item: TItem) => {
    onResetListInteraction()
    setIsOpen(false)
    onSelectedItemChange(item)
  }
  const {getInputProps, selectFirstItem, inputValue, getItemProps, ...rest} = useAutocomplete(
    {
      items,
      isOpen,
      onSelectedItemChange: modifiedOnSelectedItemChange,
      ...comboboxProps,
    },
    inputRef,
  )
  const inputOnFocus = (_e: React.FocusEvent) => {
    if (inputValue.startsWith(expansionKey)) {
      setIsOpen(true)
    }
  }
  useEffect(() => {
    if (inputValue.startsWith(expansionKey)) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [inputValue, setIsOpen, expansionKey])

  const modifiedGetInputProps = (userProps?: GetInputPropsAdditionalHandlers) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      userProps?.onChange?.(e)
      onInputChange(e)
    }

    const onFocus: FocusEventHandler<HTMLInputElement> = e => {
      userProps?.onFocus?.(e)
      inputOnFocus(e)
    }

    const onBlur: FocusEventHandler<HTMLInputElement> = e => {
      userProps?.onBlur?.(e)
      inputOnBlur(e)
    }

    return getInputProps({onChange, onBlur, onFocus})
  }

  const modifiedGetItemProps = (item: TItem, index: number, userProps?: GetItemPropsAdditionalHandlers) => {
    const onMouseDown = (e: React.MouseEvent<HTMLElement>) => {
      if (userProps && userProps.onMouseDown) {
        userProps.onMouseDown(e)
      }
      itemOnMouseDown()
    }
    return getItemProps(item, index, {...userProps, onMouseDown})
  }

  useEffect(() => {
    if (isOpen) {
      selectFirstItem()
    }
  }, [isOpen, items, selectFirstItem])
  return {
    ...rest,
    isOpen,
    selectFirstItem,
    getInputProps: modifiedGetInputProps,
    getItemProps: modifiedGetItemProps,
    inputValue,
    textExpanderValue: inputValue.startsWith(expansionKey) ? inputValue.substr(1) : '',
  }
}

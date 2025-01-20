import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {Text} from '@primer/react'
import {useCallback, useRef} from 'react'

import {ItemValueAdd, ItemValueEdit} from '../../../api/stats/contracts'
import {shortcutFromEvent, SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {FocusType, NavigationDirection} from '../../../navigation/types'
import {BorderlessTextInput} from '../../common/borderless-text-input'
import {useCellValidationMessage} from '../cell-validation'
import {BaseCell} from '../cells/base-cell'
import {useOnCellEditorFocus} from '../hooks/use-on-cell-editor-focus'
import {moveTableFocus, useStableTableNavigation} from '../navigation'
import {useSubmitOnCleanup} from './use-submit-on-cleanup'

type TextCellEditorProps = Readonly<{
  /** Column associated with the cell being edited */
  columnId: number

  /** Row associated with the cell being edited*/
  rowId: string

  /** The initial value to populate the input of the editor */
  defaultValue: string | number

  /**
   * Callback to fire to update the cell on the model.
   *
   * This callback should return `true` if the value was persisted, or `false`
   * if something went wrong and the value was unable to be persisted.
   */
  onUpdate: (value: string) => boolean

  /**
   * An optional function to run which can apply validation rules to the text
   * of the input. If this is omitted, this will assume the input is always
   * valid.
   *
   * This callback should return an error message if the input is not valid,
   * otherwise it should return `undefined` if the input is valid.
   */
  validationFn?: (value: string) => string | undefined

  /**
   * Align the text input on the left or right.
   *
   * If this value is omitted, the input will be left aligned.
   */
  align?: 'left' | 'right'

  /**
   * Optional type hint for text input
   */
  type?: string

  /**
   * The model of the item
   */
  model: MemexItemModel

  emojiPickerDisabled?: boolean
}>

export const TextCellEditor: React.FC<TextCellEditorProps> = ({
  model,
  align,
  columnId,
  defaultValue,
  rowId,
  onUpdate,
  validationFn,
  type,
  emojiPickerDisabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const {postStats} = usePostStats()
  const {navigationDispatch} = useStableTableNavigation()
  useOnCellEditorFocus(inputRef)

  const isValidRef = useRef(true)

  const {setValidationMessage, clearValidationMessage, validationMessageId} = useCellValidationMessage(rowId, columnId)

  const submitValue = useCallback(
    (value: string) => {
      const hasPreviousValue = defaultValue || (typeof defaultValue === 'number' && defaultValue !== 0)
      postStats({
        name: hasPreviousValue ? ItemValueEdit : ItemValueAdd,
        memexProjectColumnId: columnId,
        memexProjectItemId: model.content.id,
      })
      if (!validationFn) {
        return onUpdate(value)
      }

      let succeeded = false
      if (isValidRef.current) {
        succeeded = onUpdate(value)
      }

      if (succeeded) {
        clearValidationMessage()
      }

      return succeeded
    },
    [clearValidationMessage, columnId, defaultValue, model.content.id, onUpdate, postStats, validationFn],
  )

  const {
    cancelSaveOnBlur: cancelSave,
    protectedSubmitValue,
    onChange: cleanupOnChange,
  } = useSubmitOnCleanup({submitValue, cleanupFn: clearValidationMessage, defaultValue})

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      cleanupOnChange(e)

      if (!validationFn) {
        // just in case the component previous had a validation function
        isValidRef.current = true
        clearValidationMessage()
        return
      }

      const validationResult = validationFn(e.target.value)
      if (validationResult) {
        isValidRef.current = false
        setValidationMessage(validationResult, rowId, columnId)
      } else {
        isValidRef.current = true
        clearValidationMessage()
      }
    },
    [cleanupOnChange, validationFn, setValidationMessage, rowId, columnId, clearValidationMessage],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (shortcutFromEvent(e)) {
        case SHORTCUTS.ENTER: {
          if (protectedSubmitValue()) {
            navigationDispatch(moveTableFocus({y: NavigationDirection.Next, focusType: FocusType.Focus}))
          }
          e.stopPropagation()
          e.preventDefault()
          return
        }
        case SHORTCUTS.SHIFT_TAB: {
          if (protectedSubmitValue()) {
            navigationDispatch(
              moveTableFocus({x: NavigationDirection.Previous, focusType: FocusType.Focus, details: {wrap: true}}),
            )
          }
          e.stopPropagation()
          e.preventDefault()
          return
        }
        case SHORTCUTS.TAB: {
          if (protectedSubmitValue()) {
            navigationDispatch(
              moveTableFocus({x: NavigationDirection.Next, focusType: FocusType.Focus, details: {wrap: true}}),
            )
          }
          e.stopPropagation()
          e.preventDefault()
          return
        }
        case SHORTCUTS.ESCAPE: {
          cancelSave()
          navigationDispatch(moveTableFocus({focusType: FocusType.Focus}))
          e.stopPropagation()
          e.preventDefault()
          return
        }
      }
    },
    [cancelSave, navigationDispatch, protectedSubmitValue],
  )

  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const baseCellProps = align === 'right' ? {justifyContent: 'flex-end'} : undefined
  const textAlign = align === 'right' ? 'right' : 'left'

  const input = (
    <BorderlessTextInput
      {...inputCompositionProps}
      onChange={onChange}
      defaultValue={defaultValue}
      ref={inputRef}
      aria-describedby={validationMessageId}
      aria-invalid={!isValidRef.current}
      type={type}
      sx={{
        textAlign,
        fontSize: 1,
      }}
    />
  )

  const autocompleteProps = useEmojiAutocomplete()

  return (
    <BaseCell editing sx={baseCellProps}>
      {!emojiPickerDisabled ? (
        <InlineAutocomplete {...autocompleteProps} fullWidth>
          {input}
        </InlineAutocomplete>
      ) : (
        <Text sx={{width: '100%'}}>{input}</Text>
      )}
    </BaseCell>
  )
}

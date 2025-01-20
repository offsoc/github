import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useCallback, useEffect, useRef} from 'react'

import {shortcutFromEvent, SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {LoadingStates} from '../../../hooks/use-view-loading-state'
import {isSingleSelectOption, type VerticalGroup} from '../../../models/vertical-group'
import {AggregateLabels} from '../../common/aggregate-labels'
import {AutosizeTextInput} from '../../common/autosize-text-input'
import {BorderlessTextInput} from '../../common/borderless-text-input'
import {SanitizedHtml} from '../../dom/sanitized-html'
import {ColorDecorator} from '../../fields/single-select/color-decorator'
import {useStopPropagation} from '../hooks/use-event-handler'

type Props = {
  counterSx?: BetterSystemStyleObject
  columnLimit?: number
  hideItemsCount: boolean
  itemsCount: number
  loadingState: LoadingStates

  /** The vertical group whose name will be edited */
  verticalGroup: VerticalGroup

  /** Whether the user is currently editing */
  isEditing: boolean

  /** A function which updates the `isEditing` prop */
  setIsEditing: (isEditing: boolean) => void

  /** Whether to focus on the name immediately on first render */
  initialFocus?: boolean

  /**
   * A callback called when the user indicates they wish to save their name
   * changes
   */
  onNameChange: (value: string) => void

  /**
   * Whether this vertical group name is user-editable
   *
   * When `false`, this component will only display the column name.
   */
  isUserEditable: boolean

  /** A placeholder for this component's input element  */
  placeholder?: string
}

// Consistent baseline of both input and non-editing rendered text.
const COLUMN_NAME_HEIGHT = '24px'

const SHARED_TEXT_STYLE = {fontSize: 2, fontWeight: 'bold'}

/** Get additional styles to apply to container element  */
function getFocusStylesForBox(isEditing: boolean, isUserEditable: boolean): BetterSystemStyleObject {
  if (isEditing) {
    return {
      boxShadow: 'primer.shadow.focus',
      borderRadius: '2px',
    }
  }
  if (isUserEditable) {
    return {
      '&:focus-within': {
        boxShadow: 'primary.shadow.focus',
        borderRadius: '2',
      },
      '&:hover:not(:focus-within)': {
        boxShadow: theme => `0 0 0 3px ${theme.colors.border.default}`,
        borderRadius: '2',
      },
    }
  }
  return {}
}

/**
 * Render a column name or an input to update it.
 *
 * This component exposes controlled state to the caller via `isEditing` and
 * `setIsEditing` props.
 */
export const EditableColumnName: React.FC<Props> = memo(
  ({
    columnLimit,
    counterSx,
    hideItemsCount,
    itemsCount,
    verticalGroup,
    isEditing,
    loadingState,
    setIsEditing,
    onNameChange,
    isUserEditable,
    initialFocus,
    placeholder,
  }) => {
    const [newValue, setNewValue] = useSyncedState(verticalGroup.name)
    const trigger = useRef<HTMLDivElement>(null)
    const input = useRef<HTMLInputElement>(null)
    const lastIsEditing = useRef(isEditing)

    useEffect(() => {
      if (isEditing) input.current?.focus()
    }, [isEditing])

    const initialFocusAtMount = useRef(initialFocus)
    useEffect(() => {
      // Only on first render
      if (initialFocusAtMount.current) trigger.current?.focus()
    }, [])

    useEffect(() => {
      // When we switch from editing to not editing, focus the trigger. We don't
      // do this in our `onKeyDown` handler, because we need to defer this until
      // the non-editing render, otherwise our `onBlur` handler on the input
      // fires, which triggers submit behavior.

      if (!isEditing && lastIsEditing.current) {
        trigger.current?.focus()
      }

      lastIsEditing.current = isEditing
    }, [isEditing])

    // Prevent dragging column while selecting text.
    const onInputMouseDown = useStopPropagation()
    const onInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
      e => {
        setNewValue(e.currentTarget.value)
      },
      [setNewValue],
    )

    const startEditing = useCallback(() => {
      if (isUserEditable) {
        setNewValue(verticalGroup.name)
        setIsEditing(true)
      }
    }, [isUserEditable, verticalGroup.name, setIsEditing, setNewValue])

    const stopEditing = useCallback(() => {
      setNewValue(verticalGroup.name)
      setIsEditing(false)
    }, [verticalGroup.name, setIsEditing, setNewValue])

    const submitChange = useCallback(() => {
      onNameChange(newValue)
      stopEditing()
    }, [newValue, onNameChange, stopEditing])

    const onKeyDown: React.KeyboardEventHandler = useCallback(
      e => {
        switch (shortcutFromEvent(e)) {
          case SHORTCUTS.ESCAPE:
            if (isEditing) stopEditing()
            return
          case SHORTCUTS.ENTER:
            if (isEditing) {
              submitChange()
            } else {
              startEditing()
            }
            return
        }
      },
      [isEditing, startEditing, stopEditing, submitChange],
    )

    const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

    const sx = getFocusStylesForBox(isEditing, isUserEditable)

    const autocompleteProps = useEmojiAutocomplete()

    return (
      <Box
        ref={trigger}
        onClick={startEditing}
        onKeyDown={!isEditing ? onKeyDown : undefined}
        tabIndex={isUserEditable ? 0 : -1}
        {...testIdProps('board-view-column-title')}
        sx={{
          ...sx,
          display: 'flex',
          alignItems: 'center',
          height: COLUMN_NAME_HEIGHT,
          my: 1,
          mr: 2,
          overflow: 'hidden',
          columnGap: 2,
        }}
      >
        {isSingleSelectOption(verticalGroup.groupMetadata) && (
          <ColorDecorator color={verticalGroup.groupMetadata.color} />
        )}

        {isEditing ? (
          <InlineAutocomplete {...autocompleteProps}>
            <AutosizeTextInput
              as={BorderlessTextInput}
              ref={input}
              onChange={onInputChange}
              onBlur={submitChange}
              onMouseDown={onInputMouseDown}
              {...inputCompositionProps}
              type="text"
              value={newValue}
              placeholder={placeholder}
              sx={{
                height: COLUMN_NAME_HEIGHT,
              }}
              {...SHARED_TEXT_STYLE}
            />
          </InlineAutocomplete>
        ) : (
          <h2>
            <SanitizedHtml
              role={isUserEditable ? 'button' : undefined}
              {...testIdProps('board-view-column-title-text')}
              sx={{
                lineHeight: COLUMN_NAME_HEIGHT,
                cursor: 'default',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
              {...SHARED_TEXT_STYLE}
            >
              {verticalGroup.nameHtml}
            </SanitizedHtml>
          </h2>
        )}

        {loadingState === LoadingStates.loaded && (
          <AggregateLabels
            aggregates={[]}
            counterSx={{
              flexShrink: 0,
              ...counterSx,
            }}
            hideItemsCount={hideItemsCount}
            columnLimit={columnLimit}
            itemsCount={itemsCount}
          />
        )}
      </Box>
    )
  },
)

EditableColumnName.displayName = 'EditableColumnName'

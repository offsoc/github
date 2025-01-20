import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {IssueDraftIcon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'
import {memo, useCallback, useRef} from 'react'

import {MemexColumnDataType, SystemColumnId} from '../../../api/columns/contracts/memex-column'
import type {TitleValueWithContentType} from '../../../api/columns/contracts/storage'
import type {DraftIssueTitleValue} from '../../../api/columns/contracts/title'
import {ItemType} from '../../../api/memex-items/item-type'
import {ItemRenameName, TitleFieldUI} from '../../../api/stats/contracts'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {shortcutFromEvent, SHORTCUTS} from '../../../helpers/keyboard-shortcuts'
import {parseTitleDefaultRaw} from '../../../helpers/parsing'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {usePostStats} from '../../../hooks/common/use-post-stats'
import {useApiRequest} from '../../../hooks/use-api-request'
import {useUpdateItem} from '../../../hooks/use-update-item'
import {type ColumnValue, hasValue} from '../../../models/column-value'
import type {MemexItemModel} from '../../../models/memex-item-model'
import {FocusType, NavigationDirection} from '../../../navigation/types'
import {useSetColumnValue} from '../../../state-providers/column-values/use-set-column-value'
import {Resources} from '../../../strings'
import {BorderlessTextInput} from '../../common/borderless-text-input'
import {ItemStateForTitle} from '../../item-state'
import useToasts, {ToastType} from '../../toasts/use-toasts'
import {BaseCell} from '../cells/base-cell'
import {useOnCellEditorFocus} from '../hooks/use-on-cell-editor-focus'
import {moveTableFocus, useStableTableNavigation, useTableNavigationFocusInitialValue} from '../navigation'
import {useSubmitOnCleanup} from './use-submit-on-cleanup'

type Props = Readonly<{
  model: MemexItemModel
  currentValue: ColumnValue<TitleValueWithContentType>
  replaceContents: boolean
}>

function getRawValue(currentValue: ColumnValue<TitleValueWithContentType>): string {
  return hasValue(currentValue) ? parseTitleDefaultRaw(currentValue.value) : ''
}

export const TitleEditor = memo<Props>(function TitleEditor(props) {
  const {model, currentValue} = props
  const columnData = model.columns

  const {navigationDispatch} = useStableTableNavigation()
  const initialValue = useTableNavigationFocusInitialValue()
  const inputRef = useRef<HTMLInputElement>(null)
  const isValidRef = useRef(true)
  const {updateItem} = useUpdateItem()
  const {postStats} = usePostStats()
  const {setColumnValue} = useSetColumnValue()

  useOnCellEditorFocus(inputRef)
  const {addToast} = useToasts()

  const defaultValue = props.replaceContents ? initialValue : getRawValue(currentValue)

  const request = useCallback(
    async (titleValue: DraftIssueTitleValue) => {
      if (inputRef.current) {
        const newTitle = replaceShortCodesWithEmojis(inputRef.current.value)

        await updateItem(model, {
          dataType: MemexColumnDataType.Title,
          value: {...titleValue, title: {raw: newTitle, html: newTitle}},
        })
      }
    },
    [model, updateItem],
  )

  const rollback = useCallback(
    async (titleValue: DraftIssueTitleValue) => {
      setColumnValue(model, {memexProjectColumnId: SystemColumnId.Title, value: titleValue})
    },
    [model, setColumnValue],
  )

  const {perform} = useApiRequest({request, rollback})

  const submitValue = useCallback(
    (value: string) => {
      const titleValue = columnData.Title
      if (!titleValue) {
        return false
      }

      if (titleValue.contentType === ItemType.RedactedItem) {
        // we should not be receiving a redacted item in the title editor but
        // this asserts we will ignore a value if somehow it's used
        return false
      }

      if (value === '') {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({message: Resources.titleCannotBeBlank, type: ToastType.warning})
      } else {
        perform(titleValue.value, titleValue.value)
        postStats({
          name: ItemRenameName,
          ui: TitleFieldUI,
          memexProjectItemId: model.content.id,
        })
      }
      return true
    },
    [addToast, columnData, model.content.id, perform, postStats],
  )

  const {
    cancelSaveOnBlur: cancelSave,
    protectedSubmitValue,
    onChange: cleanupOnChange,
  } = useSubmitOnCleanup({submitValue, defaultValue})

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (shortcutFromEvent(e)) {
        case SHORTCUTS.ENTER: {
          if (protectedSubmitValue())
            navigationDispatch(moveTableFocus({y: NavigationDirection.Next, focusType: FocusType.Focus}))
          e.stopPropagation()
          e.preventDefault()
          return
        }
        case SHORTCUTS.SHIFT_TAB: {
          if (protectedSubmitValue())
            navigationDispatch(
              moveTableFocus({x: NavigationDirection.Previous, focusType: FocusType.Focus, details: {wrap: true}}),
            )
          e.stopPropagation()
          e.preventDefault()
          return
        }
        case SHORTCUTS.TAB: {
          if (protectedSubmitValue())
            navigationDispatch(
              moveTableFocus({x: NavigationDirection.Next, focusType: FocusType.Focus, details: {wrap: true}}),
            )
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
    [navigationDispatch, cancelSave, protectedSubmitValue],
  )

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      cleanupOnChange(e)

      isValidRef.current = true
    },
    [cleanupOnChange],
  )

  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const handlers = {onChange, ...inputCompositionProps}

  const autocompleteProps = useEmojiAutocomplete()

  const titleValue = columnData.Title
  if (!titleValue) {
    return null
  }

  switch (titleValue.contentType) {
    case ItemType.DraftIssue:
      return (
        <BaseCell editing>
          <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
            <Octicon icon={IssueDraftIcon} sx={{color: 'fg.muted'}} aria-label="Draft issue" />
          </Box>
          <InlineAutocomplete {...autocompleteProps} fullWidth>
            <BorderlessTextInput
              sx={{color: 'fg.muted', fontSize: 1}}
              {...handlers}
              defaultValue={defaultValue}
              ref={inputRef}
            />
          </InlineAutocomplete>
        </BaseCell>
      )
    case ItemType.Issue:
    case ItemType.PullRequest: {
      return (
        <BaseCell editing>
          <Box sx={{flexShrink: 0, mr: 2, display: 'flex'}}>
            <ItemStateForTitle title={titleValue} />
          </Box>
          <InlineAutocomplete {...autocompleteProps} fullWidth>
            <BorderlessTextInput
              sx={{
                color: 'fg.default',
                fontSize: 1,
              }}
              {...handlers}
              defaultValue={defaultValue}
              ref={inputRef}
            />
          </InlineAutocomplete>
        </BaseCell>
      )
    }
    default:
      return null
  }
})

TitleEditor.displayName = 'TitleEditor'

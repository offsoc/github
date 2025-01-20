import {useKeyPress} from '@github-ui/use-key-press'
import {FormControl, TextInput, useConfirm} from '@primer/react'
import {type ChangeEvent, useCallback, useMemo} from 'react'
import type React from 'react'

import {HOTKEYS} from '../constants/hotkeys'
import {LABELS} from '../constants/labels'
import {TEST_IDS} from '../constants/test-ids'
import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {useEmojiSuggestions} from '@github-ui/markdown-editor/suggestions/use-emoji-suggestions'
import {emojiList} from '@github-ui/comment-box/emojis'
import {GlobalCommands} from '@github-ui/ui-commands'
import {useAutocompleteTriggersAndSuggestions} from '@github-ui/inline-autocomplete/hooks/use-autocomplete-triggers-and-suggestions'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

type IssueTitleInputProps = {
  titleRef: React.RefObject<HTMLInputElement>
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  commitIssueTitleEdit: () => void
  cancelIssueTitleEdit: () => void
  isDirty: boolean
  validationError?: string
  isSubmitting: boolean
  setIsSubmitting: (isSubmitting: boolean) => void
  emojiSkinTonePreference?: number
}

export function IssueTitleInput({
  titleRef,
  value,
  onChange,
  commitIssueTitleEdit,
  cancelIssueTitleEdit,
  isDirty,
  validationError,
  isSubmitting,
  setIsSubmitting,
  emojiSkinTonePreference,
}: IssueTitleInputProps) {
  const confirm = useConfirm()
  const {issues_react_ui_commands_migration} = useFeatureFlags()

  const handleCloseEdit = useCallback(async () => {
    if (isDirty) {
      // Prompt user to acknowledge they want to exit without saving
      const discardChanges = await confirm({
        title: LABELS.unsavedChangesTitle,
        content: LABELS.unsavedChangesContent,
        confirmButtonType: 'danger',
      })
      if (!discardChanges) {
        return
      }
    }
    cancelIssueTitleEdit()
  }, [cancelIssueTitleEdit, confirm, isDirty])

  useKeyPress(
    [HOTKEYS.closeEdit],
    async (event: KeyboardEvent) => {
      if (issues_react_ui_commands_migration) return
      event.preventDefault()

      await handleCloseEdit()
    },
    {triggerWhenInputElementHasFocus: true},
  )

  const emptyArray: [] = [] // constant reference to avoid re-running effects
  const {trigger, calculateSuggestions} = useEmojiSuggestions(emojiList ?? emptyArray, {tone: emojiSkinTonePreference})
  const triggersAndSuggestions = useMemo(
    () => [{trigger, suggestionsCalculator: calculateSuggestions}],
    [calculateSuggestions, trigger],
  )
  const {
    triggers,
    suggestions,
    setSuggestionEvent,
    onHideSuggestions,
    active: suggestionsActive,
  } = useAutocompleteTriggersAndSuggestions(triggersAndSuggestions)

  const handleCommitEdit = useCallback(() => {
    if (suggestionsActive) {
      return
    }
    if (isDirty && value.length > 0) {
      setIsSubmitting(true)
      commitIssueTitleEdit()
    } else {
      cancelIssueTitleEdit()
    }
  }, [suggestionsActive, isDirty, value, setIsSubmitting, commitIssueTitleEdit, cancelIssueTitleEdit])

  useKeyPress(
    [HOTKEYS.commitEdit],
    (event: KeyboardEvent) => {
      event.preventDefault()
      if (issues_react_ui_commands_migration) return

      handleCommitEdit()
    },
    {
      triggerWhenInputElementHasFocus: true,
      scopeRef: titleRef,
      ignoreModifierKeys: true,
      triggerWhenPortalIsActive: true,
    },
  )

  return (
    <FormControl
      sx={{
        width: '100%',
      }}
      disabled={isSubmitting}
    >
      {issues_react_ui_commands_migration && (
        <GlobalCommands commands={{'issue-viewer:close-edit-title': handleCloseEdit}} />
      )}
      <FormControl.Label visuallyHidden>Title input</FormControl.Label>
      <InlineAutocomplete
        triggers={triggers}
        suggestions={suggestions}
        onShowSuggestions={setSuggestionEvent}
        onHideSuggestions={onHideSuggestions}
        fullWidth
      >
        <TextInput
          sx={{width: '100%'}}
          ref={titleRef}
          onChange={onChange}
          value={value}
          placeholder={LABELS.viewTitlePlaceholder}
          data-testid={TEST_IDS.issueTitleInput}
        />
      </InlineAutocomplete>
      {validationError && <FormControl.Validation variant="error">{validationError}</FormControl.Validation>}
    </FormControl>
  )
}

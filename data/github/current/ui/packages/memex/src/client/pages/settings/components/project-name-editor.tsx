import {InlineAutocomplete} from '@github-ui/inline-autocomplete'
import {testIdProps} from '@github-ui/test-id-props'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useSyncedState} from '@github-ui/use-synced-state'
import {FormControl, TextInput} from '@primer/react'
import {useCallback, useState} from 'react'

import {PROJECT_NAME_INPUT_ID} from '../../../components/shared-ids'
import {replaceShortCodesWithEmojis} from '../../../helpers/emojis'
import {useEmojiAutocomplete} from '../../../hooks/common/use-emoji-autocomplete'
import {Resources} from '../../../strings'

interface ProjectNameEditorProps {
  initialValue: string
  setLocalProjectName: (value: string) => void
}

export function ProjectNameEditor({initialValue, setLocalProjectName}: ProjectNameEditorProps) {
  const [localValue, setLocalValue] = useSyncedState(initialValue)
  const [hasChanged, setHasChanged] = useState(false)
  const autocompleteProps = useEmojiAutocomplete()

  const revertValue = useCallback(() => {
    setLocalValue(initialValue)
    setHasChanged(false)
  }, [setLocalValue, setHasChanged, initialValue])

  const saveValue = useCallback(async () => {
    if (!hasChanged) return

    const trimmedValue = localValue.trim()

    setLocalValue(trimmedValue)
    setHasChanged(false)
    setLocalProjectName(trimmedValue)
  }, [hasChanged, localValue, setLocalProjectName, setLocalValue])

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasChanged(true)
      setLocalValue(replaceShortCodesWithEmojis(e.target.value))
    },
    [setLocalValue, setHasChanged],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      switch (event.key) {
        case 'Enter':
          saveValue()
          break

        case 'Escape':
          if (hasChanged) event.stopPropagation()
          revertValue()
          break
      }
    },
    [saveValue, revertValue, hasChanged],
  )

  const inputCompositionProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const onBlur = useCallback(() => {
    if (document.hasFocus()) {
      saveValue()
    }
  }, [saveValue])

  return (
    <>
      <FormControl sx={{mb: 4}} id={PROJECT_NAME_INPUT_ID}>
        <FormControl.Label>Project name</FormControl.Label>
        <InlineAutocomplete {...autocompleteProps}>
          <TextInput
            value={localValue}
            sx={{'& > input': {padding: '6px 8px'}, width: 320}}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={localValue.trim().length === 0}
            {...inputCompositionProps}
          />
        </InlineAutocomplete>
        {localValue.trim().length === 0 && (
          <FormControl.Validation variant="error" {...testIdProps('project-name-error-message')}>
            {Resources.projectNameRequired}
          </FormControl.Validation>
        )}
      </FormControl>
    </>
  )
}

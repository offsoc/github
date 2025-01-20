import {useRef, useState} from 'react'
import {Button, FormControl, TextInput} from '@primer/react'
import {Stack} from '@primer/react/experimental'

import {useIsDirty} from '@github-ui/use-is-dirty'
import {useStateWithAvoidableReRenders} from '@github-ui/use-state-with-avoidable-rerenders'
import {useUpdateTitleMutation} from '../mutations/use-update-title-mutation'

export const MaxPRTitleLength = 256
export const BlankPRTitleError = "Title can't be blank"
export const EditTitleFormLabel = 'Edit Pull Request Title'

export function maxPRTitleLengthError(title: string) {
  return `Title can't be longer than ${MaxPRTitleLength} characters (currently ${title.length} characters)`
}

function isTitleValid(title: string) {
  return title.trim().length > 0 && title.length <= MaxPRTitleLength
}

export interface PullRequestEditTitleFormProps {
  initialTitle: string
  pullRequestNumber: number
  onCloseForm: () => void
}

export function PullRequestEditTitleForm({
  initialTitle,
  pullRequestNumber,
  onCloseForm,
}: PullRequestEditTitleFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [isValid, setIsValid] = useStateWithAvoidableReRenders(true)
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null)
  const [isDirty, changeDirtyData] = useIsDirty({title: initialTitle})

  const editTitleInputRef = useRef<HTMLInputElement>(null)
  const {mutate: mutateUpdateTitle, isPending: updateTitleIsPending} = useUpdateTitleMutation()

  const onTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    changeDirtyData({title: e.target.value})
    setIsValid(isTitleValid(e.target.value))
  }

  const handleUpdateTitleFailure = (message: string) => {
    setSaveErrorMessage(message)
    editTitleInputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveErrorMessage(null)

    // Prevent submitting invalid title
    if (!isValid) {
      editTitleInputRef.current?.focus()
      return
    }

    // Just close the form if title is valid but unchanged
    if (isValid && !isDirty) {
      onCloseForm()
      return
    }

    mutateUpdateTitle(
      {id: pullRequestNumber, title},
      {
        onError: error => handleUpdateTitleFailure(error.message),
        onSuccess: () => onCloseForm(),
      },
    )
  }

  const saveButtonIsDisabled = !isValid || updateTitleIsPending
  const cancelButtonIsDisabled = updateTitleIsPending

  return (
    <Stack direction={{narrow: 'vertical', regular: 'horizontal'}} gap="condensed" as="form" onSubmit={handleSubmit}>
      <Stack.Item grow>
        <FormControl>
          <FormControl.Label visuallyHidden>{EditTitleFormLabel}</FormControl.Label>
          <TextInput
            autoFocus
            block
            className="f4"
            contrast
            onChange={onTitleInputChange}
            ref={editTitleInputRef}
            validationStatus={!isValid ? 'error' : undefined}
            value={title}
          />
          <DisplayError isValid={isValid} saveErrorMessage={saveErrorMessage} title={title} />
        </FormControl>
      </Stack.Item>
      <Stack.Item>
        <Stack direction="horizontal" gap="condensed">
          <Stack.Item>
            <Button name="Save" type="submit" disabled={saveButtonIsDisabled}>
              Save
            </Button>
          </Stack.Item>
          <Stack.Item>
            <Button variant="invisible" onClick={onCloseForm} disabled={cancelButtonIsDisabled}>
              Cancel
            </Button>
          </Stack.Item>
        </Stack>
      </Stack.Item>
    </Stack>
  )
}

function DisplayError({
  isValid,
  saveErrorMessage,
  title,
}: {
  isValid: boolean
  saveErrorMessage: string | null
  title: string
}) {
  function titleValidationMessage() {
    const emptyTitle = title.trim().length === 0
    if (emptyTitle) {
      return BlankPRTitleError
    } else if (title.length > MaxPRTitleLength) {
      return maxPRTitleLengthError(title)
    }
  }

  if (!isValid) {
    return <FormControl.Validation variant="error">{titleValidationMessage()}</FormControl.Validation>
  } else if (saveErrorMessage) {
    return <FormControl.Validation variant="error">{saveErrorMessage}</FormControl.Validation>
  } else {
    return null
  }
}

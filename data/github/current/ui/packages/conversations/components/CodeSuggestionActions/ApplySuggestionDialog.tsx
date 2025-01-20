import {useAnalytics} from '@github-ui/use-analytics'
import useIsMounted from '@github-ui/use-is-mounted'
import {FocusKeys} from '@primer/behaviors'
import {Box, FormControl, Spinner, Textarea, TextInput, useFocusZone} from '@primer/react'
import type {DialogProps} from '@primer/react/drafts'
import {Dialog} from '@primer/react/drafts'
import {type PropsWithChildren, useCallback, useReducer, useState} from 'react'

function DialogFooter({children, footerButtons}: PropsWithChildren<Pick<DialogProps, 'footerButtons'>>) {
  const {containerRef: footerRef} = useFocusZone({
    bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.Tab,
    focusInStrategy: 'closest',
  })
  return footerButtons ? (
    <Dialog.Footer ref={footerRef as React.RefObject<HTMLDivElement>}>
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end'}}>
          <Dialog.Buttons buttons={footerButtons} />
        </Box>
        {children}
      </Box>
    </Dialog.Footer>
  ) : null
}

type FormState = {
  commitMessage: string
  extendedDescription: string
}

type FormAction = {
  type: ThisType<typeof actions.CHANGE_COMMIT_MESSAGE> | ThisType<typeof actions.CHANGE_EXTENDED_DESCRIPTION>
  payload: string
}

const actions = {
  CHANGE_COMMIT_MESSAGE: 'CHANGE_COMMIT_MESSAGE',
  CHANGE_EXTENDED_DESCRIPTION: 'CHANGE_EXTENDED_DESCRIPTION',
}

const baseErrorMessage = 'There was an error trying to commit changes'

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case actions.CHANGE_COMMIT_MESSAGE: {
      return {
        ...state,
        commitMessage: action.payload,
      }
    }
    case actions.CHANGE_EXTENDED_DESCRIPTION:
      return {...state, extendedDescription: action.payload}
    default:
      // eslint-disable-next-line no-console
      console.error('Unknown suggested change action.')
      return state
  }
}

function getCommitMessage(authorLogins: string[]) {
  // if there's only one suggestion
  if (authorLogins.length === 1) {
    return `Apply suggestion from @${authorLogins[0]}`
  }

  // if multiple suggestions that all have the same login
  if (new Set(authorLogins).size === 1) {
    return `Apply suggestions from @${authorLogins[0]}`
  }

  // multiple suggestions with different logins
  return `Apply suggestions from code review`
}

export type ApplySuggestionDialogProps = {
  authorLogins: string[]
  batchSize: number
  onClose: () => void
  onCommit: (
    commitMessage: string,
    onError: (error: Error, type?: string, friendlyMessage?: string) => void,
    onCompleted: () => void,
  ) => void
}

export function ApplySuggestionDialog({authorLogins, batchSize, onClose, onCommit}: ApplySuggestionDialogProps) {
  const isMounted = useIsMounted()
  const {sendAnalyticsEvent} = useAnalytics()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [formValues, setFormValues] = useReducer(formReducer, {
    commitMessage: getCommitMessage(authorLogins),
    extendedDescription: '',
  })

  const handleError = useCallback(
    (_error: Error, _type?: string, friendlyMessage?: string) => {
      if (!isMounted()) return

      let serverErrorMessage = baseErrorMessage
      if (friendlyMessage) serverErrorMessage += `: ${friendlyMessage}`
      else serverErrorMessage += '.'

      setIsSubmitting(false)
      setErrorMessage(serverErrorMessage)
    },
    [isMounted],
  )

  const handleCompleted = useCallback(() => {
    if (!isMounted()) return
    setIsSubmitting(false)
    if (errorMessage) setErrorMessage(undefined)
  }, [errorMessage, isMounted])

  const handleOnCommitClick = useCallback(() => {
    if (isSubmitting) return

    setIsSubmitting(true)
    sendAnalyticsEvent('comments.commit_suggestion', 'COMMIT_SUGGESTION_DIALOG_BUTTON', {batchSize})
    onCommit(`${formValues.commitMessage}\n\n${formValues.extendedDescription}`, handleError, handleCompleted)
  }, [
    batchSize,
    formValues.commitMessage,
    formValues.extendedDescription,
    handleCompleted,
    handleError,
    isSubmitting,
    onCommit,
    sendAnalyticsEvent,
  ])

  const renderFooter = () => (
    <DialogFooter
      footerButtons={[
        {content: 'Cancel', onClick: onClose},
        {
          content: (
            <Box as="span" sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              Commit changes{isSubmitting && <Spinner size="small" sx={{ml: 1}} />}
            </Box>
          ),
          onClick: handleOnCommitClick,
          buttonType: 'primary',
        },
      ]}
    >
      {errorMessage && (
        <FormControl.Validation sx={{mt: 2, pt: 1, justifyContent: 'flex-end'}} variant="error">
          {errorMessage}
        </FormControl.Validation>
      )}
    </DialogFooter>
  )

  return (
    <Dialog title="Apply suggestion" renderFooter={renderFooter} onClose={onClose}>
      <FormControl sx={{mb: 2}}>
        <FormControl.Label>Commit message</FormControl.Label>
        <TextInput
          block
          name="commit_message"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setFormValues({type: actions.CHANGE_COMMIT_MESSAGE, payload: event.target.value})
          }
          value={formValues.commitMessage}
        />
      </FormControl>
      <FormControl>
        <FormControl.Label>Extended description (optional)</FormControl.Label>
        <Textarea
          block
          rows={3}
          placeholder="Add an optional description..."
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormValues({type: actions.CHANGE_EXTENDED_DESCRIPTION, payload: event.target.value})
          }
          value={formValues.extendedDescription}
        />
      </FormControl>
    </Dialog>
  )
}

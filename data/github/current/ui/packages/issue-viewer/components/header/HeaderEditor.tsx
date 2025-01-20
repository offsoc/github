import {Box, Button} from '@primer/react'
import type React from 'react'
import {useCallback, useState} from 'react'

import {IssueTitleInput} from '../IssueTitleInput'
import {useRelayEnvironment} from 'react-relay'
import {commitUpdateIssueTitleMutation} from '../../mutations/update-issue-title-mutation'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {BUTTON_LABELS} from '../../constants/buttons'
import {ERRORS} from '../../constants/errors'
import {VALIDATORS} from '@github-ui/entity-validators'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {CommandButton, ScopedCommands} from '@github-ui/ui-commands'

type Props = {
  title: string
  titleRef: React.RefObject<HTMLInputElement>
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onIssueUpdate?: () => void
  cancelIssueTitleEdit: () => void
  issueId: string
  isDirty: boolean
  isSubmitting: boolean
  setIsSubmitting: (isSubmitting: boolean) => void
  emojiSkinTonePreference?: number
}

export function HeaderEditor({
  onTitleChange,
  title,
  cancelIssueTitleEdit,
  issueId,
  isDirty,
  onIssueUpdate,
  isSubmitting,
  setIsSubmitting,
  emojiSkinTonePreference,
  ...props
}: Props) {
  const relayEnvironment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const [validationError, setValidationError] = useState<string | undefined>(undefined)

  const commitIssueTitleEdit = useCallback(() => {
    commitUpdateIssueTitleMutation({
      environment: relayEnvironment,
      input: {issueId, title},
      onError: () => {
        setIsSubmitting(false)
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: ERRORS.couldNotUpdateIssueTitle,
        })
      },
      onCompleted: () => {
        setIsSubmitting(false)
        onIssueUpdate?.()
        cancelIssueTitleEdit()
      },
    })
  }, [relayEnvironment, issueId, title, addToast, setIsSubmitting, onIssueUpdate, cancelIssueTitleEdit])

  const isEmpty = title.match(/^ *$/) !== null
  const {issues_react_ui_commands_migration} = useFeatureFlags()

  const handleCommitEdit = () => {
    if (isEmpty) {
      setValidationError(VALIDATORS.titleCanNotBeEmpty)
      return
    }
    setIsSubmitting(true)
    commitIssueTitleEdit()
  }

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', gap: '8px', width: '100%'}}>
      <ScopedCommands
        commands={issues_react_ui_commands_migration ? {'issue-viewer:edit-title-submit': handleCommitEdit} : {}}
      >
        <IssueTitleInput
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (validationError) {
              setValidationError(undefined)
            }
            onTitleChange(e)
          }}
          cancelIssueTitleEdit={cancelIssueTitleEdit}
          commitIssueTitleEdit={commitIssueTitleEdit}
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          validationError={validationError}
          setIsSubmitting={setIsSubmitting}
          emojiSkinTonePreference={emojiSkinTonePreference}
          {...props}
        />
        {issues_react_ui_commands_migration ? (
          <>
            <CommandButton commandId="issue-viewer:close-edit-title" disabled={isSubmitting} />
            <CommandButton variant="primary" disabled={isSubmitting} commandId="issue-viewer:edit-title-submit" />
          </>
        ) : (
          <>
            <Button onClick={cancelIssueTitleEdit} disabled={isSubmitting}>
              {BUTTON_LABELS.cancel}
            </Button>
            <Button variant="primary" disabled={isSubmitting} onClick={handleCommitEdit}>
              {BUTTON_LABELS.submitIssueTitleEdit}
            </Button>
          </>
        )}
      </ScopedCommands>
    </Box>
  )
}

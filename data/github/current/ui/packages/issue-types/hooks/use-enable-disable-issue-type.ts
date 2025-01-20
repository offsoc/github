// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useRelayEnvironment} from 'react-relay'
import {Resources} from '../constants/strings'
import {commitUpdateIssueTypeMutation} from '../mutations/update-issue-type-mutation'
import {useCallback} from 'react'
import {formatError} from '../utils'

export const useEnableDisableIssueType = () => {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const updateIssueType = useCallback(
    (issueTypeId: string, isEnabled: boolean, onDone?: () => void) => {
      commitUpdateIssueTypeMutation({
        environment,
        input: {
          issueTypeId,
          isEnabled,
        },
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: isEnabled ? Resources.enabledIssueTypeError : Resources.disabledIssueTypeError,
          })
          onDone && onDone()
        },
        onCompleted: response => {
          const errors = response.updateIssueType?.errors || []
          if (errors.length === 0) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'success',
              message: isEnabled ? Resources.enabledIssueTypeSuccess : Resources.disabledIssueTypeSuccess,
            })
          } else {
            errors.map((e: {message: string}) => reportError(formatError('UpdateIssueType', e.message)))
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: isEnabled ? Resources.enabledIssueTypeError : Resources.disabledIssueTypeError,
            })
          }
          onDone && onDone()
        },
      })
    },
    [addToast, environment],
  )

  const enableOrganizationIssueType = (issueTypeId: string, onDone?: () => void) => {
    updateIssueType(issueTypeId, true, onDone)
  }

  const disableOrganizationIssueType = (issueTypeId: string, onDone?: () => void) => {
    updateIssueType(issueTypeId, false, onDone)
  }

  return {
    enableOrganizationIssueType,
    disableOrganizationIssueType,
  }
}

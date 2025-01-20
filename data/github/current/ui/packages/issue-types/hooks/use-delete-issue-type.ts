// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useCallback} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {Resources} from '../constants/strings'
import {commitDeleteIssueTypeMutation} from '../mutations/delete-issue-type-mutation'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {formatError} from '../utils'

export const useDeleteIssueType = () => {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()

  const deleteIssueType = useCallback(
    (issueTypeId: string, owner: string, onDone?: () => void) => {
      commitDeleteIssueTypeMutation({
        environment,
        input: {issueTypeId},
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: Resources.deletedIssueTypeError,
          })
          onDone && onDone()
        },
        onCompleted: response => {
          const errors = response.deleteIssueType?.errors || []
          if (errors.length === 0) {
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'success',
              message: Resources.deletedIssueTypeSuccess,
            })
            if (ssrSafeWindow) ssrSafeWindow.location.href = `/organizations/${owner}/settings/issue-types`
          } else {
            errors.map((e: {message: string}) => reportError(formatError('DeleteIssueType', e.message)))
            // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
            addToast({
              type: 'error',
              message: Resources.deletedIssueTypeError,
            })
          }
          onDone && onDone()
        },
      })
    },
    [addToast, environment],
  )

  return {
    deleteIssueType,
  }
}

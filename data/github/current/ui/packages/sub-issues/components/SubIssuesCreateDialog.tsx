import {graphql, useFragment} from 'react-relay'
import {CreateIssueDialogEntry, type CreateIssueDialogEntryProps} from '@github-ui/issue-create/CreateIssueDialogEntry'
import type {SubIssuesCreateDialog$key} from './__generated__/SubIssuesCreateDialog.graphql'
import {noop} from '@github-ui/noop'
import {useAlert} from '../utils/use-alert'
import {SubIssueAlertDialog} from './SubIssueAlertDialog'
import {useCallback} from 'react'

export function SubIssuesCreateDialog({
  issue,
  open,
  setOpen,
  onCreateSuccess,
}: {
  issue: SubIssuesCreateDialog$key
  open: boolean
  setOpen: (open: boolean) => void
  onCreateSuccess: CreateIssueDialogEntryProps['onCreateSuccess']
}) {
  const {alert, resetAlert, showServerAlert} = useAlert()
  const data = useFragment(
    // !! NOTE: This fragment is preloaded on the server via the primary IssueViewer query, so the data
    // here is loaded whether the flag is enabled or not. Please be careful and don't include fields which
    // are not already loaded by other fragments.
    graphql`
      fragment SubIssuesCreateDialog on Issue {
        id
        repository {
          id
          name
          owner {
            login
          }
        }
      }
    `,
    issue,
  )

  const onCreateError = useCallback((error: Error) => showServerAlert(error), [showServerAlert])

  return (
    <>
      {alert && (
        <SubIssueAlertDialog title={alert.title} onClose={resetAlert}>
          {alert.body}
        </SubIssueAlertDialog>
      )}
      <CreateIssueDialogEntry
        navigate={noop}
        onCreateSuccess={onCreateSuccess}
        onCreateError={onCreateError}
        isCreateDialogOpen={open}
        setIsCreateDialogOpen={setOpen}
        optionConfig={{
          scopedOrganization: data.repository.owner.login,
          issueCreateArguments: {
            repository: {
              owner: data.repository.owner.login,
              name: data.repository.name,
            },
            parentIssue: {
              id: data.id,
            },
          },
        }}
      />
    </>
  )
}

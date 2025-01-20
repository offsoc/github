import {GitHubAvatar} from '@github-ui/github-avatar'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {TrashIcon} from '@primer/octicons-react'
import {Box, Button, Label, Octicon, RelativeTime, Text, useConfirm} from '@primer/react'
import {useCallback} from 'react'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'

import {BUTTON_LABELS} from '../constants/button-labels'
import {ERRORS} from '../constants/errors'
import {LABELS} from '../constants/labels'
import {VALUES} from '../constants/values'
import {commitDeleteUserContentEditMutation} from '../mutations/delete-user-content-edit-mutation'
import type {EditHistoryDialogHeaderFragment$key} from './__generated__/EditHistoryDialogHeaderFragment.graphql'

export const EditHistoryDialogHeader = ({
  queryRef,
  userContentEditId,
}: {
  queryRef: EditHistoryDialogHeaderFragment$key
  userContentEditId: string
}) => {
  const data = useFragment<EditHistoryDialogHeaderFragment$key>(
    graphql`
      fragment EditHistoryDialogHeaderFragment on UserContentEdit {
        editor {
          avatarUrl
          login
        }
        deletedAt
        editedAt
        newest
        firstEdit
        viewerCanDelete
      }
    `,
    queryRef,
  )

  const environment = useRelayEnvironment()
  const confirm = useConfirm()
  const {addToast} = useToastContext()
  const deleteRevision = useCallback(async () => {
    if (
      await confirm({
        title: LABELS.confirmations.deleteEditHistoryTitle,
        content: LABELS.confirmations.deleteEditHistoryContent,
        confirmButtonType: 'danger',
        confirmButtonContent: LABELS.confirmations.deleteEditHistoryConfirmButtonContent,
      })
    ) {
      commitDeleteUserContentEditMutation({
        environment,
        input: {id: userContentEditId},
        onError: () => {
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotDeleteEditRevision,
          })
        },
      })
    }
  }, [addToast, confirm, environment, userContentEditId])

  const hasTrailingElement = data.newest || data.deletedAt

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        position: 'sticky',
        top: 0,
        backgroundColor: 'canvas.subtle',
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'border.muted',
      }}
    >
      {data.editor && (
        <ActorOperationDetails
          login={data.editor.login}
          avatarUrl={data.editor.avatarUrl}
          time={data.editedAt}
          details={data.firstEdit ? LABELS.editHistory.created : LABELS.editHistory.edited}
          trailingElement={
            hasTrailingElement ? (
              <Label sx={{ml: 1}}>{data.deletedAt ? LABELS.editHistory.deleted : LABELS.editHistory.mostRecent}</Label>
            ) : undefined
          }
        />
      )}
      {data.viewerCanDelete && !data.newest && !data.deletedAt && (
        <Button
          sx={{marginLeft: 'auto'}}
          variant="danger"
          size="small"
          aria-label={LABELS.editHistory.deleteRevisionAriaLabel}
          onClick={deleteRevision}
        >
          <Octicon icon={TrashIcon} /> {BUTTON_LABELS.deleteEditRevision}
        </Button>
      )}
    </Box>
  )
}

type ActorOperationDetailsProps = {
  login?: string
  avatarUrl?: string
  details: string
  time?: string
  trailingElement?: JSX.Element
  sx?: Record<string, unknown>
}

export function ActorOperationDetails({
  login,
  avatarUrl,
  details,
  time,
  sx,
  trailingElement,
}: ActorOperationDetailsProps) {
  const showUserAvatar = !!avatarUrl && !!login
  return (
    <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
      <Box sx={{...sx}}>
        {showUserAvatar && (
          <>
            <GitHubAvatar
              src={avatarUrl}
              size={16}
              alt={`@${login}`}
              sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))', mr: 1}}
            />
            <Text sx={{fontWeight: 'bold'}}>{login}</Text>
          </>
        )}
        {!showUserAvatar && <span>{login ?? VALUES.ghostUserLogin}</span>}
        <span> {details} </span>
        {time && <RelativeTime date={new Date(time)} />}
      </Box>
      {trailingElement}
    </Box>
  )
}

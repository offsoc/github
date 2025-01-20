import {useCurrentRepository} from '@github-ui/current-repository'
import {commitPath} from '@github-ui/paths'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'
import {Flash} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useState} from 'react'

import type {CommitsAppPayload} from '../../../hooks/use-commits-app-payload'

export function LockConversationDialog({
  commitOid,
  locked,
  onClose,
}: {
  commitOid: string
  locked: boolean
  onClose: (locked?: boolean) => void
}) {
  const repo = useCurrentRepository()
  const {helpUrl} = useAppPayload<CommitsAppPayload>()
  const [didError, setDidError] = useState(false)

  const action = locked ? 'Unlock' : 'Lock'
  const oppositeAction = locked ? 'lock' : 'unlock'

  const lockConversation = async () => {
    const response = await verifiedFetch(
      `${commitPath({owner: repo.ownerLogin, repo: repo.name, commitish: commitOid})}/lock`,
      {
        method: 'PUT',
        headers: {Accept: 'application/json'},
      },
    )

    if (response.ok) {
      onClose(true)
    } else {
      setDidError(true)
    }
  }

  const unlockConversation = async () => {
    const response = await verifiedFetchJSON(
      `${commitPath({owner: repo.ownerLogin, repo: repo.name, commitish: commitOid})}/unlock`,
      {
        method: 'PUT',
        headers: {Accept: 'application/json'},
      },
    )

    if (response.ok) {
      onClose(false)
    } else {
      setDidError(true)
    }
  }

  return (
    <Dialog
      onClose={() => onClose()}
      width="large"
      title={`${action} conversation on this commit`}
      footerButtons={[
        {
          content: `${action} conversation`,
          buttonType: 'danger',
          sx: {width: '100%'},
          onClick: locked ? unlockConversation : lockConversation,
        },
      ]}
    >
      {didError && (
        <Flash className="mb-2" variant="danger">
          There was an error {action.toLocaleLowerCase()}ing this conversation. Please try again.
        </Flash>
      )}

      <p>{action}ing the conversation means:</p>

      <ul className="ml-4">
        {!locked ? (
          <>
            <li>
              Other users <strong>can’t add new comments</strong> to this commit.
            </li>
            {repo.isOrgOwned ? (
              <li>
                You and other members of teams with&nbsp;
                <a href={`${helpUrl}/articles/what-are-the-different-access-permissions`}>write access</a>&nbsp; to this
                repository <strong>can still leave comments</strong> that others can see.
              </li>
            ) : (
              <li>
                You and other collaborators&nbsp;
                <a href="<%= GitHub.help_url %>/articles/what-are-the-different-access-permissions">with access</a>
                &nbsp;to this repository <strong>can still leave comments</strong> that others can see.
              </li>
            )}
          </>
        ) : (
          <li>
            <strong>Everyone</strong> will be able to comment on this commit once more.
          </li>
        )}
      </ul>
      <p className="mb-0 mt-2">You can always this {oppositeAction} commit again in the future.</p>
    </Dialog>
  )
}

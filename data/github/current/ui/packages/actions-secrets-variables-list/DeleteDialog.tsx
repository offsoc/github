import {useState} from 'react'
import {Dialog} from '@primer/react/drafts'
import {fetchSessionInSudo, sudoPrompt} from '@github-ui/sudo'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {Button, Flash} from '@primer/react'
import type {DeleteDialogProps} from './types'

export const DeleteDialog = ({url, rowId, mode, setClose, additionalFormData, tableDataUpdater}: DeleteDialogProps) => {
  const [err, setError] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // this is required as sort of a workaround to prevent
  // focus trapping while the sudo modal is open
  const [visible, setVisible] = useState(true)

  return (
    <Dialog
      title={`Delete ${mode}`}
      onClose={() => {
        setClose(false, rowId)
        setError(false)
      }}
      sx={{visibility: visible ? 'visible' : 'hidden'}}
      renderFooter={() => {
        return (
          <Dialog.Footer>
            <Button
              variant="danger"
              block={true}
              disabled={deleting}
              data-testid="confirm-delete-button"
              onClick={async e => {
                if (url) {
                  // reset any previous errors
                  setError(false)

                  // check if the current session is in sudo mode
                  let sessionInSudo = await fetchSessionInSudo()

                  // if not in sudo mode, we need to prompt the user to confirm access to sudo mode
                  if (!sessionInSudo) {
                    // we need to hide this dialog so that the sudo modal doesn't have issues with focus trapping
                    setVisible(false)
                    sessionInSudo = await sudoPrompt(e.currentTarget)
                    setVisible(true)
                    // if the user cancels the sudo prompt, we can stop here with an error
                    if (!sessionInSudo) {
                      setError(true)
                      return
                    }
                  }

                  setDeleting(true)
                  const formData = new FormData()
                  formData.append('_method', 'delete')
                  if (additionalFormData) {
                    for (const key in additionalFormData) {
                      formData.append(key, additionalFormData[key]!)
                    }
                  }
                  const resp = await verifiedFetch(url, {
                    method: 'POST',
                    body: formData,
                  })
                  setDeleting(false)

                  if (resp.ok) {
                    setClose(false, rowId)
                    tableDataUpdater(rowId)
                  } else {
                    setError(true)
                  }
                }
              }}
            >
              Yes, delete this {mode}
            </Button>
          </Dialog.Footer>
        )
      }}
      aria-label={`Delete ${mode}`}
      data-testid="delete-dialog"
    >
      {err && (
        <div className="mb-2">
          <Flash variant="danger">Unable to delete {mode}</Flash>
        </div>
      )}
      {deleting ? (
        <p>
          Deleting <code className="color-fg-default f6">{rowId}</code>...
        </p>
      ) : (
        <p>
          Are you sure you want to delete <code className="color-fg-default f6">{rowId}</code>?
        </p>
      )}
    </Dialog>
  )
}

export default DeleteDialog

import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {type FileStatuses, WebCommitDialog, type WebCommitDialogState} from '@github-ui/web-commit-dialog'
import {Button} from '@primer/react'
import {useState} from 'react'

import {useFilesContext} from '../contexts/FilesContext'
import {useCommitChanges} from '../hooks/use-commit-changes'
import type {CopilotTaskBasePayload} from '../utilities/copilot-task-types'

interface CommitPanelProps {
  onClose: () => void
  fileStatuses: FileStatuses
  dialogState: WebCommitDialogState
  setDialogState: (state: WebCommitDialogState) => void
  commitButtonRef: React.RefObject<HTMLButtonElement>
}

const DEFAULT_COMMIT_MESSAGE = 'Updates from editor'
export function CommitPanel({onClose, fileStatuses, dialogState, setDialogState, commitButtonRef}: CommitPanelProps) {
  const payload = useRoutePayload<CopilotTaskBasePayload>()
  const {authorEmails, defaultEmail} = payload.webCommitInfo
  const {resetFiles} = useFilesContext()
  const {commitChanges} = useCommitChanges()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [selectedFiles, setSelectedFiles] = useState(() => new Set<string>(Object.keys(fileStatuses)))
  const [authorEmail, setAuthorEmail] = useState(authorEmails.length ? defaultEmail : undefined)

  const [message, setMessage] = useState<string>()
  const [description, setDescription] = useState('')

  const commitMessage = message !== undefined ? message : DEFAULT_COMMIT_MESSAGE
  const saveHandler = async () => {
    try {
      setDialogState('saving')
      setErrorMessage(undefined)

      await commitChanges({
        commitMessage,
        commitDescription: description,
        headBranch: payload.pullRequest.headBranch,
        headSHA: payload.pullRequest.headSHA,
        ownerLogin: payload.repo.ownerLogin,
        pullRequestNumber: payload.pullRequest.number,
        repoName: payload.repo.name,
        selectedFiles,
        authorEmail,
      })

      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
    }
  }

  return (
    <WebCommitDialog
      additionalFooterContent={
        <Button
          variant="danger"
          onClick={() => {
            if (confirm('Are you sure you want to discard your changes?')) {
              resetFiles()
              onClose()
            }
          }}
          sx={{mr: 'auto'}}
        >
          Reset all changes
        </Button>
      }
      dialogProps={{position: 'right', height: 'auto'}}
      fileStatuses={fileStatuses}
      selectedFiles={selectedFiles}
      setSelectedFiles={setSelectedFiles}
      webCommitInfo={payload.webCommitInfo}
      onSave={saveHandler}
      helpUrl={payload.helpUrl}
      refName={payload.refInfo.name}
      dialogState={dialogState}
      setDialogState={setDialogState}
      disableQuickPull={true}
      message={commitMessage}
      setMessage={setMessage}
      description={description}
      setDescription={setDescription}
      setAuthorEmail={setAuthorEmail}
      isQuickPull={false}
      errorMessage={errorMessage}
      returnFocusRef={commitButtonRef}
    />
  )
}

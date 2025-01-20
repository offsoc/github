import {Dialog} from '@primer/react/drafts'
import {Box, Button, Spinner, Text} from '@primer/react'

interface RemoveIndexedReposDialogProps {
  repos: string[]
  onSubmit: () => void
  onClose: () => void
  processing: boolean
}

export function RemoveIndexedReposDialog({repos, onSubmit, onClose, processing}: RemoveIndexedReposDialogProps) {
  return (
    <Dialog
      width="medium"
      title={repos.length > 1 ? 'Remove code search indexes' : 'Remove code search index'}
      onClose={onClose}
      renderBody={() => (
        <Dialog.Body>
          {repos.length > 1 ? (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, mb: 3}}>
              <span>You are about to remove the code search indexes for the following repositories:</span>
              <ul style={{marginLeft: '16px'}}>
                {repos.map(id => (
                  <li key={id}>
                    <span>{id}</span>
                  </li>
                ))}
              </ul>
            </Box>
          ) : (
            <Box sx={{mb: 3}}>
              <span>You are about to remove the code search index for the </span>
              <Text sx={{fontWeight: 'bold'}}>{repos[0]}</Text>
              <span> repository.</span>
            </Box>
          )}
          <span>
            {`This will reduce Copilot's response quality when chatting about ${
              repos.length > 1 ? 'these repositories.' : 'this repository.'
            }`}
          </span>
        </Dialog.Body>
      )}
      renderFooter={() => (
        <Dialog.Footer sx={{justifyContent: 'flex-end'}}>
          {processing && <Spinner />}
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} variant="danger">
            {`Remove ${repos.length > 1 ? 'indexes' : 'index'}`}
          </Button>
        </Dialog.Footer>
      )}
    />
  )
}

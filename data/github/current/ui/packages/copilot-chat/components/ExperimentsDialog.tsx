/* eslint eslint-comments/no-use: off */
import {Box, FormControl, Link, Portal, TextInput} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {useRef, useState} from 'react'

import {getCopilotExperiments, setCopilotExperiments} from '../utils/experiments'

const experimentsQuery = 'repo:github/copilot-api path:experiments.go'

export interface ExperimentsDialogProps {
  experimentsDialogRef: React.MutableRefObject<HTMLDivElement | null>
  onDismiss: () => void
}

export const ExperimentsDialog = ({onDismiss, experimentsDialogRef}: ExperimentsDialogProps): JSX.Element => {
  const [experiments, setExperiments] = useState(() => getCopilotExperiments().join(','))
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined)
  const statusMessageAriaHack = useRef('\u200B')
  const saveExperiments = () => {
    const experimentsArray = []
    for (const pair of experiments.split(',')) {
      if (pair.trim() === '') continue

      if (pair.split('=').length !== 2) {
        const invalidMessage = `Invalid experiment key=value pair${statusMessageAriaHack.current}`
        setStatusMessage(invalidMessage)
        statusMessageAriaHack.current += '\u200B'
        return
      } else {
        setStatusMessage('')
      }
      experimentsArray.push(pair)
    }

    setCopilotExperiments(experimentsArray)
    onDismiss()
  }

  return (
    <Portal>
      <Dialog ref={experimentsDialogRef} onClose={onDismiss} title={'Experiments'} width="xlarge">
        <Dialog.Body>
          <Box sx={{p: 3}}>
            <FormControl>
              <FormControl.Label>Experiments</FormControl.Label>
              <FormControl.Caption>
                <span>
                  List experiments as comma separated <code>key=value</code> pairs. To see available experiments,{' '}
                  <Link inline target="_blank" href={`/search?q=${encodeURIComponent(experimentsQuery)}`}>
                    read this code
                  </Link>
                  .
                </span>
              </FormControl.Caption>
              <TextInput
                sx={{width: '100%', my: 2}}
                aria-label="Experiments"
                name="experiments"
                value={experiments}
                onChange={e => setExperiments(e.target.value)}
                onKeyDown={e => {
                  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
                  if (e.key === 'Enter') {
                    saveExperiments()
                  }
                }}
              />
              {statusMessage && <FormControl.Validation variant="error">{statusMessage}</FormControl.Validation>}
            </FormControl>
          </Box>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.Buttons
            buttons={[
              {type: 'button', onClick: onDismiss, content: 'Cancel'},
              {type: 'submit', onClick: saveExperiments, content: 'Save', buttonType: 'primary'},
            ]}
          />
        </Dialog.Footer>
      </Dialog>
    </Portal>
  )
}

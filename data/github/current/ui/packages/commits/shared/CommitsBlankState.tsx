import {copyText} from '@github-ui/copy-to-clipboard'
import {noop} from '@github-ui/noop'
import {AlertIcon, CopyIcon, GitCommitIcon} from '@primer/octicons-react'
import {TextInput} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'

import {Panel} from '../components/Panel'

const BLANK_STATE_DATA = {
  timeout: {
    description: 'Try reloading the page, or if the problem persists, view the history locally using this command:',
    heading: 'Commit history cannot be loaded',
    icon: <AlertIcon size="medium" className="mb-2 fgColor-muted" />,
    showTextInput: true,
  },
  unavailable: {
    description: "There isn't any commit history to show here.",
    heading: 'No commits history',
    icon: <GitCommitIcon size="medium" />,
    showTextInput: false,
  },
}

export type CommitsBlankStateProps = {
  timeoutMessage: string
  unavailableMessage?: string
}

export function CommitsBlankState({timeoutMessage, unavailableMessage}: CommitsBlankStateProps) {
  const blankStateReason = timeoutMessage !== '' ? 'timeout' : 'unavailable'
  const data = BLANK_STATE_DATA[blankStateReason]
  const description = unavailableMessage ?? data.description

  return (
    <Panel>
      <div data-hpc>
        <Blankslate border={false} spacious={true}>
          <Blankslate.Visual>{data.icon}</Blankslate.Visual>
          <Blankslate.Heading>{data.heading}</Blankslate.Heading>
          <Blankslate.Description>{description}</Blankslate.Description>
          {data.showTextInput && (
            <TextInput
              aria-label={'View commit history locally command'}
              className="d-flex flex-justify-center mt-2"
              monospace={true}
              onChange={noop}
              readOnly
              size="large"
              trailingAction={
                <TextInput.Action
                  onClick={() => copyText(timeoutMessage)}
                  icon={CopyIcon}
                  aria-label="Copy to clipboard"
                  className="fgColor-muted"
                />
              }
              value={timeoutMessage}
            />
          )}
        </Blankslate>
      </div>
    </Panel>
  )
}

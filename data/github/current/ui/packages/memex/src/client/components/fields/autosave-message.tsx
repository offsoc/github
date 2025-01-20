import {announce} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Text} from '@primer/react'
import {type MutableRefObject, useEffect, useRef} from 'react'
import {Transition, type TransitionStatus} from 'react-transition-group'
import type {CSSObject} from 'styled-components'

import {CommitState} from '../../hooks/use-autosave'
import {RequestStateIcon} from '../common/state-style-decorators'

type AutosaveMessageProps = {
  commitState: CommitState
  errorMessage: MutableRefObject<string>
}

const defaultStyle = {
  opacity: 0,
}

const duration = 300

const transitionStyles: Record<TransitionStatus, CSSObject> = {
  entering: {opacity: 1},
  entered: {opacity: 1},
  exiting: {opacity: 0, transition: `opacity ${duration}ms ease-in-out`},
  exited: {opacity: 0},
  unmounted: {opacity: 0},
}

export const AutosaveMessage = ({commitState, errorMessage}: AutosaveMessageProps) => {
  const saveNodeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (commitState === CommitState.Successful) {
      announce('Saved!')
    }
  }, [commitState])

  return (
    <Box sx={{display: 'flex', alignItems: 'center'}}>
      <>
        <Transition in={commitState === CommitState.Successful} nodeRef={saveNodeRef} timeout={500}>
          {state => (
            <Text
              sx={{pl: 2, mt: 2}}
              ref={saveNodeRef}
              style={{
                ...defaultStyle,
                ...transitionStyles[state],
              }}
            >
              <RequestStateIcon status={CommitState.Successful} />
              <Text sx={{ml: 2}} {...testIdProps('column-settings-saved-message')}>
                Saved!
              </Text>
            </Text>
          )}
        </Transition>
        {commitState === CommitState.Failed && (
          <>
            <RequestStateIcon status={CommitState.Failed} />
            <Text sx={{ml: 2}} {...testIdProps('single-select-options-error-box')}>
              {errorMessage.current}
            </Text>
          </>
        )}
      </>
    </Box>
  )
}

import {Box, Button, Heading, Text} from '@primer/react'
import {useState} from 'react'

import type {
  CopilotAgentConfirmation,
  CopilotClientConfirmation,
  CopilotClientConfirmationState,
} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'

export interface ConfirmationProps {
  confirmation: CopilotAgentConfirmation
  handleConfirmation: (clientConfirmation: CopilotClientConfirmation, confirmationTitle: string) => void
  isLatestMessage?: boolean
}

export function Confirmation({confirmation, handleConfirmation, isLatestMessage}: ConfirmationProps) {
  const state = useChatState()
  const confirmationConfirmation = JSON.stringify(Object.values(confirmation.confirmation).sort())
  const clientConfirmationExists = state.allClientConfirmations?.includes(confirmationConfirmation)
  const [actionTaken, setActionTaken] = useState(clientConfirmationExists && !isLatestMessage)
  const handleUserAction = (action: CopilotClientConfirmationState) => {
    setActionTaken(true)
    handleConfirmation({state: action, confirmation: confirmation.confirmation}, confirmation.title)
  }

  return (
    <Box className="border rounded-2" sx={{display: 'flex', flexDirection: 'column', p: 3, marginTop: 3}}>
      <Heading as="h3" sx={{mb: 1, fontSize: 1, lineHeight: 'condensed'}}>
        {confirmation.title}
      </Heading>
      <Text as="p" sx={{color: 'fg.muted', mb: 0}}>
        {confirmation.message}
      </Text>
      {!actionTaken && (
        <Box sx={{display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 3}}>
          <Button variant="primary" onClick={() => handleUserAction('accepted')}>
            Allow
          </Button>
          <Button onClick={() => handleUserAction('dismissed')}>Dismiss</Button>
        </Box>
      )}
    </Box>
  )
}

import {Box, Heading, Text} from '@primer/react'

import type {CopilotChatMode} from '../utils/copilot-chat-types'
import CopilotIconAnimation from './CopilotIconAnimation'

export interface ChatWithCopilotHeaderProps {
  mode: CopilotChatMode
}

export function ChatWithCopilotHeader({mode}: ChatWithCopilotHeaderProps) {
  return (
    <>
      <Box sx={{height: '3rem', mb: 2, display: 'flex', justifyContent: 'center'}}>
        <CopilotIconAnimation />
      </Box>
      <Heading
        as="h1"
        sx={{
          textAlign: 'center',
          fontSize: 3,
          mb: 2,
        }}
      >
        Ask Copilot
      </Heading>
      {/* @ts-expect-error - TS doesn't know text-wrap yet */}
      <Text
        as="p"
        sx={{
          textAlign: 'center',
          color: 'fg.muted',
          mb: mode === 'immersive' ? 5 : 3,
          px: 3,
          textWrap: 'balance',
        }}
      >
        Select a repository to get started. Ask questions about your codebase to get answers fast and learn your way
        around.
      </Text>
    </>
  )
}

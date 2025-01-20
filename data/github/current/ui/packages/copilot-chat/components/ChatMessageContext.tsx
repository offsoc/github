import {createContext, type PropsWithChildren, useContext, useMemo} from 'react'

import type {CopilotChatMessage} from '../utils/copilot-chat-types'

export interface ChatMessageContextProps {
  message: CopilotChatMessage
}

const ChatMessageContext = createContext<ChatMessageContextProps | undefined>(undefined)

export const ChatMessageProvider = ({message, children}: PropsWithChildren<ChatMessageContextProps>) => {
  const providerData = useMemo(() => ({message}) satisfies ChatMessageContextProps, [message])
  return <ChatMessageContext.Provider value={providerData}>{children}</ChatMessageContext.Provider>
}

export const useChatMessage = () => {
  const context = useContext(ChatMessageContext)
  if (!context) throw new Error('useChatMessage must be used with ChatMessageProvider.')
  return context
}

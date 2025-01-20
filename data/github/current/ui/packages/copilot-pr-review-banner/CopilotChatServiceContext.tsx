import {CopilotChatService} from '@github-ui/copilot-chat/utils/copilot-chat-service'
import type {CopilotChatOrg} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {type PropsWithChildren, createContext, useContext, useMemo, useState} from 'react'

// Data necessary to initialize an instance of CopilotChatService
export interface ChatServiceProps {
  apiURL: string
  ssoOrganizations: CopilotChatOrg[]
}

interface CopilotChatServiceContextProps {
  chatService?: CopilotChatService
  setChatServiceData: (data: ChatServiceProps) => void
}

const CopilotChatServiceContext = createContext<CopilotChatServiceContextProps | undefined>(undefined)

export interface CopilotChatServiceProviderProps {
  apiURL?: ChatServiceProps['apiURL']
  ssoOrganizations?: ChatServiceProps['ssoOrganizations']
  chatService?: CopilotChatService
}

export const CopilotChatServiceProvider = ({
  children,
  ...props
}: PropsWithChildren<CopilotChatServiceProviderProps>) => {
  const [chatServiceData, setChatServiceData] = useState<ChatServiceProps>({
    ssoOrganizations: props.ssoOrganizations ?? [],
    apiURL: props.apiURL ?? '',
  })
  const {apiURL, ssoOrganizations} = chatServiceData
  const providerData = useMemo(() => {
    let chatService = undefined
    if (props.chatService) {
      chatService = props.chatService
    } else if (ssoOrganizations !== undefined && apiURL.length > 0) {
      chatService = new CopilotChatService(apiURL, ssoOrganizations)
    }
    return {chatService, setChatServiceData} satisfies CopilotChatServiceContextProps
  }, [apiURL, props.chatService, ssoOrganizations])
  return <CopilotChatServiceContext.Provider value={providerData}>{children}</CopilotChatServiceContext.Provider>
}

export const useCopilotChatService = () => {
  const context = useContext(CopilotChatServiceContext)
  if (!context) throw new Error('useChatService must be used with CopilotChatServiceProvider.')
  return context
}

export const haveChatServiceData = ({apiURL, chatService, ssoOrganizations}: CopilotChatServiceProviderProps) => {
  if (chatService !== undefined) return true
  return typeof apiURL === 'string' && ssoOrganizations !== undefined && apiURL.trim().length > 0
}

import type {
  CopilotChatOrg,
  CopilotChatPayload,
  CopilotChatRepo,
  Docset,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'

export interface CopilotImmersivePayload extends CopilotChatPayload {
  licensed: true
  threadID: string | null
  searchWorkerFilePath: string
  requestedTopic?: CopilotChatRepo | Docset
  ssoOrganizations: CopilotChatOrg[]
}

export interface CopilotImmersiveUnlicensedPayload {
  licensed: false
}

export interface AdministratedOrganization {
  id: number
  name: string
  avatarUrl: string
}

export interface CurrentUser {
  id: number
  name: string
  avatarUrl: string
}

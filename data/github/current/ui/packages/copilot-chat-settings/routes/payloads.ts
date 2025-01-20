import type {Docset, RepoData} from '@github-ui/copilot-chat/utils/copilot-chat-types'

export interface NewKnowledgeBasePayload {
  docsetOwner: KnowledgeBaseOwner
  currentOrganizationLogin: string
}

export interface EditKnowledgeBasePayload {
  currentOrganizationLogin: string
  knowledgeBaseId: string
}

export interface ShowKnowledgeBasePayload {
  docset: Docset
  repoData: RepoData[]
  docsetOwner: KnowledgeBaseOwner
}

export interface KnowledgeBaseOwner {
  id: number
  databaseId: number | null | undefined
  isOrganization: boolean
  displayLogin: string
}

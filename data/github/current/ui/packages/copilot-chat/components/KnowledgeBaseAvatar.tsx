import {GitHubAvatar} from '@github-ui/github-avatar'

import type {Docset} from '../utils/copilot-chat-types'

export interface KnowledgeBaseAvatarProps {
  docset: Docset
  size: number
}

export function KnowledgeBaseAvatar({docset, size}: KnowledgeBaseAvatarProps) {
  return <GitHubAvatar src={docset.avatarUrl} square={docset.ownerType === 'organization'} size={size} />
}

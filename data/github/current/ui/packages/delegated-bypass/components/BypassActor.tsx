import {GitHubAvatar} from '@github-ui/github-avatar'
import {Octicon} from '@primer/react'
import {EyeIcon, PencilIcon, PersonIcon, ToolsIcon, type Icon} from '@primer/octicons-react'
import type {BypassActor} from '../delegated-bypass-types'

const roleIconMap: {[key: string]: Icon} = {
  Write: PencilIcon,
  Maintain: ToolsIcon,
  'Repository admin': EyeIcon,
  'Organization admin': EyeIcon,
}

type BypassActorProps = {
  baseUrl: string
  id: string | number
  name: string
  type: BypassActor['actorType']
  size?: number
}

export const BypassAvatar = ({baseUrl, id, type, name, size = 16}: BypassActorProps) => {
  if (type === 'Team') {
    return <GitHubAvatar alt={name} src={`${baseUrl}/t/${id}`} size={size} />
  }
  if (type === 'RepositoryRole' || type === 'OrganizationAdmin') {
    return <Octicon icon={roleIconMap[name] || PersonIcon} sx={{color: 'fg.muted'}} size={size} />
  }
  return null
}

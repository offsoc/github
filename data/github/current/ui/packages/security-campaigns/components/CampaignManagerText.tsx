import {Link, Text, type SxProp} from '@primer/react'
import type {User} from '../../security-campaigns-shared/types/user'
import {userHovercardPath} from '@github-ui/paths'

export interface CampaignManagerProps {
  manager: User | null
}

export function CampaignManagerText({manager, sx}: CampaignManagerProps & SxProp) {
  if (!manager) {
    return null
  }

  return (
    <Text sx={sx}>
      managed by{' '}
      <Link
        href={`/${manager.login}`}
        sx={{color: 'fg.default', fontWeight: 'bold'}}
        data-hovercard-url={userHovercardPath({owner: manager.login})}
      >
        {manager.login}
      </Link>
    </Text>
  )
}

import type {FC} from 'react'

export const ActorType: FC<{
  actorType: string
}> = ({actorType}) => {
  if (actorType === 'RepositoryRole' || actorType === 'OrganizationAdmin') {
    return <span className="note ml-2">Role</span>
  }
  if (actorType === 'Integration') {
    return <span className="note ml-2">App</span>
  }
  if (actorType === 'DeployKey') {
    return null
  }
  if (actorType === 'EnterpriseTeam') {
    return <span className="note ml-2">Enterprise team</span>
  }
  if (actorType === 'EnterpriseOwner') {
    return <span className="note ml-2">Role</span>
  }
  return <span className="note ml-2">{actorType}</span>
}

export function actorTypeString(actorType: string) {
  switch (actorType) {
    case 'RepositoryRole':
    case 'OrganizationAdmin':
      return 'Role'
    case 'Integration':
      return 'App'
    case 'DeployKey':
      return ''
    case 'EnterpriseTeam':
      return 'Enterprise team'
    case 'EnterpriseOwner':
      return 'Role'
    default:
      return actorType
  }
}

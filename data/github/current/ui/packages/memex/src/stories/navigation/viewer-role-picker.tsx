import {ActionList, ActionMenu} from '@primer/react'
import {useCallback} from 'react'

import {Role} from '../../client/api/common-contracts'
import {getViewerPrivileges} from '../helpers/get-viewer-privileges'
import {storiesById} from '../story-definitions'
import {navItemOverlaySx} from './styles'

interface ViewerRoleItem {
  id: Role
  name: string
}

const viewerRoles: Array<ViewerRoleItem> = [
  {
    id: Role.Read,
    name: 'Read',
  },
  {
    id: Role.Write,
    name: 'Write',
  },
  {
    id: Role.Admin,
    name: 'Admin',
  },
  {
    id: Role.None,
    name: 'None',
  },
]

export const ViewerRolePicker = ({activeStoryId}: {activeStoryId?: string}) => {
  const storyDefinition = activeStoryId ? storiesById[activeStoryId] : undefined
  const privileges = getViewerPrivileges(storyDefinition?.viewerPrivileges)
  const selectedRole = viewerRoles.find(role => role.id === privileges.role)

  const onSelect = useCallback(
    (viewerRole: ViewerRoleItem) => () => {
      const searchParams = new URLSearchParams(window.location.search)
      const features = (searchParams.get('_memex_viewer_privileges') ?? '').split(',')
      const existingFeatureRole = features.find(feature => feature.startsWith('viewerRole:'))
      const featuresForUrl = features.filter(feature => !feature.startsWith('viewerRole:'))

      if (existingFeatureRole === `viewerRole:${viewerRole.id}`) {
        return
      } else {
        featuresForUrl.push(`viewerRole:${viewerRole.id}`)
      }

      if (featuresForUrl.length === 0) {
        searchParams.delete('_memex_viewer_privileges')
      } else {
        searchParams.set('_memex_viewer_privileges', featuresForUrl.join(','))
      }

      const pathname = `${window.location.origin}${window.location.pathname}`
      const search = searchParams.toString()
      window.location.href = search ? `${pathname}?${search}` : pathname
    },
    [],
  )

  return (
    <ActionMenu>
      <ActionMenu.Button size="small">🔒 Viewer Role: {selectedRole?.name}</ActionMenu.Button>
      <ActionMenu.Overlay sx={navItemOverlaySx}>
        <ActionList selectionVariant="single">
          {viewerRoles.map((viewerRole, index) => (
            <ActionList.Item key={index} selected={viewerRole.id === selectedRole?.id} onSelect={onSelect(viewerRole)}>
              {viewerRole.name}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

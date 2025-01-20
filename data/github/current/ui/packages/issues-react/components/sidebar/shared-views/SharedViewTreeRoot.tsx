import {GitHubAvatar} from '@github-ui/github-avatar'
import {Box, TreeView, Truncate} from '@primer/react'
import {useMemo} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {useQueryContext} from '../../../contexts/QueryContext'
import type {SharedViewTreeRoot$key} from './__generated__/SharedViewTreeRoot.graphql'
import {SharedViewTree} from './SharedViewTree'

type SharedViewTreeRootProps = {
  sharedViewTreeRoot: SharedViewTreeRoot$key
  orgs: Set<string>
}

export function SharedViewTreeRoot({sharedViewTreeRoot, orgs}: SharedViewTreeRootProps) {
  const {id, name, avatarUrl, dashboard, organization, isViewerMember, viewerCanAdminister} = useFragment(
    graphql`
      fragment SharedViewTreeRoot on Team
      @argumentDefinitions(teamViewPageSize: {type: "Int"}, searchTypes: {type: "[SearchShortcutType!]!"}) {
        id
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...TeamCheckboxItem
        isViewerMember
        viewerCanAdminister
        name
        avatarUrl
        organization {
          name
        }
        dashboard {
          ...SharedViewTree @arguments(teamViewPageSize: $teamViewPageSize, searchTypes: $searchTypes)
        }
      }
    `,
    sharedViewTreeRoot,
  )

  const {viewTeamId} = useQueryContext()

  const nodeTitle = useMemo(() => {
    return orgs.size > 1 ? `${name} (${organization.name})` : name
  }, [name, organization.name, orgs.size])

  return (
    <TreeView.Item aria-label={nodeTitle} defaultExpanded={viewTeamId === id} id={`${id}-shared-view-list-item`}>
      <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
        <GitHubAvatar size={16} square src={avatarUrl || ''} />
        <Truncate title={nodeTitle} sx={{fontSize: 0, fontWeight: 'bold', color: 'fg.default', maxWidth: '100%'}}>
          {nodeTitle}
        </Truncate>
      </Box>
      {dashboard && (
        <TreeView.SubTree>
          <SharedViewTree
            sharedViewTreeData={dashboard}
            teamId={id}
            canCreate={isViewerMember || viewerCanAdminister}
          />
        </TreeView.SubTree>
      )}
    </TreeView.Item>
  )
}

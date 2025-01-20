import {graphql} from 'react-relay'
import {usePaginationFragment} from 'react-relay/hooks'
import {ConnectionHandler} from 'relay-runtime'

import {VALUES} from '../../../constants/values'
import type {SharedViewTree$key} from './__generated__/SharedViewTree.graphql'
import {CreateSharedView} from './CreateSharedView'
import {SharedViewTreeItem} from './SharedViewTreeItem'

type SharedViewTreeProps = {
  sharedViewTreeData: SharedViewTree$key
  teamId: string
  canCreate: boolean
}

export const SharedViewTree = ({sharedViewTreeData, teamId, canCreate}: SharedViewTreeProps) => {
  const {data} = usePaginationFragment(
    graphql`
      fragment SharedViewTree on TeamDashboard
      @argumentDefinitions(
        cursor: {type: "String"}
        teamViewPageSize: {type: "Int"}
        searchTypes: {type: "[SearchShortcutType!]!"}
      )
      @refetchable(queryName: "SharedViewTreeTeamViewsPaginatedQuery") {
        shortcuts(first: $teamViewPageSize, after: $cursor, searchTypes: $searchTypes)
          @connection(key: "TeamDashboard_shortcuts") {
          edges {
            node {
              ...SharedViewTreeItem
            }
          }
        }
      }
    `,
    sharedViewTreeData,
  )

  const treeItemData = (data.shortcuts?.edges || []).flatMap(a => (a?.node ? a?.node : []))

  const sharedViewsConnectionId = ConnectionHandler.getConnectionID(
    data.id, // passed as input to the mutation/subscription
    'TeamDashboard_shortcuts',
  )

  return (
    <>
      {treeItemData.map((treeItem, index) => (
        <SharedViewTreeItem treeItem={treeItem} key={index} teamId={teamId} canEditView={canCreate} />
      ))}
      {treeItemData.length < VALUES.teamViewPageSize && canCreate && (
        <CreateSharedView teamId={teamId} sharedViewsConnectionId={sharedViewsConnectionId} />
      )}
    </>
  )
}

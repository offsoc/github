import {useEffect} from 'react'
import {graphql} from 'react-relay'
import {usePaginationFragment} from 'react-relay/hooks'

import {VALUES} from '../../../constants/values'
import type {SharedViewTreeList$key} from './__generated__/SharedViewTreeList.graphql'
import {SharedViewTreeRoot} from './SharedViewTreeRoot'

type Props = {
  sharedViewKey: SharedViewTreeList$key
}
export const selectedTeamFragment = graphql`
  fragment SharedViewTreeList on UserDashboard
  @argumentDefinitions(
    cursor: {type: "String"}
    selectedTeamsPageSize: {type: "Int"}
    teamViewPageSize: {type: "Int"}
    searchTypes: {type: "[SearchShortcutType!]!"}
  )
  @refetchable(queryName: "SharedViewTreeListSelectTeamsQuery") {
    selectedTeams(first: $selectedTeamsPageSize, after: $cursor) @connection(key: "Viewer_selectedTeams") {
      edges {
        node {
          ...SharedViewTreeRoot @arguments(teamViewPageSize: $teamViewPageSize, searchTypes: $searchTypes)
          # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
          ...RemoveTeamRow
          id
          organization {
            name
          }
        }
      }
    }
  }
`

export const SharedViewTreeList = ({sharedViewKey}: Props) => {
  const {data, loadNext, isLoadingNext, hasNext} = usePaginationFragment(selectedTeamFragment, sharedViewKey)

  const orgs = new Set<string>()
  if (data.selectedTeams.edges) {
    for (const team of data.selectedTeams.edges) {
      if (!team || !team.node || !team.node.organization.name) continue
      orgs.add(team.node.organization.name)
    }
  }

  const {selectedTeams} = data
  const treeData = (selectedTeams?.edges || []).flatMap(a => (a?.node ? a?.node : []))

  useEffect(() => {
    // load all the teams in batches in the background
    if (hasNext && !isLoadingNext) {
      loadNext(VALUES.selectedTeamsPageSize)
    }
  }, [hasNext, isLoadingNext, loadNext])

  return (
    <>
      {treeData.map(tree => (
        <SharedViewTreeRoot sharedViewTreeRoot={tree} key={tree.id} orgs={orgs} />
      ))}
    </>
  )
}

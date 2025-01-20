import {commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import {VALUES} from '../constants/values'
import type {
  UpdateDashboardSelectedTeamsInput,
  updateSelectedTeamsMutation,
} from './__generated__/updateSelectedTeamsMutation.graphql'

export function commitUpdateSelectedTeamsMutation({
  environment,
  input: {teamIds, selectedTeamsConnectionId},
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {teamIds: string[]; selectedTeamsConnectionId: string}
  onError?: (error: Error) => void
  onCompleted?: () => void
}) {
  const inputHash: UpdateDashboardSelectedTeamsInput = {
    teamIds,
  }

  return commitMutation<updateSelectedTeamsMutation>(environment, {
    mutation: graphql`
      mutation updateSelectedTeamsMutation(
        $selectedTeamsConnections: [ID!]!
        $input: UpdateDashboardSelectedTeamsInput!
        $teamViewPageSize: Int!
        $searchTypes: [SearchShortcutType!]!
      ) @raw_response_type {
        updateDashboardSelectedTeams(input: $input) {
          removedTeamIds @deleteEdge(connections: $selectedTeamsConnections)
          dashboardTeamEdges @appendEdge(connections: $selectedTeamsConnections) {
            node {
              id
              ...SharedViewTreeRoot @arguments(teamViewPageSize: $teamViewPageSize, searchTypes: $searchTypes)
              ...RemoveTeamRow
            }
          }
        }
      }
    `,
    variables: {
      input: inputHash,
      selectedTeamsConnections: [selectedTeamsConnectionId],
      teamViewPageSize: VALUES.teamViewPageSize,
      searchTypes: VALUES.viewTypes,
    },
    onError: error => onError && onError(error),
    onCompleted: () => onCompleted && onCompleted(),
  })
}

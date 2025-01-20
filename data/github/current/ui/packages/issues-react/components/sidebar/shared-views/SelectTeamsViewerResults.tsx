import {NoResults} from '@github-ui/list-view-items-issues-prs/NoResults'
import {ActionList} from '@primer/react'
import {graphql, type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'

import type {SelectTeamsForViewerQuery} from './__generated__/SelectTeamsForViewerQuery.graphql'
import type {SelectTeamsViewerResults$key} from './__generated__/SelectTeamsViewerResults.graphql'
import {SelectTeamsForViewerGraphqlQuery} from './SelectTeams'
import {TeamCheckbox} from './TeamCheckbox'

type SelectTeamsViewerResultsProps = {
  viewerTeamsQueryRef: PreloadedQuery<SelectTeamsForViewerQuery>
  handleOnSelect: (id: string) => void
  selectedTeams: Record<string, boolean>
}

export function SelectTeamsViewerResults({
  viewerTeamsQueryRef,
  handleOnSelect,
  selectedTeams,
}: SelectTeamsViewerResultsProps) {
  const preloadedData = usePreloadedQuery<SelectTeamsForViewerQuery>(
    SelectTeamsForViewerGraphqlQuery,
    viewerTeamsQueryRef,
  )
  const {teams} = useFragment<SelectTeamsViewerResults$key>(
    graphql`
      fragment SelectTeamsViewerResults on User
      @argumentDefinitions(count: {type: "Int", defaultValue: 10}, organizationId: {type: "ID"}) {
        teams(first: $count, organizationID: $organizationId) @connection(key: "OrganizationQueried_teams") {
          edges {
            node {
              id
              ...TeamCheckboxItem
            }
          }
        }
      }
    `,
    preloadedData.viewer,
  )
  const queriedTeams = (teams?.edges || []).flatMap(a => (a?.node ? a?.node : []))
  return (
    <ActionList selectionVariant="multiple">
      {queriedTeams.map(team => (
        <TeamCheckbox
          key={team.id}
          teamCheckboxItem={team}
          checked={!!selectedTeams[team.id]}
          onSelect={handleOnSelect}
        />
      ))}
      {queriedTeams.length === 0 && <NoResults />}
      {queriedTeams.length > 0 && (
        // This is a hidden box containing the number of results
        // for screen readers
        <span className="sr-only" aria-atomic="true" id="teamsSearchResultsCount" role="region" aria-live="polite">
          {`${queriedTeams.length} results`}
        </span>
      )}
    </ActionList>
  )
}

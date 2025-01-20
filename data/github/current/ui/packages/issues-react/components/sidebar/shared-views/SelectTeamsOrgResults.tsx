import {NoResults} from '@github-ui/list-view-items-issues-prs/NoResults'
import {ActionList} from '@primer/react'
import {graphql, type PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'

import type {SelectTeamsInOrgQuery} from './__generated__/SelectTeamsInOrgQuery.graphql'
import type {SelectTeamsOrgResults$key} from './__generated__/SelectTeamsOrgResults.graphql'
import {SelectTeamsInOrgGraphqlQuery} from './SelectTeams'
import {TeamCheckbox} from './TeamCheckbox'

type SelectTeamsOrgResultsProps = {
  orgTeamsQueryRef: PreloadedQuery<SelectTeamsInOrgQuery>
  handleOnSelect: (id: string) => void
  selectedTeams: Record<string, boolean>
}

export function SelectTeamsOrgResults({orgTeamsQueryRef, handleOnSelect, selectedTeams}: SelectTeamsOrgResultsProps) {
  const preloadedData = usePreloadedQuery<SelectTeamsInOrgQuery>(SelectTeamsInOrgGraphqlQuery, orgTeamsQueryRef)
  const {data} = usePaginationFragment<SelectTeamsInOrgQuery, SelectTeamsOrgResults$key>(
    graphql`
      fragment SelectTeamsOrgResults on Organization
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 10}
        cursor: {type: "String"}
        teamSearchQuery: {type: "String", defaultValue: ""}
      )
      @refetchable(queryName: "SelectTeamsOrgResultsQuery") {
        teams(first: $count, after: $cursor, query: $teamSearchQuery) @connection(key: "OrganizationQueried_teams") {
          edges {
            node {
              ...TeamCheckboxItem
              id
            }
          }
        }
      }
    `,
    preloadedData.node ? preloadedData.node : null,
  )
  if (!data) return null
  const queriedTeams = (data.teams?.edges || []).flatMap(a => (a?.node ? a?.node : []))
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

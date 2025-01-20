import {Text} from '@primer/react'
import {useEffect} from 'react'
import {useQueryLoader} from 'react-relay'

import {MESSAGES} from '../../../constants/messages'
import type {SelectTeamsForViewerQuery} from './__generated__/SelectTeamsForViewerQuery.graphql'
import type {SelectTeamsInOrgQuery} from './__generated__/SelectTeamsInOrgQuery.graphql'
import {SelectTeamsForViewerGraphqlQuery, SelectTeamsInOrgGraphqlQuery} from './SelectTeams'
import {SelectTeamsOrgResults} from './SelectTeamsOrgResults'
import {SelectTeamsQueryLoading} from './SelectTeamsQueryLoading'
import {SelectTeamsViewerResults} from './SelectTeamsViewerResults'

type SelectTeamsQueryProps = {
  organizationId: string
  teamSearchQuery: string
  handleOnSelect: (id: string) => void
  selectedTeams: Record<string, boolean>
}

export function SelectTeamsQuery({
  organizationId,
  teamSearchQuery,
  handleOnSelect,
  selectedTeams,
}: SelectTeamsQueryProps) {
  const [orgTeamsQueryRef, loadTeams, disposeTeams] =
    useQueryLoader<SelectTeamsInOrgQuery>(SelectTeamsInOrgGraphqlQuery)

  const [viewerTeamsQueryRef, loadViewerTeams, disposeViewerTeams] = useQueryLoader<SelectTeamsForViewerQuery>(
    SelectTeamsForViewerGraphqlQuery,
  )

  const isLoadingViewerTeams = teamSearchQuery === ''

  useEffect(() => {
    if (isLoadingViewerTeams) {
      loadViewerTeams({organizationId}, {fetchPolicy: 'store-or-network'})
      return () => disposeViewerTeams()
    } else {
      loadTeams({organizationId, teamSearchQuery}, {fetchPolicy: 'store-or-network'})
      return () => disposeTeams()
    }
  }, [
    disposeTeams,
    disposeViewerTeams,
    isLoadingViewerTeams,
    loadTeams,
    loadViewerTeams,
    organizationId,
    teamSearchQuery,
  ])

  const queryRef = isLoadingViewerTeams ? viewerTeamsQueryRef : orgTeamsQueryRef
  if (!queryRef) {
    return <SelectTeamsQueryLoading />
  }

  return (
    <>
      {isLoadingViewerTeams
        ? viewerTeamsQueryRef && (
            <>
              <Text
                sx={{
                  fontWeight: 600,
                  fontSize: '14px',
                  paddingLeft: '16px',
                  paddingTop: '8px',
                  display: 'block',
                }}
              >
                {MESSAGES.suggested}
              </Text>
              <SelectTeamsViewerResults
                viewerTeamsQueryRef={viewerTeamsQueryRef}
                handleOnSelect={handleOnSelect}
                selectedTeams={selectedTeams}
              />
            </>
          )
        : orgTeamsQueryRef && (
            <SelectTeamsOrgResults
              orgTeamsQueryRef={orgTeamsQueryRef}
              handleOnSelect={handleOnSelect}
              selectedTeams={selectedTeams}
            />
          )}
    </>
  )
}

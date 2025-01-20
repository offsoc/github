import type {OrganizationPickerOrganization$data as Organization} from '@github-ui/item-picker/OrganizationPickerOrganization.graphql'
import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {SearchIcon} from '@primer/octicons-react'
import {Box, FormControl, TextInput} from '@primer/react'
import {type KeyboardEventHandler, Suspense, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {graphql, type PreloadedQuery, usePaginationFragment} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import {MESSAGES} from '../../../constants/messages'
import {VALUES} from '../../../constants/values'
import {ListError} from '../../list/ListError'
import type {SharedViewTreeList$key} from './__generated__/SharedViewTreeList.graphql'
import SelectTeamsFooter from './SelectTeamsFooter'
import {SelectTeamsQuery} from './SelectTeamsQuery'
import {SelectTeamsQueryLoading} from './SelectTeamsQueryLoading'
import {selectedTeamFragment} from './SharedViewTreeList'
import type {OrganizationPickerQuery} from '@github-ui/item-picker/OrganizationPickerQuery.graphql'
import {OrganizationPicker} from '@github-ui/item-picker/OrganizationPicker'

type SelectTeamsProps = {
  teamData: SharedViewTreeList$key
  organizationQueryRef: PreloadedQuery<OrganizationPickerQuery> | undefined | null
  onCancel: () => void
  onSave: (teamIds: string[], selectedTeamsConnectionId: string) => void
}

export const SelectTeamsInOrgGraphqlQuery = graphql`
  query SelectTeamsInOrgQuery($organizationId: ID!, $teamSearchQuery: String) {
    node(id: $organizationId) {
      ... on Organization {
        # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
        ...SelectTeamsOrgResults @arguments(teamSearchQuery: $teamSearchQuery)
      }
    }
  }
`

export const SelectTeamsForViewerGraphqlQuery = graphql`
  query SelectTeamsForViewerQuery($organizationId: ID!) {
    viewer {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads TODO: fix this
      ...SelectTeamsViewerResults @arguments(organizationId: $organizationId)
    }
  }
`

export const SelectTeams = ({teamData, onCancel, onSave, organizationQueryRef}: SelectTeamsProps): JSX.Element => {
  const initialFocusRef = useRef<HTMLInputElement>(null)
  const [organization, setOrganization] = useState<Organization | undefined>(undefined)
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('')
  const [submittedQuery, setSubmittedQuery] = useState<string>('')

  useEffect(() => {
    initialFocusRef.current?.focus()
  }, [])

  const {
    data: selectedTeamsData,
    hasNext: hasNextSelectedTeams,
    loadNext: loadNextSelectedTeams,
  } = usePaginationFragment(selectedTeamFragment, teamData)

  useEffect(() => {
    if (hasNextSelectedTeams) {
      loadNextSelectedTeams(VALUES.selectedTeamsPageSize)
    }
  }, [hasNextSelectedTeams, loadNextSelectedTeams])

  const {selectedTeams: _selectedTeams, id} = selectedTeamsData
  const userSelectedTeams = useMemo(() => (_selectedTeams?.edges || []).flatMap(a => a?.node || []), [_selectedTeams])
  const selectedTeamsConnectionId = ConnectionHandler.getConnectionID(
    id, // passed as input to the mutation/subscription
    'Viewer_selectedTeams',
  )

  // set all the initial teams to be selected
  const initialSelectedTeams = useMemo(() => {
    const initialSelectedTeamsMemo: Record<string, boolean> = {}

    for (const team of userSelectedTeams) {
      initialSelectedTeamsMemo[team.id] = true
    }
    return initialSelectedTeamsMemo
  }, [userSelectedTeams])

  const [selectedTeams, setSelectedTeams] = useState(initialSelectedTeams)

  useEffect(() => {
    setSelectedTeams(initialSelectedTeams)
  }, [initialSelectedTeams])

  const handleOnSelect = useCallback(
    (teamId: string) => {
      setSelectedTeams({...selectedTeams, [teamId]: !selectedTeams[teamId]})
    },
    [setSelectedTeams, selectedTeams],
  )

  const handleOnSave = useCallback(() => {
    const selectedTeamIds = Object.keys(selectedTeams).filter(teamId => selectedTeams[teamId])
    onSave(selectedTeamIds, selectedTeamsConnectionId)
  }, [onSave, selectedTeams, selectedTeamsConnectionId])

  const handleEnterKeyPress: KeyboardEventHandler = useCallback(
    e => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic -- manual shortcut logic is idiomatic in React
      if (e.key === 'Enter') {
        setSubmittedQuery(teamSearchQuery)
      }
    },
    [teamSearchQuery],
  )

  const numberOfSelectedTeams = useMemo(() => {
    return Object.values(selectedTeams).filter(team => team).length
  }, [selectedTeams])

  return (
    <>
      <Box
        sx={{
          maxHeight: '340px',
          minHeight: '145px',
          overflowY: 'auto',
        }}
      >
        <Box sx={{display: 'flex', gap: 2, p: 3, pb: 0}}>
          {organizationQueryRef && (
            <OrganizationPicker
              organizationQueryRef={organizationQueryRef}
              organization={organization}
              onSelectionChange={orgs => setOrganization(orgs[0])}
            />
          )}
          <FormControl sx={{flexGrow: 1}}>
            <FormControl.Label>{MESSAGES.searchTeamsLabel}</FormControl.Label>
            <TextInput
              block
              leadingVisual={SearchIcon}
              aria-label={MESSAGES.searchTeams}
              ref={initialFocusRef}
              onChange={e => setTeamSearchQuery(e.target.value)}
              onKeyPress={handleEnterKeyPress}
              aria-controls="teamsSearchResultsCount"
              placeholder={MESSAGES.searchTeams}
            />
          </FormControl>
        </Box>
        {organization && (
          <Suspense fallback={<SelectTeamsQueryLoading />}>
            <PreloadedQueryBoundary
              fallback={ListError}
              onRetry={() => {
                loadNextSelectedTeams(VALUES.selectedTeamsPageSize)
              }}
            >
              <SelectTeamsQuery
                organizationId={organization.id}
                teamSearchQuery={submittedQuery}
                handleOnSelect={handleOnSelect}
                selectedTeams={selectedTeams}
              />
            </PreloadedQueryBoundary>
          </Suspense>
        )}
        {!organization && <SelectTeamsQueryLoading />}
      </Box>

      <SelectTeamsFooter
        onCancel={onCancel}
        onSave={handleOnSave}
        leadingText={MESSAGES.nrSelectedTeams(numberOfSelectedTeams)}
      />
    </>
  )
}

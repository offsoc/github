// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box, Button, Text} from '@primer/react'
import {useCallback, useEffect, useMemo} from 'react'
import {usePaginationFragment, useRelayEnvironment} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import type {SharedViewTreeList$key} from './__generated__/SharedViewTreeList.graphql'
import {RemoveTeamRow} from './RemoveTeamRow'
import {selectedTeamFragment} from './SharedViewTreeList'
import {VALUES} from '../../../constants/values'
import {LABELS} from '../../../constants/labels'
import {ERRORS} from '../../../constants/errors'
import {commitUpdateSelectedTeamsMutation} from '../../../mutations/update-selected-teams-mutation'
import {BUTTON_LABELS} from '../../../constants/buttons'

type RemoveTeamsProps = {
  teamData: SharedViewTreeList$key
  openAddDialog: () => void
}

export const RemoveTeams = ({teamData, openAddDialog}: RemoveTeamsProps): JSX.Element => {
  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()

  const {
    data: selectedTeamsData,
    hasNext: hasNextSelectedTeams,
    loadNext: loadNextSelectedTeams,
  } = usePaginationFragment(selectedTeamFragment, teamData)

  useEffect(() => {
    // load all the teams in batches in the background
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

  const removeTeam = useCallback(
    (teamId: string) => {
      const teamIds = userSelectedTeams.map(team => team.id).filter(curId => curId !== teamId)
      commitUpdateSelectedTeamsMutation({
        environment,
        input: {teamIds, selectedTeamsConnectionId},
        onError: () =>
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: ERRORS.couldNotUpdateSelectedTeams,
          }),
      })
    },
    [addToast, environment, selectedTeamsConnectionId, userSelectedTeams],
  )

  return userSelectedTeams.length === 0 ? (
    <div className="blankslate">
      <h3 className="blankslate-heading">{LABELS.views.noTeamsSelectedHeading}</h3>
      <span>{LABELS.views.noTeamsSelectedDescription}</span>
      <Box className="blankslate-action" sx={{display: 'flex', justifyContent: 'center'}}>
        <Button variant="primary" onClick={openAddDialog} sx={{mr: 1}}>
          {BUTTON_LABELS.addANewTeam}
        </Button>
      </Box>
    </div>
  ) : (
    <div>
      <Box
        sx={{
          maxHeight: '340px',
          minHeight: '145px',
          overflowY: 'auto',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Text sx={{color: 'fg.muted', fontSize: 0, fontWeight: 'bold', mb: 1}}>{LABELS.views.selectedTeams}</Text>
          {userSelectedTeams.map(team => (
            <RemoveTeamRow key={team.id} team={team} onRemove={removeTeam} />
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          p: 3,
          gap: 2,
          alignItems: 'center',
          borderTop: '1px solid',
          borderTopColor: 'border.muted',
        }}
      >
        <span>{LABELS.views.addTeamsDesc}</span>
        <Button onClick={openAddDialog}>{BUTTON_LABELS.addANewTeam}</Button>
      </Box>
    </div>
  )
}

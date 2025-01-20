// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {GearIcon} from '@primer/octicons-react'
import {ActionList, Box, Octicon} from '@primer/react'
import {useCallback, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery, useRelayEnvironment} from 'react-relay'

import {ERRORS} from '../../../constants/errors'
import {LABELS} from '../../../constants/labels'
import {commitUpdateSelectedTeamsMutation} from '../../../mutations/update-selected-teams-mutation'
import type {SavedViewsQuery} from '../__generated__/SavedViewsQuery.graphql'
import {SavedViewsGraphqlQuery} from '../SavedViews'
import {RemoveSelectedTeamsDialog} from './RemoveSelectedTeamsDialog'
import {SelectedTeamsDialog} from './SelectedTeamsDialog'

type EditSelectedTeamsProps = {
  shareViewsRef: PreloadedQuery<SavedViewsQuery>
}

export function EditSelectedTeams({shareViewsRef}: EditSelectedTeamsProps) {
  const preloadedData = usePreloadedQuery<SavedViewsQuery>(SavedViewsGraphqlQuery, shareViewsRef)
  const {addToast} = useToastContext()
  const environment = useRelayEnvironment()
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)

  const onSave = useCallback(
    (teamIds: string[], selectedTeamsConnectionId: string) => {
      // important to first close the dialog to prevent rendering none existing teams
      setIsSelectDialogOpen(false)
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
    [addToast, environment],
  )

  if (!preloadedData.viewer.dashboard) return null

  return (
    <>
      <ActionList sx={{mx: -2}}>
        <ActionList.Item onSelect={() => setIsRemoveDialogOpen(true)} id="edit-selected-teams-item">
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center'}}>
            <Octicon icon={GearIcon} />
            {LABELS.views.editSelectedTeams}
          </Box>
        </ActionList.Item>
      </ActionList>
      {isSelectDialogOpen && (
        <SelectedTeamsDialog
          onDismiss={() => setIsSelectDialogOpen(false)}
          teamData={preloadedData.viewer.dashboard}
          onSave={onSave}
        />
      )}
      {isRemoveDialogOpen && (
        <RemoveSelectedTeamsDialog
          teamData={preloadedData.viewer.dashboard}
          onDismiss={() => setIsRemoveDialogOpen(false)}
          openAddDialog={() => {
            setIsRemoveDialogOpen(false)
            setIsSelectDialogOpen(true)
          }}
        />
      )}
    </>
  )
}

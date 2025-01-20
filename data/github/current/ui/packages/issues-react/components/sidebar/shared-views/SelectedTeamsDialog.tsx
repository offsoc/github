import PreloadedQueryBoundary from '@github-ui/relay-preloaded-query-boundary'
import {Portal} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {Suspense, useEffect} from 'react'
import {useQueryLoader} from 'react-relay'

import {LABELS} from '../../../constants/labels'
import {ListError} from '../../list/ListError'
import type {SharedViewTreeList$key} from './__generated__/SharedViewTreeList.graphql'
import {SelectTeams} from './SelectTeams'
import {SelectTeamsLoading} from './SelectTeamsLoading'
import {OrganizationPickerGraphqlQuery} from '@github-ui/item-picker/OrganizationPicker'
import type {OrganizationPickerQuery} from '@github-ui/item-picker/OrganizationPickerQuery.graphql'

type SelectTeamsDialogProps = {
  teamData: SharedViewTreeList$key
  onSave: (teamIds: string[], selectedTeamsConnectionId: string) => void
  onDismiss: () => void
}

const SelectedTeamsDialogBody = ({onDismiss, teamData, onSave}: SelectTeamsDialogProps) => {
  const [organizationQueryRef, loadOrganizations, disposeOrganizations] =
    useQueryLoader<OrganizationPickerQuery>(OrganizationPickerGraphqlQuery)

  useEffect(() => {
    loadOrganizations({}, {fetchPolicy: 'store-or-network'})
    return () => disposeOrganizations()
  }, [disposeOrganizations, loadOrganizations])

  if (!organizationQueryRef) return <SelectTeamsLoading onCancel={onDismiss} />

  return (
    <PreloadedQueryBoundary
      fallback={ListError}
      onRetry={() => {
        loadOrganizations({}, {fetchPolicy: 'store-or-network'})
      }}
    >
      <SelectTeams
        teamData={teamData}
        onCancel={onDismiss}
        onSave={onSave}
        organizationQueryRef={organizationQueryRef}
      />
    </PreloadedQueryBoundary>
  )
}

export const SelectedTeamsDialog = ({onDismiss, teamData, onSave}: SelectTeamsDialogProps): JSX.Element => {
  return (
    <Portal>
      <Dialog
        renderBody={() => (
          <Suspense fallback={<SelectTeamsLoading onCancel={onDismiss} />}>
            <SelectedTeamsDialogBody onDismiss={onDismiss} teamData={teamData} onSave={onSave} />
          </Suspense>
        )}
        onClose={onDismiss}
        title={LABELS.views.manageTeams}
        width="xlarge"
      />
    </Portal>
  )
}

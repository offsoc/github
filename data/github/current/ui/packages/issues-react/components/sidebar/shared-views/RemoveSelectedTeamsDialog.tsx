import {Portal} from '@primer/react'
import {Dialog} from '@primer/react/experimental'

import {LABELS} from '../../../constants/labels'
import type {SharedViewTreeList$key} from './__generated__/SharedViewTreeList.graphql'
import {RemoveTeams} from './RemoveTeams'

type RemoveSelectedTeamsDialogProps = {
  teamData: SharedViewTreeList$key
  openAddDialog: () => void
  onDismiss: () => void
}

export const RemoveSelectedTeamsDialog = ({
  openAddDialog,
  onDismiss,
  teamData,
}: RemoveSelectedTeamsDialogProps): JSX.Element => {
  return (
    <Portal>
      <Dialog
        renderBody={() => <RemoveTeams teamData={teamData} openAddDialog={openAddDialog} />}
        onClose={onDismiss}
        title={LABELS.views.manageTeams}
        width="xlarge"
      />
    </Portal>
  )
}

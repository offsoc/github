import {Box, Text} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {EnterpriseTeamAssignable, EnterpriseTeamAssignables} from '../types'
import {pluralize} from '../../helpers/text'
import {usePreventBodyScroll} from '../hooks/use-prevent-body-scoll'
import {CopilotFlash} from '../../components/CopilotFlash'

function RemovalDialogText(props: {toCancel: EnterpriseTeamAssignables}) {
  const {toCancel} = props

  if (toCancel.length === 1) {
    return (
      <Text as="span" sx={{fontWeight: 600}}>
        {toCancel[0]?.name}
      </Text>
    )
  }

  return (
    <>
      <Text as="span" sx={{fontWeight: 600}}>
        {toCancel.length}
      </Text>{' '}
      teams
    </>
  )
}

type Props = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  toCancel: EnterpriseTeamAssignable | EnterpriseTeamAssignables
  error?: string
}

export function RemoveTeamAssignmentsDialog(props: Props) {
  const {onConfirm, onCancel, isOpen, error, toCancel} = props

  usePreventBodyScroll({isActive: isOpen})

  if (!isOpen) {
    return null
  }

  const pendingCancelled = Array.isArray(toCancel) ? toCancel : [toCancel]
  const dualGrammaticalTeam = pluralize(pendingCancelled.length, 'team', 's', false)

  return (
    <Dialog
      title={`Cancel ${dualGrammaticalTeam} access`}
      renderBody={() => (
        <Box sx={{p: 3}}>
          {error && (
            <CopilotFlash variant="danger" sx={{mb: 2}}>
              {error}
            </CopilotFlash>
          )}
          <p>
            Please confirm you want to remove access for <RemovalDialogText toCancel={pendingCancelled} /> to Copilot
            Business.
          </p>
          <p>
            The seats will be removed and users will lose access to Copilot Business at the end of the billing period.
          </p>
        </Box>
      )}
      onClose={onCancel}
      footerButtons={[
        {content: 'Cancel', onClick: onCancel, sx: {mr: 2}},
        {
          content: `Remove ${dualGrammaticalTeam} access`,
          onClick: onConfirm,
          buttonType: 'danger',
        },
      ]}
    />
  )
}

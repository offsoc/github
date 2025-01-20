import SeatAssignable from '../../traditional/components/SeatAssignable'
import type {EnterpriseTeamSeatAssignment} from '../../types'
import {Box, ActionList, RelativeTime} from '@primer/react'
import {EnterpriseTeamAssignment} from '../helpers/enterprise-team-assignment'
import type {EnterpriseTeamAssignable} from '../types'
import {RowActionsMenu} from './RowActionsMenu'
import type React from 'react'
import {SeatCheckboxControl} from '../../components/table/seat-checkbox-control/SeatCheckboxControl'

function Status(props: {seatAssignment: EnterpriseTeamSeatAssignment}) {
  const {seatAssignment} = props

  let text: React.ReactNode = ''

  if (
    EnterpriseTeamAssignment.isPendingCreation(seatAssignment) ||
    EnterpriseTeamAssignment.isPendingReassignment(seatAssignment)
  ) {
    text = 'Pending assignment'
  } else if (seatAssignment.pending_cancellation_date) {
    text = `Access will be removed on ${EnterpriseTeamAssignment.formattedCancellationDate(seatAssignment)}`
  } else if (EnterpriseTeamAssignment.isPendingUnassignment(seatAssignment)) {
    text = 'Pending unassignment'
  }

  if (!text) {
    text = <LastUsage seatAssignment={seatAssignment} />
  }

  return (
    <Box as="span" className="flex-shrink-0 pr-3" sx={{textAlign: 'center', color: 'fg.muted', fontSize: 12}}>
      {text}
    </Box>
  )
}

function LastUsage(props: {seatAssignment: EnterpriseTeamSeatAssignment}) {
  const {seatAssignment} = props

  return (
    <>
      {seatAssignment.last_activity_at ? (
        <>
          Last active <RelativeTime date={new Date(seatAssignment.last_activity_at)} data-testid="last-usage" />
        </>
      ) : (
        'No activity yet'
      )}
    </>
  )
}

type TableRowProps = {
  checked: boolean
  handleCheck: () => void
  handleCancel: () => void
  handleRestore: (assignment: EnterpriseTeamAssignable) => void
  seatAssignment: EnterpriseTeamSeatAssignment
  owner: string
  withRowActions?: boolean
  disabled?: boolean
  statusInfo?: (props: React.PropsWithChildren<object>) => JSX.Element
}

export function SelectableTableRow(props: TableRowProps) {
  const {checked, handleCheck, seatAssignment, handleCancel, handleRestore, withRowActions = true} = props

  const isDisabled =
    EnterpriseTeamAssignment.isPendingCreation(seatAssignment) ||
    EnterpriseTeamAssignment.isPendingReassignment(seatAssignment) ||
    EnterpriseTeamAssignment.isPendingUnassignment(seatAssignment) ||
    props.disabled

  const showKebabMenu =
    !checked &&
    !EnterpriseTeamAssignment.isPendingCreation(seatAssignment) &&
    !EnterpriseTeamAssignment.isPendingReassignment(seatAssignment) &&
    !EnterpriseTeamAssignment.isPendingUnassignment(seatAssignment) &&
    withRowActions

  const onRestoreAccess = () => {
    const payload = EnterpriseTeamAssignment.toRemotePayload(seatAssignment)
    handleRestore(payload)
  }
  const StatusText = props.statusInfo

  return (
    <Box
      as="li"
      className="d-flex flex-items-center member-list-item border border-top-0"
      sx={{
        backgroundColor: checked ? 'accent.subtle' : 'initial',
        boxShadow: checked ? 'rgb(9, 105, 218) 0px 0px 0px 1px' : 'none',
        ':last-child': {
          borderBottomRightRadius: 2,
          borderBottomLeftRadius: 2,
        },
        '&:hover': {
          backgroundColor: checked ? 'accent.subtle' : 'neutral.subtle',
        },
        px: 3,
        py: 2,
      }}
    >
      <SeatCheckboxControl
        checked={checked}
        onChange={handleCheck}
        selectable={seatAssignment}
        isDisabled={isDisabled}
      />
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <SeatAssignable seat={seatAssignment} owner={props.owner} muteTitle={isDisabled} />
        {StatusText ? (
          <StatusText>{EnterpriseTeamAssignment.isStable(seatAssignment) ? 'Access already granted' : ''} </StatusText>
        ) : (
          <Status seatAssignment={seatAssignment} />
        )}
        <RowActionsMenu isVisible={showKebabMenu} testId={`seat-options-${seatAssignment.assignable.id}`}>
          {EnterpriseTeamAssignment.isPendingCancellation(seatAssignment) ? (
            <ActionList.Item
              aria-checked={false}
              onSelect={() => {
                onRestoreAccess()
              }}
              // there is a random span tag inserted here that breaks formatting
              sx={{whiteSpace: 'nowrap', '> span:first-child': {display: 'none'}}}
            >
              Re-assign team access
            </ActionList.Item>
          ) : (
            <ActionList.Item
              variant="danger"
              onSelect={handleCancel}
              sx={{'> span:first-child': {display: 'none'}}}
              aria-checked={false}
            >
              Cancel team access
            </ActionList.Item>
          )}
        </RowActionsMenu>
      </Box>
    </Box>
  )
}

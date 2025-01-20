import type {EnterpriseTeamSeatAssignment} from '../../types'
import type {EnterpriseTeamAssignable} from '../types'

const formattedCancellationDate = (seatAssignment: EnterpriseTeamSeatAssignment) => {
  if (!seatAssignment.pending_cancellation_date) {
    return ''
  }

  const date = new Date(seatAssignment.pending_cancellation_date)
  const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

  return localDate.toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const isPendingCreation = (assignment: EnterpriseTeamSeatAssignment) =>
  !assignment.id && assignment.status === 'pending_creation'
const isPendingCancellation = (assignment: EnterpriseTeamSeatAssignment) => !!assignment.pending_cancellation_date
const isPendingReassignment = (assignment: EnterpriseTeamSeatAssignment) => assignment.status === 'pending_reassignment'
const isPendingUnassignment = (assignment: EnterpriseTeamSeatAssignment) => assignment.status === 'pending_unassignment'
const isStable = (assignment: EnterpriseTeamSeatAssignment) => assignment.status === 'stable'

// This really shouldnt live here as it is tied to the UI, but I'm not sure where else
// to expose it from.
const isSelectable = (assignment: EnterpriseTeamSeatAssignment) => {
  return (
    !EnterpriseTeamAssignment.isPendingCreation(assignment) &&
    !EnterpriseTeamAssignment.isPendingCancellation(assignment) &&
    !EnterpriseTeamAssignment.isPendingReassignment(assignment) &&
    !EnterpriseTeamAssignment.isPendingUnassignment(assignment)
  )
}

const toRemotePayload = (assignment: EnterpriseTeamSeatAssignment): EnterpriseTeamAssignable => {
  return {
    id: assignment.assignable.id,
    name: assignment.assignable.slug,
    type: assignment.assignable_type,
  }
}

const selectedAssignmentsInjector = <T>(
  selected: string[],
  assignments: EnterpriseTeamSeatAssignment[],
  mapper: (assignment: EnterpriseTeamSeatAssignment, inject: T) => T,
  inject: T,
): T => {
  return selected.reduce((injected, key) => {
    const [_, _id] = key.split('_')
    const id = Number(_id)
    const seatAssignment = assignments.find(assignment => assignment.assignable.id === id)

    if (!seatAssignment) {
      return injected
    }

    return mapper(seatAssignment, injected)
  }, inject)
}

export const EnterpriseTeamAssignment = {
  formattedCancellationDate,
  isPendingCreation,
  isPendingCancellation,
  isPendingReassignment,
  isPendingUnassignment,
  isStable,
  isSelectable,
  toRemotePayload,
  selectedAssignmentsInjector,
}

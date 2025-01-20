import type {EnterpriseTeamSeatAssignment} from '../../types'

export function makeSelectedKey(seatAssignment: EnterpriseTeamSeatAssignment) {
  return `${seatAssignment.assignable_type}_${seatAssignment.assignable.id}`
}

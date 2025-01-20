import {type CopilotSeatAssignment, SeatType} from '../types'

export function anyPendingCancellation(seats: CopilotSeatAssignment[]) {
  return seats.some(seat => seat.pending_cancellation_date)
}

function assignableIsTeamMember(teamSeat: CopilotSeatAssignment, userId: number) {
  if (teamSeat.assignable_type !== SeatType.Team) return false

  return teamSeat.assignable.member_ids?.includes(userId)
}

export function dedupeCancelledTeamSeats(seats: CopilotSeatAssignment[]) {
  const teamSeats = seats.filter(seat => seat.assignable_type === SeatType.Team)
  return seats.reduce((acc, seat) => {
    if (
      seat.assignable_type === SeatType.User &&
      teamSeats.some(teamSeat => assignableIsTeamMember(teamSeat, seat.assignable.id))
    ) {
      return acc
    }

    acc.push(seat)
    return acc
  }, [] as CopilotSeatAssignment[])
}

import type {EnterpriseTeamSeatAssignment, SeatType} from '../types'

export type CopilotStandaloneSeatManagementPayload = {
  business: {
    login: string
    slug: string
  }
  count: number
  filtered_count: number
  total_seats: number
  seatAssignments: EnterpriseTeamSeatAssignment[]
}

export type EnterpriseTeamAssignable = {id: number; type: SeatType; name: string}
export type EnterpriseTeamAssignables = EnterpriseTeamAssignable[]

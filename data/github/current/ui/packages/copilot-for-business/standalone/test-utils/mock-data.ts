import {SeatType, type EnterpriseTeamSeatAssignment} from '../../types'
import type {CopilotStandaloneSeatManagementPayload} from '../types'

export const teamCoconut = (): EnterpriseTeamSeatAssignment => ({
  id: 1,
  assignable_type: SeatType.EnterpriseTeam,
  last_activity_at: '',
  pending_cancellation_date: null,
  status: 'stable',
  assignable: {
    id: 1,
    mapping_id: 1,
    slug: 'team-coconut',
    login: 'team-coconut',
    member_count: 5,
    member_ids: [1, 2, 3, 4, 5],
  },
})

export function getCopilotStandaloneSeatManagementRoutePayload(): CopilotStandaloneSeatManagementPayload {
  return {
    business: {
      slug: 'cool-emu-manager',
      login: 'cool-emu-manager',
    },
    count: 1,
    filtered_count: 1,
    total_seats: 5,
    seatAssignments: [teamCoconut()],
  }
}

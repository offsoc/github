import type {ExternalGroupTeamMismatchWidgetProps, User} from '../ExternalGroupTeamMismatchWidget'

export function makeUser(login = 'user'): User {
  return {
    id: 1,
    login,
    sso_url: 'test sso url',
    avatar_url: 'test avatar url',
  }
}

export function getExternalGroupTeamMismatchWidgetProps(
  groupMembersNotInTeam?: User[],
  teamMembersNotInGroup?: User[],
): ExternalGroupTeamMismatchWidgetProps {
  const user = makeUser()

  const mockMismatch = {
    group_members_not_in_team: groupMembersNotInTeam ?? [user],
    team_members_not_in_group: teamMembersNotInGroup ?? [user],
    group_members_not_in_team_count: groupMembersNotInTeam != null ? groupMembersNotInTeam.length : 1,
    team_members_not_in_group_count: teamMembersNotInGroup != null ? teamMembersNotInGroup.length : 1,
  }

  return {
    mismatches: mockMismatch,
    mismatch_list_cap: 10,
  }
}

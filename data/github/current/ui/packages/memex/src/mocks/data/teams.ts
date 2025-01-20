import {type Collaborator, CollaboratorRole, type ReviewerTeam, type Team} from '../../client/api/common-contracts'
import {not_typesafe_nonNullAssertion} from '../../client/helpers/non-null-assertion'
import {teams} from './users-list'

export const mockTeams: Array<Team> = teams

export const defaultTeamMemberCount = 5

export const DefaultTeam: Collaborator = {
  ...not_typesafe_nonNullAssertion(mockTeams[0]),
  actor_type: 'team',
  role: CollaboratorRole.Reader,
  membersCount: defaultTeamMemberCount,
}

export const getReviewerTeam = (name: string): ReviewerTeam => {
  const team = mockTeams.find(u => u.name === name)
  if (!team) {
    throw Error(`Unable to find team with name ${name} - please check the mock data`)
  }
  return {...team, type: 'Team', name: not_typesafe_nonNullAssertion(team.name), url: `team-url/${team.id}`}
}

import type {EnterpriseTeamProps} from '../EnterpriseTeam'
import type {User} from '../types'

export function getEnterpriseTeamProps({
  readonly = false,
  use_member_organizations_path_for_user_links = true,
}: {
  readonly?: boolean
  use_member_organizations_path_for_user_links?: boolean
} = {}): EnterpriseTeamProps {
  const members: User[] = new Array(20)
    .fill({})
    .map((_, i) => ({login: `user${i}`, id: i, name: `John Doe ${i}`})) as User[]
  ;(members[0] as User).name = null
  return {
    business_slug: 'business-slug',
    enterprise_team: {
      name: 'enterprise-team-name',
      id: 'enterprise-team-id',
      external_group_mapping: false,
      slug: 'enterprise-team-name',
    },
    direct_memberships_enabled: true,
    page_size: 20,
    total_members: 25,
    members,
    member_suggestions_path: '/enterprises/business-slug/enterprise_team_member_suggestions',
    readonly,
    use_member_organizations_path_for_user_links,
  }
}

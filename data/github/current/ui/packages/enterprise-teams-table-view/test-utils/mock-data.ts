import type {EnterpriseTeamsTableViewProps} from '../EnterpriseTeamsTableView'

export function getEnterpriseTeamsTableViewProps({
  readonly = false,
  can_remove_teams = true,
}: {readonly?: boolean; can_remove_teams?: boolean} = {}): EnterpriseTeamsTableViewProps {
  return {
    business_slug: 'business',
    business_name: 'Just Business',
    enterprise_teams: [
      {id: 1, name: 'team-1', members: 0, slug: 'team-slug', external_group_id: 1},
      {id: 2, name: 'team-2', members: 0, slug: 'team-slug2', external_group_id: 2},
    ],
    readonly,
    cannot_create_multiple_teams: false,
    can_remove_teams,
  }
}

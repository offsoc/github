import {ListView} from '@github-ui/list-view'
import type {EnterpriseTeam, User} from './types'
import TeamMemberListItem from './TeamMemberListItem'

type TeamListProps = {
  enterpriseTeam: EnterpriseTeam
  members: User[]
  businessSlug: string
  directMembershipsEnabled: boolean
  removeMember: () => void
  removeMemberPath: string
  hideRemoveMemberButtons?: boolean
  useMemberOrganizationsPathForUserLinks?: boolean
}

const TeamList = ({
  enterpriseTeam,
  members,
  businessSlug,
  directMembershipsEnabled,
  removeMember,
  removeMemberPath,
  hideRemoveMemberButtons = false,
  useMemberOrganizationsPathForUserLinks = true,
}: TeamListProps) => (
  // eslint-disable-next-line github/a11y-role-supports-aria-props
  <div aria-labelledby="enterprise-team-list-container">
    <ListView aria-labelledby="enterprise-team-list" title={enterpriseTeam.name}>
      {members.map((member: User) => (
        <TeamMemberListItem
          aria-labelledby={member.id}
          key={member.id}
          teamName={enterpriseTeam.name}
          member={member}
          businessSlug={businessSlug}
          removeMemberPath={removeMemberPath}
          directMembershipsEnabled={directMembershipsEnabled}
          removeMember={removeMember}
          hideRemoveMemberButton={hideRemoveMemberButtons}
          useMemberOrganizationsPathForUserLink={useMemberOrganizationsPathForUserLinks}
        />
      ))}
    </ListView>
  </div>
)

export default TeamList

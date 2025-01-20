import {useState} from 'react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ActionList, Box, Button, Dialog, Heading} from '@primer/react'

export interface User {
  id: number
  login: string
  sso_url: string
  avatar_url: string
}

interface Mismatch {
  group_members_not_in_team: User[]
  team_members_not_in_group: User[]
  group_members_not_in_team_count: number
  team_members_not_in_group_count: number
}

export interface ExternalGroupTeamMismatchWidgetProps {
  mismatches: Mismatch
  mismatch_list_cap: number
}

const pluralizeMember = (count: number) => {
  const member = 'member'

  if (count === 1) {
    return member
  }

  return `${member}s`
}

export function ExternalGroupTeamMismatchWidget({mismatches, mismatch_list_cap}: ExternalGroupTeamMismatchWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="danger">
        View Sync Mismatches
      </Button>
      <Dialog
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
        aria-labelledby="external-group-team-mismatches"
        data-testid="external-group-team-mismatches-dialog"
        sx={{overflow: 'auto'}}
        wide={true}
      >
        <Dialog.Header id="external-group-team-mismatches">External Group Team Mismatches</Dialog.Header>
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', margin: 2}}>
          <MismatchBox
            heading={`${mismatches.group_members_not_in_team_count} group ${pluralizeMember(
              mismatches.group_members_not_in_team_count,
            )} not in team`}
            mismatches={mismatches.group_members_not_in_team}
            mismatchesCount={mismatches.group_members_not_in_team_count}
            mismatchListCap={mismatch_list_cap}
          />
          <MismatchBox
            heading={`${mismatches.team_members_not_in_group_count} team ${pluralizeMember(
              mismatches.team_members_not_in_group_count,
            )} not in group`}
            mismatches={mismatches.team_members_not_in_group}
            mismatchesCount={mismatches.team_members_not_in_group_count}
            mismatchListCap={mismatch_list_cap}
          />
        </Box>
      </Dialog>
    </>
  )
}

function MismatchList({
  mismatches,
  mismatchesCount,
  mismatchListCap,
}: {
  mismatches: User[]
  mismatchesCount: number
  mismatchListCap: number
}) {
  return (
    <ActionList>
      {mismatches.slice(0, mismatchListCap).map(user => (
        <ActionList.LinkItem key={user.login} href={user.sso_url} data-testid={`mismatched-user-${user.login}`}>
          <ActionList.LeadingVisual>
            <GitHubAvatar
              src={user.avatar_url}
              size={20}
              alt={`@${user.login}`}
              key={user.id}
              sx={{boxShadow: '0 0 0 2px var(--bgColor-muted, var(--color-canvas-subtle))'}}
            />
          </ActionList.LeadingVisual>
          {user.login}
        </ActionList.LinkItem>
      ))}
      {mismatchesCount > mismatchListCap && (
        <ActionList.Item data-testid="overflow-mismatch-item">Showing first 10 members...</ActionList.Item>
      )}
    </ActionList>
  )
}

function MismatchBox({
  heading,
  mismatches,
  mismatchesCount,
  mismatchListCap,
}: {
  heading: string
  mismatches: User[]
  mismatchesCount: number
  mismatchListCap: number
}) {
  if (mismatches.length === 0) {
    return null
  }

  return (
    <div>
      <Heading as="h4" sx={{fontSize: 1}}>
        {heading}
      </Heading>
      <MismatchList mismatches={mismatches} mismatchesCount={mismatchesCount} mismatchListCap={mismatchListCap} />
    </div>
  )
}

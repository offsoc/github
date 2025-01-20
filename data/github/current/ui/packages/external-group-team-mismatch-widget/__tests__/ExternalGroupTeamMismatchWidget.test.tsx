import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ExternalGroupTeamMismatchWidget} from '../ExternalGroupTeamMismatchWidget'
import {getExternalGroupTeamMismatchWidgetProps, makeUser} from '../test-utils/mock-data'

test('Renders mismatch button', () => {
  const props = getExternalGroupTeamMismatchWidgetProps()
  render(<ExternalGroupTeamMismatchWidget {...props} />)
  expect(screen.getByRole('button')).toHaveTextContent('View Sync Mismatches')
})

test('Dialog is not rendered by default', () => {
  const props = getExternalGroupTeamMismatchWidgetProps()
  render(<ExternalGroupTeamMismatchWidget {...props} />)
  expect(screen.queryByTestId('external-group-team-mismatches-dialog')).not.toBeInTheDocument()
})

test('Dialog is rendered when clicked', async () => {
  const props = getExternalGroupTeamMismatchWidgetProps()
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)
  expect(screen.getByTestId('external-group-team-mismatches-dialog')).toBeVisible()
})

test('Dialog has two mismatch columns', async () => {
  const props = getExternalGroupTeamMismatchWidgetProps()
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)
  expect(screen.getByText('1 group member not in team')).toBeVisible()
  expect(screen.getByText('1 team member not in group')).toBeVisible()
})

test('Does not render group member column if all group members are in team', async () => {
  const props = getExternalGroupTeamMismatchWidgetProps([])
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)
  expect(props.mismatches.group_members_not_in_team).toHaveLength(0)
  expect(screen.queryByText('0 group members not in team')).not.toBeInTheDocument()
  expect(screen.getByText('1 team member not in group')).toBeVisible()
})

test('Does not render team member column if all team members are in group', async () => {
  const props = getExternalGroupTeamMismatchWidgetProps(undefined, [])
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)
  expect(screen.getByText('1 group member not in team')).toBeVisible()
  expect(props.mismatches.team_members_not_in_group).toHaveLength(0)
  expect(screen.queryByText('0 team members not in group')).not.toBeInTheDocument()
})

test('Dialog pluralizes mismatch columns correctly', async () => {
  const missingGroupMembersCount = 2
  const groupMembers = Array.from({length: missingGroupMembersCount}, (_, i) => makeUser(`group-member-${i}`))
  const props = getExternalGroupTeamMismatchWidgetProps(groupMembers)
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)
  expect(
    screen.getByText(`${props.mismatches.group_members_not_in_team_count} group members not in team`),
  ).toBeVisible()
  expect(screen.getByText('1 team member not in group')).toBeVisible()
})

test('Dialog lists group members not in team', async () => {
  const groupMemberNotInTeam = makeUser('missing-team-member_test')
  const teamMemberNotInGroup = makeUser('missing-group-member_test')
  const props = getExternalGroupTeamMismatchWidgetProps([groupMemberNotInTeam], [teamMemberNotInGroup])

  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)

  const missingTeamMemberAnchor = screen.getByText('missing-team-member_test')
  const missingGroupMemberAnchor = screen.getByText('missing-group-member_test')

  expect(missingTeamMemberAnchor).toBeVisible()
  expect(missingGroupMemberAnchor).toBeVisible()
})

test('Caps how many group members show up in each column of the modal', async () => {
  const missingGroupMembersCount = 999
  const groupMembers = Array.from({length: missingGroupMembersCount}, (_, i) => makeUser(`group-member-${i}`))
  const props = getExternalGroupTeamMismatchWidgetProps(groupMembers)
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)

  for (const member of groupMembers.slice(0, 10)) {
    expect(screen.getByTestId(`mismatched-user-${member.login}`)).toBeVisible()
  }

  for (const member of groupMembers.slice(10)) {
    expect(screen.queryByTestId(`mismatched-user-${member.login}`)).not.toBeInTheDocument()
  }
})

test('Adds a line stating that members have been capped due to size', async () => {
  const missingGroupMembersCount = 999
  const groupMembers = Array.from({length: missingGroupMembersCount}, (_, i) => makeUser(`group-member-${i}`))
  const props = getExternalGroupTeamMismatchWidgetProps(groupMembers)
  const {user} = render(<ExternalGroupTeamMismatchWidget {...props} />)
  const button = screen.getByText('View Sync Mismatches')
  await user.click(button)

  expect(screen.getByTestId('overflow-mismatch-item')).toBeVisible()
})

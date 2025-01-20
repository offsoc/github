import {useCallback, useState} from 'react'
import {Box, Button, Flash, Octicon, Link, Text} from '@primer/react'
import type {CSVUploadPayload, CheckboxTypes, CopilotLicenseIdentifiers, SeatAssignable} from '../../types'
import {SeatType} from '../../types'
import {AssignablesTable} from './Ui'
import {id} from '../../helpers/id'
import SeatAssignableListItem from './SeatAssignableListItem'
import {AlertIcon, StopIcon, UploadIcon} from '@primer/octicons-react'
import {useCsvUpload} from '../hooks/use-csv-upload'
import {pluralize} from '../../helpers/text'
import {SeatCheckboxControl} from '../../components/table/seat-checkbox-control/SeatCheckboxControl'
import {CopilotFlash} from '../../components/CopilotFlash'

const assignableHasLicense = (assignable: SeatAssignable, licenses: CopilotLicenseIdentifiers) => {
  const {user_ids, team_ids, invite_emails, invite_user_ids} = licenses
  switch (assignable.type) {
    case SeatType.User:
      return user_ids.includes(assignable.id)
    case SeatType.Team:
      return team_ids.includes(assignable.id)
    case SeatType.OrganizationInvitation:
      return invite_emails.includes(assignable.display_login) || invite_user_ids.includes(assignable.id || -1)
    default:
      return false
  }
}

interface SelectedSeat {
  name: string
  member_ids?: number[]
}
type SelectedState = {
  Team: SelectedSeat[]
  User: SelectedSeat[]
  OrganizationInvitation: SelectedSeat[]
}
export interface AddCsvMembersProps {
  organization: string
  licenses: CopilotLicenseIdentifiers
  selected: SelectedState
  setSelected: (data: SelectedState) => void
  selectionError: string
  setSelectionError: (selectionError: string) => void
}

export function AddCsvMembers(props: AddCsvMembersProps) {
  const {organization, licenses, selected, setSelected, selectionError, setSelectionError} = props
  const [csvData, setCsvData] = useState<CSVUploadPayload | undefined>(undefined)
  const [csvUsers, setCsvUsers] = useState<SeatAssignable[]>([])

  const handleCsvUpload = useCallback(
    (payload: CSVUploadPayload) => {
      let newCsvUsers = [] as SeatAssignable[]
      setCsvData(payload)
      // Reset selected state so that previously selected users are deselected
      const update = {
        Team: [] as SelectedSeat[],
        User: [] as SelectedSeat[],
        OrganizationInvitation: [] as SelectedSeat[],
      }
      payload?.github_users.map(user => {
        const name = user.display_login
        const type = SeatType.User
        const member = {
          org_member: !user.is_new_user,
          profile_name: user.profile_name,
          type: SeatType.User,
          id: user.id,
          display_login: user.display_login,
          avatar_url: user.avatar,
        } as SeatAssignable
        newCsvUsers = newCsvUsers.concat(member)

        if (!assignableHasLicense(member, licenses)) {
          update[type].push({name, member_ids: [user.id]})
        }
        setSelected(update)
      })

      payload?.email_users.map(user => {
        const name = user
        const type = SeatType.User
        const member = {
          org_member: false,
          type: SeatType.OrganizationInvitation,
          display_login: user,
        } as SeatAssignable
        newCsvUsers = newCsvUsers.concat(member)

        if (!assignableHasLicense(member, licenses)) {
          update[type].push({
            name,
          })
        }
        setSelected(update)
      })
      setCsvUsers(newCsvUsers)
    },
    [setSelected, licenses],
  )

  const csvUploadUtil = useCsvUpload(organization, handleCsvUpload)

  function handleSetCheckbox(member: SeatAssignable) {
    const name = member.type === SeatType.Team ? member.name : member.display_login
    const type = SeatType.User

    if (!name) {
      return
    }

    const updated = selected[type]
    const index = selected[type].findIndex(seat => seat.name === name)

    if (index > -1) updated.splice(index, 1)
    else updated.push({name})

    setSelectionError('')
    setSelected({
      ...selected,
      [type]: updated,
    })
  }

  function normalizeCheckboxType(type: CheckboxTypes) {
    return type === SeatType.OrganizationInvitation ? SeatType.User : type
  }

  const errorBox = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--stack-padding-condensed)',
      }}
    >
      <Octicon icon={AlertIcon} size={16} sx={{color: 'danger.fg'}} />
      <Text sx={{fontWeight: 'bold'}}>We couldn’t upload members.</Text>
      <Text sx={{color: 'fg.muted'}}>Please try uploading a different file.</Text>
    </Box>
  )

  let noValidUsers: boolean | undefined = undefined
  let validUsers: boolean | undefined = undefined
  let errors: boolean | undefined = undefined

  if (csvData) {
    noValidUsers = csvData.github_users.length === 0 && csvData.email_users.length === 0
    validUsers = csvData.github_users.length > 0 || csvData.email_users.length > 0
    errors = csvData.found_errors.length > 0
  }

  let emptyState: React.ReactNode | undefined =
    csvData === undefined ? (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'border.default',
            borderTop: 0,
            borderRadius: '0 0 6px 6px',
            p: 4,
            width: '100%',
          }}
        >
          <Text as="h3" sx={{fontSize: 1, fontWeight: 'normal'}}>
            No file selected
          </Text>
        </Box>
      </>
    ) : undefined
  if (csvData && noValidUsers) {
    emptyState = errorBox
  }

  return (
    <Box
      as="section"
      sx={{
        padding: 3,
        overflowX: 'auto',
        maxHeight: 360,
      }}
      data-testid="upload-csv-form"
    >
      <CopilotFlash sx={{marginTop: 2, marginBottom: 2}} variant="warning">
        {selectionError}
      </CopilotFlash>
      <span>
        Add users and teams in bulk by uploading a CSV file. Users that have been invited and have a seat assigned
        previously will be ignored.{' '}
        <Link
          href="https://docs.github.com/enterprise-cloud@latest/copilot/configuring-github-copilot/configuring-github-copilot-settings-in-your-organization#enabling-access-to-github-copilot-for-specific-users-in-your-organization"
          inline={true}
        >
          {' '}
          How should I format my CSV?
        </Link>
      </span>
      <Button
        leadingVisual={UploadIcon}
        onClick={csvUploadUtil.handleUploadIntent}
        disabled={csvUploadUtil.isUploading}
        data-testid="upload-csv-button"
        sx={{mt: 3}}
      >
        Choose CSV to upload
      </Button>
      <input
        hidden
        ref={csvUploadUtil.inputRef}
        type="file"
        accept="text/csv"
        data-testid="upload-csv-input"
        onChange={e => csvUploadUtil.handleUpload(e.target.files)}
      />
      {csvData && validUsers && errors && (
        <Flash variant="danger" className="mb-3 mt-3">
          {' '}
          <Octicon icon={StopIcon} />
          {pluralize(csvData.found_errors.length, 'error', 's')} found in the CSV file
        </Flash>
      )}
      <AssignablesTable content="Members who will be granted access" emptyState={emptyState}>
        {csvUsers &&
          csvUsers.map((member, index) => {
            const name = member.type === SeatType.Team ? member.name : member.display_login
            const memberId = id(member)
            const hasLicense = assignableHasLicense(member, licenses)
            const checked = selected[normalizeCheckboxType(member.type)].some(seat => seat.name === name)
            return (
              <AssignablesTable.ListItem id={memberId} selected={false} key={memberId}>
                <SeatCheckboxControl
                  selectable={member}
                  checked={checked}
                  isDisabled={hasLicense}
                  onChange={() => handleSetCheckbox(member)}
                  testId={memberId}
                  label={`Grant access to ${name}`}
                />
                <SeatAssignableListItem
                  owner={props.organization}
                  member={member}
                  key={index}
                  hasLicense={hasLicense}
                />
              </AssignablesTable.ListItem>
            )
          })}
      </AssignablesTable>
    </Box>
  )
}

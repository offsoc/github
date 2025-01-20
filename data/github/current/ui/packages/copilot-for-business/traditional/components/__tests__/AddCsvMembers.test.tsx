import {fireEvent, screen, waitFor} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'
import {AddCsvMembers, type AddCsvMembersProps} from '../AddCsvMembers'
import type {CopilotLicenseIdentifiers} from '../../../types'

interface TestSelectedSeat {
  name: string
  member_ids?: number[]
}

/** Default params */
function getSelected() {
  return {
    Team: [] as TestSelectedSeat[],
    User: [] as TestSelectedSeat[],
    OrganizationInvitation: [] as TestSelectedSeat[],
  }
}

let selected = getSelected()
const setSelected = jest.fn(
  (data: {Team: TestSelectedSeat[]; User: TestSelectedSeat[]; OrganizationInvitation: TestSelectedSeat[]}) => {
    selected = data
  },
)

const selectionError = 'Please select at least one user or team.'
const setSelectionError = jest.fn(() => {})

const organization = 'blorg'
const licenses: CopilotLicenseIdentifiers = {
  user_ids: [],
  team_ids: [],
  invite_emails: [],
  invite_user_ids: [],
}

const defaultParams = {
  organization,
  licenses,
  selected,
  setSelected,
  selectionError,
  setSelectionError,
}

/** Render default AddCsvMembers component */
const renderAddMembers = (params: AddCsvMembersProps = defaultParams) => render(<AddCsvMembers {...params} />)

/** Mock user data */
const githubUser = {
  id: 1,
  email: 'github_user@github.com',
  display_login: 'github_user',
  profile_name: null,
  avatar: 'http://alambic.github.localhost/avatars/u/1?s=50',
  is_new_user: true,
}

const orgUser = {
  id: 2,
  email: 'orguser@github.com',
  display_login: 'org_user',
  profile_name: null,
  avatar: 'http://alambic.github.localhost/avatars/u/1?s=50',
  is_new_user: false,
}

const email_users = ['test@test.com', 'beep@example.com']

/** Tests */
beforeEach(() => {
  jest.clearAllMocks()
  selected = getSelected()
})

describe('<AddCsvMembers />', () => {
  describe('when we upload CSVs', () => {
    beforeEach(() => {
      mockFetch.mockRouteOnce('/organizations/blorg/settings/copilot/confirm_add_users_csv', {
        users: {
          found_errors: [],
          new_users: 1,
          email_users,
          github_users: [githubUser, orgUser],
          total_users: 2,
        },
      })
    })

    test('render all users from CSV', async () => {
      renderAddMembers()

      const uploadButton = await screen.findByTestId('upload-csv-button')
      expect(uploadButton).toBeInTheDocument()
      const fileInput: HTMLInputElement = await screen.findByTestId('upload-csv-input')
      const file = new File([''], 'test.csv', {type: 'text/csv'})
      fireEvent.change(fileInput, {target: {files: [file]}})

      await waitFor(async () => {
        await screen.findByTestId(`assignable-list-item-User-${githubUser.id}`)
      })

      const user = await screen.findByTestId(`assignable-list-item-User-${githubUser.id}`)
      expect(user).toBeInTheDocument()
      const user2 = await screen.findByTestId(`assignable-list-item-User-${orgUser.id}`)
      expect(user2).toBeInTheDocument()
      const orgInvitation = await screen.findByTestId(`assignable-list-item-OrganizationInvitation-${email_users[0]}`)
      expect(orgInvitation).toBeInTheDocument()
      const orgInvitation2 = await screen.findByTestId(`assignable-list-item-OrganizationInvitation-${email_users[1]}`)
      expect(orgInvitation2).toBeInTheDocument()
    })

    test('selected state includes name and member ids', async () => {
      renderAddMembers()

      const fileInput: HTMLInputElement = await screen.findByTestId('upload-csv-input')
      const file = new File([''], 'test.csv', {type: 'text/csv'})
      fireEvent.change(fileInput, {target: {files: [file]}})

      await waitFor(async () => {
        await screen.findByTestId('assignable-list-item-User-1')
      })

      await waitFor(async () => {
        expect(selected['User']).toEqual([
          {name: githubUser.display_login, member_ids: [githubUser.id]},
          {name: orgUser.display_login, member_ids: [orgUser.id]},
          {name: email_users[0]},
          {name: email_users[1]},
        ])
      })
    })

    test('members who already have a license are disabled', async () => {
      renderAddMembers({
        ...defaultParams,
        licenses: {
          user_ids: [orgUser.id],
          team_ids: [],
          invite_emails: [],
          invite_user_ids: [],
        },
      })

      const fileInput: HTMLInputElement = await screen.findByTestId('upload-csv-input')
      const file = new File([''], 'test.csv', {type: 'text/csv'})
      fireEvent.change(fileInput, {target: {files: [file]}})

      await waitFor(async () => {
        await screen.findByTestId(`assignable-list-item-User-${orgUser.id}`)
      })

      const user = await screen.findByTestId(`assignable-list-item-User-${orgUser.id}`)
      expect(user).toBeInTheDocument()
      expect(user).toHaveTextContent('Access already granted')
    })
  })
})

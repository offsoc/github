import {screen, fireEvent, act} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EnterpriseTeam} from '../EnterpriseTeam'
import {getEnterpriseTeamProps} from '../test-utils/mock-data'
import {verifiedFetch, verifiedFetchJSON} from '@github-ui/verified-fetch'

jest.useFakeTimers()
jest.setTimeout(10_000)

const mockVerifiedFetch = verifiedFetch as jest.Mock
const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: jest.fn(),
  verifiedFetchJSON: jest.fn(),
}))

const resetUrlSearchParams = () => {
  window.history.replaceState({...window.history.state}, '', '?')
}

test('it renders the enterprise team', () => {
  const props = getEnterpriseTeamProps()
  render(<EnterpriseTeam {...props} />)
  expect(screen.getByText(props.enterprise_team.name)).toBeInTheDocument()

  // Check logic to render user name vs profile name when the user has a profile name
  expect(screen.getByTestId('user-link-user0')).toHaveTextContent('user0')
  expect(screen.queryByTestId('user-name-second-line-user0')).not.toBeInTheDocument()
  for (let i = 1; i < 20; i++) {
    expect(screen.getByTestId(`user-link-user${i}`)).toHaveTextContent(`John Doe ${i}`)
    expect(screen.getByTestId(`user-name-second-line-user${i}`)).toHaveTextContent(`user${i}`)
  }
})

describe('member URLs', () => {
  test('it uses the member organizations path for user links when the feature flag is enabled', () => {
    const props = getEnterpriseTeamProps({use_member_organizations_path_for_user_links: true})
    render(<EnterpriseTeam {...props} />)
    expect(screen.getByTestId('user-link-user0')).toHaveAttribute(
      'href',
      `/enterprises/${props.business_slug}/people/user0/organizations`,
    )
  })

  test('it uses the member path for user links when the feature flag is disabled', () => {
    const props = getEnterpriseTeamProps({use_member_organizations_path_for_user_links: false})
    render(<EnterpriseTeam {...props} />)
    expect(screen.getByTestId('user-link-user0')).toHaveAttribute('href', '/user0')
  })
})

describe('pagination', () => {
  test('it does not render when there is a single page', () => {
    const props = getEnterpriseTeamProps()
    props.members = [props.members[0]!]
    props.total_members = 1
    render(<EnterpriseTeam {...props} />)
    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  test('it renders when there are multiple pages', () => {
    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  test('queries with the right data and updates the list contents', async () => {
    resetUrlSearchParams()
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => {
        return {
          members: [
            {
              id: 10,
              name: 'new_user',
              login: 'new_user',
            },
          ],
          total_members: 2,
        }
      },
    })

    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)

    const nextPageLink = screen.getByText('Next', {selector: 'a'})
    fireEvent.click(nextPageLink)

    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/business-slug/teams/enterprise-team-name/members?page=2`,
        {
          method: 'GET',
          headers: {Accept: 'application/json'},
        },
      )
    })

    expect(screen.getByTestId('new_user')).toBeInTheDocument()
  })
})

describe('search', () => {
  test('queries with the right data and updates the list contents', async () => {
    resetUrlSearchParams()
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => {
        return {
          members: [
            {
              id: 10,
              name: 'mona',
              login: 'mona',
            },
          ],
          total_members: 2,
        }
      },
    })

    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)

    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, {target: {value: 'mona'}})

    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/business-slug/teams/enterprise-team-name/members?query=mona&page=1`,
        {
          method: 'GET',
          headers: {Accept: 'application/json'},
        },
      )
    })

    expect(screen.getByTestId('mona')).toBeInTheDocument()
  })

  test('it resets page number to 1 when searching', async () => {
    resetUrlSearchParams()
    mockVerifiedFetchJSON
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            members: [
              {
                id: 10,
                name: 'new_user',
                login: 'new_user',
              },
            ],
            total_members: 2,
          }
        },
      })
      .mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            members: [
              {
                id: 9,
                name: 'old_user',
                login: 'old_user',
              },
            ],
            total_members: 2,
          }
        },
      })

    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)

    const nextPageLink = screen.getByText('Next', {selector: 'a'})
    fireEvent.click(nextPageLink)

    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/business-slug/teams/enterprise-team-name/members?page=2`,
        {
          method: 'GET',
          headers: {Accept: 'application/json'},
        },
      )
    })

    expect(screen.getByTestId('new_user')).toBeInTheDocument()

    // Test that search resets page to 1
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, {target: {value: 'old'}})
    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/business-slug/teams/enterprise-team-name/members?page=1&query=old`,
        {
          method: 'GET',
          headers: {Accept: 'application/json'},
        },
      )
    })

    expect(screen.getByTestId('old_user')).toBeInTheDocument()
  })
})

describe('add a member', () => {
  test('it does not render the add member button for the readonly view', () => {
    render(<EnterpriseTeam {...getEnterpriseTeamProps({readonly: true})} />)
    expect(screen.queryByRole('button', {name: 'Add a member'})).not.toBeInTheDocument()
  })

  test('it adds a member when the server has no error', async () => {
    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)
    mockVerifiedFetch.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => {
        return {
          data: {},
        }
      },
    })
    mockVerifiedFetchJSON
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            enterprise_members: [
              {
                id: 21,
                name: 'John Doe 21',
                login: 'user21',
              },
            ],
          }
        },
      })
      .mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            members: [
              {
                id: 21,
                name: 'John Doe 21',
                login: 'user21',
              },
            ],
            total_members: 21,
          }
        },
      })

    // Check presence of the add member button
    const addMemberButton = screen.getByRole('button', {name: 'Add a member'})
    expect(addMemberButton).toBeVisible()

    // Check the add member dialog is not there yet
    let addMemberDialog = screen.queryByRole('dialog', {name: 'Add Member to team'})
    expect(addMemberDialog).not.toBeInTheDocument()

    // Click on the add member button
    fireEvent.click(addMemberButton)

    // Check presence of the add member dialog
    addMemberDialog = screen.getByRole('dialog', {name: 'Add Member to team'})
    expect(addMemberDialog).toBeVisible()

    // Check presence of the add member dialog header
    const addMemberDialogHeader = screen.getByText('Add member to enterprise-team-name')
    expect(addMemberDialogHeader).toBeVisible()

    // Check presence of the search input
    const searchInput = screen.getByRole('textbox', {name: 'Search by username or full name'})
    expect(searchInput).toBeVisible()
    expect(searchInput).toHaveValue('')

    // Check presence of the close button
    const cancelButton = screen.getByRole('button', {name: 'Close'})
    expect(cancelButton).toBeVisible()

    // Check presence of the add button
    const addButton = screen.getByRole('button', {name: 'Add'})
    expect(addButton).toBeVisible()
    expect(addButton).toBeDisabled()

    // Fill username prefix and expect search result
    fireEvent.change(searchInput, {target: {value: 'user'}})
    expect(searchInput).toHaveValue('user')

    // Wait for suggestion call
    await act(() => {
      jest.runOnlyPendingTimers()
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        '/enterprises/business-slug/enterprise_team_member_suggestions?query=user',
        {
          method: 'GET',
          headers: {Accept: 'application/json'},
        },
      )
    })

    // Check suggestion result
    const searchResult = screen.getByTestId('member-suggestion-result')
    expect(searchResult).toBeVisible()

    // Click on search result
    fireEvent.click(searchResult)
    expect(searchInput).toHaveValue('user21')
    expect(addButton).toBeEnabled()

    // Click add button
    fireEvent.click(addButton)

    // Check call
    const expectedFormData = new FormData()
    expectedFormData.append('user_login', 'user21')
    await act(() => {
      expect(mockVerifiedFetch).toHaveBeenCalledWith(`/enterprises/business-slug/teams/enterprise-team-name/members`, {
        method: 'POST',
        body: expectedFormData,
        headers: {Accept: 'application/json'},
      })
    })

    // The dialog is closed
    expect(addMemberDialog).not.toBeInTheDocument()
  })

  test('it shows an error message if the server failed to add the member', async () => {
    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)
    mockVerifiedFetch.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => {
        return {
          data: {
            error: 'A server error occurred!',
          },
        }
      },
    })
    mockVerifiedFetchJSON.mockResolvedValue({
      ok: true,
      statusText: 'OK',
      json: async () => {
        return {
          enterprise_members: [
            {
              id: 21,
              name: 'John Doe 21',
              login: 'user21',
            },
          ],
        }
      },
    })

    // Check presence of the add member button
    const addMemberButton = screen.getByRole('button', {name: 'Add a member'})
    expect(addMemberButton).toBeVisible()

    // Click on the add member button
    fireEvent.click(addMemberButton)

    // Check presence of the add member dialog
    let addMemberDialog = screen.getByRole('dialog', {name: 'Add Member to team'})
    expect(addMemberDialog).toBeVisible()

    // Check presence of the search input
    const searchInput = screen.getByRole('textbox', {name: 'Search by username or full name'})
    expect(searchInput).toBeVisible()
    expect(searchInput).toHaveValue('')

    // Check presence of the close button
    const cancelButton = screen.getByRole('button', {name: 'Close'})
    expect(cancelButton).toBeVisible()

    // Check presence of the add button
    const addButton = screen.getByRole('button', {name: 'Add'})
    expect(addButton).toBeVisible()
    expect(addButton).toBeDisabled()

    // Fill username prefix and expect search result
    fireEvent.change(searchInput, {target: {value: 'user'}})
    expect(searchInput).toHaveValue('user')

    // Wait for suggestion call
    await act(() => {
      jest.runOnlyPendingTimers()
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        '/enterprises/business-slug/enterprise_team_member_suggestions?query=user',
        {
          method: 'GET',
          headers: {Accept: 'application/json'},
        },
      )
    })

    // Check suggestion result
    const searchResult = screen.getByTestId('member-suggestion-result')
    expect(searchResult).toBeVisible()

    // Click on search result
    fireEvent.click(searchResult)
    expect(searchInput).toHaveValue('user21')
    expect(addButton).toBeEnabled()

    // Click on add
    fireEvent.click(addButton)

    // Check call
    const expectedFormData = new FormData()
    expectedFormData.append('user_login', 'user21')
    await act(() => {
      expect(mockVerifiedFetch).toHaveBeenCalledWith(`/enterprises/business-slug/teams/enterprise-team-name/members`, {
        method: 'POST',
        body: expectedFormData,
        headers: {Accept: 'application/json'},
      })
    })

    // The dialog is not closed
    expect(addMemberDialog).toBeVisible()

    // Instead we have an error message
    expect(screen.queryByText('A server error occurred!')).toBeVisible()

    // Close dialog and reopen it
    fireEvent.click(cancelButton)
    expect(addMemberDialog).not.toBeInTheDocument()
    fireEvent.click(addMemberButton)
    addMemberDialog = screen.getByRole('dialog', {name: 'Add Member to team'})
    expect(addMemberDialog).toBeVisible()

    // Check state reset
    expect(screen.queryByText('A server error occurred!')).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Add'})).toBeDisabled()
    expect(screen.getByRole('textbox', {name: 'Search by username or full name'})).toHaveValue('')
  })
})

describe('remove a member', () => {
  test('it does not render the remove button for the readonly view', () => {
    render(<EnterpriseTeam {...getEnterpriseTeamProps({readonly: true})} />)
    expect(screen.queryByRole('button', {name: /View actions for user\d/})).not.toBeInTheDocument()
  })

  test('it removes a member when the server has no error', async () => {
    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)
    mockVerifiedFetchJSON
      .mockResolvedValueOnce({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            data: {},
          }
        },
      })
      .mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            members: [
              {
                id: 21,
                name: 'John Doe 21',
                login: 'user21',
              },
            ],
            total_members: 21,
          }
        },
      })

    // Check presence of the kebab menu for the user, we query aria-label
    const menu = screen.getByRole('button', {name: 'View actions for user1'})
    expect(menu).toBeVisible()

    // The remove action is not visible yet
    let deleteMenuItem = screen.queryByRole('menuitem', {name: 'Remove from team'})
    expect(deleteMenuItem).not.toBeInTheDocument()

    // The remove dialog is not visible yet
    let removeDialog = screen.queryByRole('dialog', {name: 'Removing member from enterprise-team-name'})
    expect(removeDialog).not.toBeInTheDocument()

    // Reveal remove member action when clicking on the kebab menu
    fireEvent.click(menu)
    deleteMenuItem = screen.getByRole('menuitem', {name: 'Remove from team'})
    expect(deleteMenuItem).toBeVisible()

    // Open dialog
    fireEvent.click(deleteMenuItem)

    // The dialog must be shown
    removeDialog = screen.getByRole('dialog', {name: 'Removing member from enterprise-team-name'})
    expect(removeDialog).toBeVisible()

    // With a remove button
    const removeButton = screen.getByRole('button', {name: 'Remove'})
    expect(removeButton).toBeVisible()

    // Check dialog message
    expect(
      screen.getByText("Are you sure that you want to remove 'John Doe 1' from the enterprise team?"),
    ).toBeVisible()

    // Remove user
    fireEvent.click(removeButton)

    // Check API call
    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/business-slug/teams/enterprise-team-name/members/user1`,
        {
          method: 'DELETE',
          headers: {Accept: 'application/json'},
        },
      )
    })

    // The dialog is closed
    expect(removeDialog).not.toBeInTheDocument()
  })

  test('it closes the remove confirmation dialog when the cancel button is clicked', () => {
    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)

    // Check presence of the kebab menu for the user, we query aria-label
    const menu = screen.getByRole('button', {name: 'View actions for user0'})
    expect(menu).toBeVisible()

    // Reveal remove member action when clicking on the kebab menu
    fireEvent.click(menu)
    const deleteMenuItem = screen.getByRole('menuitem', {name: 'Remove from team'})
    expect(deleteMenuItem).toBeVisible()

    // Open dialog
    fireEvent.click(deleteMenuItem)

    // The dialog must be shown
    const removeDialog = screen.getByRole('dialog', {name: 'Removing member from enterprise-team-name'})
    expect(removeDialog).toBeVisible()

    // Check dialog message
    expect(screen.getByText("Are you sure that you want to remove 'user0' from the enterprise team?")).toBeVisible()

    // With a cancel button
    const cancelButton = screen.getByRole('button', {name: 'Cancel'})
    expect(cancelButton).toBeVisible()

    // Click cancel
    fireEvent.click(cancelButton)

    // The dialog is closed
    expect(removeDialog).not.toBeInTheDocument()
  })

  test('it shows an error message if the server failed to remove the member', async () => {
    const props = getEnterpriseTeamProps()
    render(<EnterpriseTeam {...props} />)
    mockVerifiedFetchJSON.mockResolvedValue({
      status: 500,
      json: async () => {
        return {
          data: {
            error: `A server error occcured!`,
          },
        }
      },
    })

    // Check presence of the kebab menu for the user, we query aria-label
    const menu = screen.getByRole('button', {name: 'View actions for user1'})
    expect(menu).toBeVisible()

    // Reveal remove member action when clicking on the kebab menu
    fireEvent.click(menu)
    let deleteMenuItem = screen.getByRole('menuitem', {name: 'Remove from team'})
    expect(deleteMenuItem).toBeVisible()

    // Open dialog
    fireEvent.click(deleteMenuItem)

    // The dialog must be shown
    let removeDialog = screen.getByRole('dialog', {name: 'Removing member from enterprise-team-name'})
    expect(removeDialog).toBeVisible()

    // With a remove button
    const removeButton = screen.getByRole('button', {name: 'Remove'})
    expect(removeButton).toBeVisible()

    // Remove user
    fireEvent.click(removeButton)

    // Check API call
    await act(() => {
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith(
        `/enterprises/business-slug/teams/enterprise-team-name/members/user1`,
        {
          method: 'DELETE',
          headers: {Accept: 'application/json'},
        },
      )
    })

    // The dialog is still open, showing the flash error
    expect(removeDialog).toBeVisible()
    expect(screen.getByText('A server error occcured!')).toBeVisible()

    // Reopening the dialog reset the error messsage
    const closeButton = screen.getByRole('button', {name: 'Close'})
    expect(closeButton).toBeVisible()
    fireEvent.click(closeButton)
    fireEvent.click(menu)
    deleteMenuItem = screen.getByRole('menuitem', {name: 'Remove from team'})
    expect(deleteMenuItem).toBeVisible()
    fireEvent.click(deleteMenuItem)

    // Check dialog open without error message
    removeDialog = screen.getByRole('dialog', {name: 'Removing member from enterprise-team-name'})
    expect(removeDialog).toBeVisible()
    expect(screen.queryByText('A server error occcured!')).not.toBeInTheDocument()
  })
})

describe('edit team', () => {
  test('it does not render the edit button for the readonly view', () => {
    render(<EnterpriseTeam {...getEnterpriseTeamProps({readonly: true})} />)
    expect(screen.queryByRole('button', {name: 'Edit team'})).not.toBeInTheDocument()
  })

  test('it renders the edit team button', () => {
    render(<EnterpriseTeam {...getEnterpriseTeamProps()} />)
    expect(screen.getByRole('button', {name: 'Edit team'})).toBeVisible()
  })
})

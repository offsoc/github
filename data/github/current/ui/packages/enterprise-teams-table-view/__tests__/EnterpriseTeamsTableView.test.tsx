import {screen, fireEvent, act, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EnterpriseTeamsTableView} from '../EnterpriseTeamsTableView'
import {getEnterpriseTeamsTableViewProps} from '../test-utils/mock-data'
import {verifiedFetch} from '@github-ui/verified-fetch'

const mockVerifiedFetch = verifiedFetch as jest.Mock
jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetch: jest.fn(),
}))

describe('EnterpriseTeamsTableView', () => {
  const props = getEnterpriseTeamsTableViewProps()

  test('Renders the container for the view', () => {
    render(<EnterpriseTeamsTableView {...props} />)
    expect(screen.getByTestId('business-team-page-container')).toBeInTheDocument()
  })

  describe('New Team Button', () => {
    test('Renders the new team button', () => {
      render(<EnterpriseTeamsTableView {...props} />)
      expect(screen.getByTestId('new-team-button').textContent).toBe('New enterprise team')
    })

    test('Omits the new team button for the readonly view', () => {
      render(<EnterpriseTeamsTableView {...getEnterpriseTeamsTableViewProps({readonly: true})} />)
      expect(screen.queryByTestId('new-team-button')).not.toBeInTheDocument()
    })

    test('Disables the new team button when in GHES and an enterprise team already exists', () => {
      const disableButtonProps = {
        ...props,
        cannot_create_multiple_teams: true,
      }

      render(<EnterpriseTeamsTableView {...disableButtonProps} />)

      const newTeamButton = screen.getByTestId('new-team-button')
      expect(newTeamButton).toBeDisabled()
    })
  })

  describe('Enterprise Teams Table View', () => {
    test('Renders the enterprise team list', () => {
      render(<EnterpriseTeamsTableView {...props} />)
      expect(screen.getByTestId('checkbox-for-team-slug')).toBeInTheDocument()
      expect(screen.getByTestId('link-to-team-slug').textContent).toBe('team-1')
      expect(screen.getByTestId('member-count-for-team-slug').textContent).toBe('0 members')
      expect(screen.getByTestId('checkbox-for-team-slug2')).toBeInTheDocument()
      expect(screen.getByTestId('link-to-team-slug2').textContent).toBe('team-2')
      expect(screen.getByTestId('member-count-for-team-slug2').textContent).toBe('0 members')
    })

    test('Renders the blankslate when there are no teams including a new team primary action', () => {
      const noTeamsProps = {
        ...props,
        enterprise_teams: [],
      }

      render(<EnterpriseTeamsTableView {...noTeamsProps} />)

      const emptyList = screen.getByTestId('empty-list')
      expect(emptyList).toBeInTheDocument()
      expect(within(emptyList).getByRole('link', {name: 'New enterprise team'})).toBeInTheDocument()
    })

    test('Renders the blankslate when there are no teams without a new team primary action in readonly view', () => {
      const noTeamsProps = {
        ...getEnterpriseTeamsTableViewProps({readonly: true}),
        enterprise_teams: [],
      }

      render(<EnterpriseTeamsTableView {...noTeamsProps} />)

      const emptyList = screen.getByTestId('empty-list')
      expect(emptyList).toBeInTheDocument()
      expect(within(emptyList).queryByRole('link')).not.toBeInTheDocument()
    })

    test('Renders blankslate with search term when no teams are matched', () => {
      render(<EnterpriseTeamsTableView {...props} />)

      const searchInput = screen.getByTestId('search-input')
      fireEvent.change(searchInput, {target: {value: 'nonexistent team'}})

      expect(screen.getByTestId('filtered-empty-list')).toBeInTheDocument()
    })

    test('Select all checkbox is checked if all items are selected', () => {
      render(<EnterpriseTeamsTableView {...props} />)
      const checkboxes = screen.getAllByTestId(/checkbox-for-team-.*/)
      expect(checkboxes.length).toBeGreaterThanOrEqual(1)
      for (const checkbox of checkboxes) {
        fireEvent.click(checkbox)
      }
      expect(screen.getByTestId('select-all-checkbox')).toBeChecked()
    })

    test('Select all checkbox is unchecked if no items are selected', () => {
      render(<EnterpriseTeamsTableView {...props} />)
      expect(screen.getByTestId('select-all-checkbox')).not.toBeChecked()
    })

    test('Select all checkbox is indeterminate if some items are selected', () => {
      render(<EnterpriseTeamsTableView {...props} />)
      const checkboxes = screen.getAllByTestId(/checkbox-for-team-.*/)
      expect(checkboxes.length).toBeGreaterThanOrEqual(2)
      for (const checkbox of checkboxes) {
        fireEvent.click(checkbox)
      }
      fireEvent.click(checkboxes[0]!)
      expect(screen.getByTestId('select-all-checkbox')).toBePartiallyChecked()
    })

    test('Checkboxes are not rendered for readonly view', () => {
      render(<EnterpriseTeamsTableView {...getEnterpriseTeamsTableViewProps({readonly: true})} />)
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0)

      // Validate there are still teams being rendered
      expect(screen.getAllByTestId(/link-to-team-.*/).length).toBeGreaterThanOrEqual(2)
    })

    test('Checkboxes are not rendered when cannot remove teans', () => {
      render(
        <EnterpriseTeamsTableView {...getEnterpriseTeamsTableViewProps({readonly: false, can_remove_teams: false})} />,
      )
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0)

      // Validate there are still teams being rendered
      expect(screen.getAllByTestId(/link-to-team-.*/).length).toBeGreaterThanOrEqual(2)
    })

    test('Delete button triggers API request with the selected team', () => {
      mockVerifiedFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            data: {
              redirect_url: '/enterprises/enterprise-1/teams',
            },
          }
        },
      })

      render(<EnterpriseTeamsTableView {...props} />)

      const checkboxes = screen.getAllByTestId(/checkbox-for-team-.*/)
      expect(checkboxes.length).toBeGreaterThanOrEqual(1)
      for (const checkbox of checkboxes) {
        fireEvent.click(checkbox)
      }
      expect(screen.getByTestId('select-all-checkbox')).toBeChecked()

      fireEvent.click(screen.getByTestId('select-all-menu-button'))

      const deleteButton = screen.getByTestId('delete-teams-button')
      fireEvent.click(deleteButton)

      expect(screen.queryByTestId('flash-error')).not.toBeInTheDocument()

      const expectedFormData = new FormData()
      expectedFormData.append('team_slugs[]', 'team-slug')
      expectedFormData.append('team_slugs[]', 'team-slug2')

      expect(mockVerifiedFetch).toHaveBeenCalledWith(`/enterprises/business/teams/bulk_delete`, {
        method: 'DELETE',
        headers: {Accept: 'application/json'},
        body: expectedFormData,
      })
    })

    test('Delete button returns flash error when API returns error', async () => {
      const errorMessage = 'uh oh, something went wrong'

      mockVerifiedFetch.mockResolvedValue({
        ok: true,
        statusText: 'OK',
        json: async () => {
          return {
            data: {
              error: errorMessage,
            },
          }
        },
      })

      render(<EnterpriseTeamsTableView {...props} />)

      const checkboxes = screen.getAllByTestId(/checkbox-for-team-.*/)
      expect(checkboxes.length).toBeGreaterThanOrEqual(1)
      for (const checkbox of checkboxes) {
        fireEvent.click(checkbox)
      }
      expect(screen.getByTestId('select-all-checkbox')).toBeChecked()

      fireEvent.click(screen.getByTestId('select-all-menu-button'))

      const deleteButton = screen.getByTestId('delete-teams-button')

      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(() => {
        fireEvent.click(deleteButton)
      })

      expect(screen.getByTestId('flash-error')).toBeInTheDocument()
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    test('Renders the IDP group badge when externalGroupId is present', () => {
      render(<EnterpriseTeamsTableView {...props} />)

      const idpGroupLink1 = screen.getByTestId('link-to-external-group-1')
      const idpGroupLink2 = screen.getByTestId('link-to-external-group-2')

      expect(idpGroupLink1).toBeInTheDocument()
      expect(idpGroupLink2).toBeInTheDocument()

      expect(idpGroupLink1.textContent).toBe('IdP Group')
      expect(idpGroupLink2.textContent).toBe('IdP Group')
    })

    test('Does not render the IdP Group badge when externalGroupId is not present', () => {
      const noExternalGroupIdProps = {
        ...props,
        enterprise_teams: props.enterprise_teams.map(team => ({
          ...team,
          external_group_id: null,
        })),
      }

      render(<EnterpriseTeamsTableView {...noExternalGroupIdProps} />)

      const idpGroupLink1 = screen.queryByTestId('link-to-external-group-1')
      const idpGroupLink2 = screen.queryByTestId('link-to-external-group-2')

      expect(idpGroupLink1).not.toBeInTheDocument()
      expect(idpGroupLink2).not.toBeInTheDocument()
    })
  })

  describe('Enterprise Team Links', () => {
    test('Team link should have the correct href', () => {
      render(<EnterpriseTeamsTableView {...props} />)

      const teamLink1 = screen.getByTestId('link-to-team-slug')
      const teamLink2 = screen.getByTestId('link-to-team-slug2')

      expect(teamLink1).toHaveAttribute('href', 'teams/team-slug/members')
      expect(teamLink2).toHaveAttribute('href', 'teams/team-slug2/members')
    })

    test('IdP group badge should have the correct href', () => {
      render(<EnterpriseTeamsTableView {...props} />)

      const idpGroupLink1 = screen.queryByTestId('link-to-external-group-1')
      const idpGroupLink2 = screen.queryByTestId('link-to-external-group-2')

      expect(idpGroupLink1).toHaveAttribute('href', 'external_group_members/1')
      expect(idpGroupLink2).toHaveAttribute('href', 'external_group_members/2')
    })
  })
})

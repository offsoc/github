import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  type Collaborator,
  CollaboratorRole,
  CollaboratorType,
  Role,
  type Team,
  type User,
} from '../../../../client/api/common-contracts'
import {apiGetCollaborators} from '../../../../client/api/memex/api-get-collaborators'
import {apiGetSuggestedCollaborators} from '../../../../client/api/memex/api-get-suggested-collaborators'
import {apiRemoveCollaborators} from '../../../../client/api/memex/api-remove-collaborators'
import {apiUpdateCollaborators} from '../../../../client/api/memex/api-update-collaborators'
import {overrideDefaultPrivileges} from '../../../../client/helpers/viewer-privileges'
import {AccessSettingsView} from '../../../../client/pages/settings/components/access-settings/access-settings-view'
import {useHasColumnData} from '../../../../client/state-providers/columns/use-has-column-data'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../../mocks/api/memex'
import {asMockHook} from '../../../mocks/stub-utilities'
import {createTestEnvironment, TestAppContainer} from '../../../test-app-wrapper'

// Avoid waiting for required field effects where there is no discernable UI change
jest.mock('../../../../client/state-providers/columns/use-has-column-data')

// Mock modules to avoid verified-fetch dependency which rejects requests with a host involved
jest.mock('../../../../client/api/memex/api-get-collaborators')
jest.mock('../../../../client/api/memex/api-get-suggested-collaborators')
jest.mock('../../../../client/api/memex/api-update-collaborators')
jest.mock('../../../../client/api/memex/api-remove-collaborators')

describe('Manage Access View', () => {
  const user1 = 'user-1'
  const user2 = 'user-2'
  const team1 = 'memex-team-1'
  const team2 = 'memex-team-2'

  const userSuggestions = [
    {
      user: {
        id: 1,
        global_relay_id: 'MDQ6VXNl',
        login: user1,
        name: 'User 1',
        avatarUrl: '/assets/avatars/u/8616962.png',
        isSpammy: false,
      },
    },
    {
      user: {
        id: 2,
        global_relay_id: 'MDQ6VXNl',
        login: user2,
        name: 'User 2',
        avatarUrl: '/assets/avatars/u/8616962.png',
        isSpammy: false,
      },
    },
  ]

  const teamSuggestions = [
    {
      team: {
        id: 3925116,
        slug: team1,
        name: 'Memex Team 1',
        avatarUrl: '/assets/avatars/t/3925116.png',
      },
    },
    {
      team: {
        id: 3925117,
        slug: team2,
        name: 'Memex Team 2',
        avatarUrl: '/assets/avatars/t/3925116.png',
      },
    },
  ]

  function collaboratorFromSuggestion(
    {user, team}: {user?: User; team?: Team},
    role: CollaboratorRole = CollaboratorRole.Reader,
  ): Collaborator {
    if (user) {
      return {
        ...user,
        role,
        actor_type: CollaboratorType.User,
      }
    }
    return {
      ...(team as Team),
      role,
      actor_type: CollaboratorType.Team,
      membersCount: 10,
    }
  }

  function mockGetCollaborators(collaborators: Array<Collaborator> = []) {
    stubResolvedApiResponse(apiGetCollaborators, {collaborators})
  }

  function mockGetCollaboratorsWithError(error: string) {
    stubRejectedApiResponse(apiGetCollaborators, error)
  }

  type SuggestionsArray = Array<{user: User} | {team: Team}>

  function mockGetSuggestedCollaborators(suggestions: SuggestionsArray): jest.Mock {
    return stubResolvedApiResponse(apiGetSuggestedCollaborators, {suggestions})
  }

  function mockAddCollaborators(collaborators: Array<Collaborator>, failed: Array<string> = []) {
    stubResolvedApiResponse(apiUpdateCollaborators, {collaborators, failed})
  }

  function mockRemoveCollaborators() {
    stubResolvedApiResponse(apiRemoveCollaborators, {failed: []})
  }

  function expectTableCounterHasText(str: string) {
    expect(screen.getByTestId('collaborators-table-counter')).toHaveTextContent(str)
  }

  // Types string in input, and waits for the getSuggestedCollaborators API to be called X times
  // These calls are debounced so they should be called once a user stops typing
  async function typeSuggestionAndWaitForCalls(str: string, mockCalled: jest.Mock, expectedCalls: number) {
    const input = screen.getByTestId('add-collaborators-input')
    await userEvent.type(input, str)

    await waitFor(() => {
      expect(mockCalled).toHaveBeenCalledTimes(expectedCalls)
    })
    mockCalled.mockClear()
  }

  async function findSuggestion(displayValue: string) {
    const suggestionList = await screen.findByTestId('add-collaborators-suggestions-list')

    return within(suggestionList).getByTestId(`collaborator-suggestion-item-${displayValue}`)
  }

  function getRoleSelect(parentTestId: string) {
    const addCollaborators = screen.getByTestId(parentTestId)
    return within(addCollaborators).getByTestId('collaborators-role-dropdown-button')
  }

  async function changeCollaboratorRoleSelectOption(select: HTMLElement, role: string) {
    await userEvent.click(select)
    await userEvent.click(screen.getByTestId(`collaborators-role-dropdown-item-${role}`))
  }

  async function expectHasCollaboratorRows(n: number) {
    return waitFor(() => {
      expect(screen.queryAllByTestId('collaborators-row-', {exact: false})).toHaveLength(n)
    })
  }

  async function addCollaborator(str: string, mockGetSuggestionCalled: jest.Mock) {
    // Type and wait for API to be called when done
    await typeSuggestionAndWaitForCalls(str, mockGetSuggestionCalled, 1)

    const suggestion = await findSuggestion(str)
    await userEvent.click(suggestion)

    return screen.findByTestId(`collaborator-pill-${str}`)
  }

  function findCollaboratorRow(str: string) {
    return screen.findByTestId(`collaborators-row-${str}`)
  }

  async function waitForCollaboratorsLoaded() {
    return waitFor(() => {
      expect(screen.queryByText('Loading collaborators...')).not.toBeInTheDocument()
    })
  }

  async function renderAccessView() {
    render(
      <TestAppContainer>
        <AccessSettingsView />
      </TestAppContainer>,
    )
    await waitForCollaboratorsLoaded()
  }

  beforeEach(() => {
    asMockHook(useHasColumnData).mockReturnValue({hasColumnData: () => true})
    createTestEnvironment({
      'memex-enabled-features': [],
      'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
    })
  })

  it('should render a heading for "Project Settings"', async () => {
    await renderAccessView()
    expect(screen.getByRole('heading', {name: 'Manage access'})).toBeInTheDocument()
  })

  describe('Collaborator suggestions', () => {
    async function mockSuggestionsAndRenderView(suggestions: SuggestionsArray) {
      const mockGetCollaboratorsCalled = mockGetSuggestedCollaborators(suggestions)
      await renderAccessView()

      return {mockGetCollaboratorsCalled}
    }

    it('should show a list of suggestions when typing in the input', async () => {
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(userSuggestions)
      await typeSuggestionAndWaitForCalls('f', mockGetCollaboratorsCalled, 1)

      // Expect mocked user suggestions to be displayed
      expect(await findSuggestion(user1)).toBeInTheDocument()
      expect(await findSuggestion(user2)).toBeInTheDocument()
    })

    it('should ignore @ when retrieving suggestions', async () => {
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(userSuggestions)
      // API is only called once, excluding the @
      await typeSuggestionAndWaitForCalls('@o', mockGetCollaboratorsCalled, 1)

      // Expect mocked user suggestions to be displayed
      expect(await findSuggestion(user1)).toBeInTheDocument()
      expect(await findSuggestion(user2)).toBeInTheDocument()
    })

    it('should support displaying a list of teams', async () => {
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(teamSuggestions)
      await typeSuggestionAndWaitForCalls('f', mockGetCollaboratorsCalled, 1)

      // Expect mocked team suggestions to be displayed
      expect(await findSuggestion(team1)).toBeInTheDocument()
      expect(await findSuggestion(team2)).toBeInTheDocument()
    })

    it('should support selecting a collaborator', async () => {
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(userSuggestions)

      // Expect collaborator pill to present
      expect(await addCollaborator(user1, mockGetCollaboratorsCalled)).toBeInTheDocument()
    })

    it('should support removing a suggested collaborator with the close button', async () => {
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(userSuggestions)

      // When I click the close button inside of the pill
      const pill = await addCollaborator(user1, mockGetCollaboratorsCalled)
      await userEvent.click(within(pill).getByRole('button'))

      // Then I expect the suggested collaborator to have been removed
      expect(pill).not.toBeInTheDocument()
    })

    it('should support removing a suggested collaborator with backspace', async () => {
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(userSuggestions)

      // When I add a collaborator and click backspace
      const pill = await addCollaborator(user1, mockGetCollaboratorsCalled)

      mockGetCollaboratorsCalled.mockClear()
      // No API request made when input has no value
      await typeSuggestionAndWaitForCalls('{backspace}', mockGetCollaboratorsCalled, 0)

      // Then I expect the collaborator to have been removed
      expect(pill).not.toBeInTheDocument()
    })

    it('should support selecting permissions in via the dropdown', async () => {
      await mockSuggestionsAndRenderView(userSuggestions)

      // I expect the role to be displayed
      const roleSelect = getRoleSelect('add-collaborators')
      expect(roleSelect).toHaveTextContent('Role: Write')

      //When I update the collaborator role
      await userEvent.click(roleSelect)
      await userEvent.click(screen.getByTestId('collaborators-role-dropdown-item-admin'))

      // Then I expect the role to be updated
      expect(roleSelect).toHaveTextContent('Role: Admin')
    })

    it('should not allow selecting users who are already collaborators', async () => {
      // Given an existing collaborator
      mockGetCollaborators([collaboratorFromSuggestion(userSuggestions[0])])
      const {mockGetCollaboratorsCalled} = await mockSuggestionsAndRenderView(userSuggestions)

      // Wait for the collabor row to appear
      await findCollaboratorRow(user1)

      // When I try to add the same collaborator again
      await typeSuggestionAndWaitForCalls('f', mockGetCollaboratorsCalled, 1)

      // I expect text to indicate user is already a collaborator
      const suggestion = await findSuggestion(user1)
      expect(suggestion).toHaveTextContent('Already a collaborator')
    })
  })

  describe('Adding collaborators', () => {
    function expectCollaboratorAddedSuccess() {
      expect(screen.getByText('1 user successfully added')).toBeInTheDocument()
    }

    async function inviteCollaborators() {
      await userEvent.click(screen.getByRole('button', {name: 'Invite'}))
    }

    async function mockAddCollaboratorsAndRenderView(
      suggestions: SuggestionsArray,
      updatedCollaborators: Array<Collaborator>,
    ) {
      const mockGetCollaboratorsCalled = mockGetSuggestedCollaborators(suggestions)
      mockAddCollaborators(updatedCollaborators)
      await renderAccessView()

      return {mockGetCollaboratorsCalled}
    }

    it('should clear the input field and show success after collaborators are invited', async () => {
      mockGetCollaborators()

      const {mockGetCollaboratorsCalled} = await mockAddCollaboratorsAndRenderView(userSuggestions, [])

      //When I invite collaborators
      const pill = await addCollaborator(user1, mockGetCollaboratorsCalled)
      await inviteCollaborators()

      // Then I expect the collaborator pill to have been removed
      await waitFor(() => {
        expect(pill).not.toBeInTheDocument()
      })

      // And I expect to see a success message
      expectCollaboratorAddedSuccess()
    })

    it('should clear the input field and show success after team collaborators are invited', async () => {
      const {mockGetCollaboratorsCalled} = await mockAddCollaboratorsAndRenderView(teamSuggestions, [])

      // When I invite collaborators
      const pill = await addCollaborator(team1, mockGetCollaboratorsCalled)
      await userEvent.click(screen.getByRole('button', {name: 'Invite'}))

      // Then I expect the collaborator pill to have been removed
      await waitFor(() => {
        expect(pill).not.toBeInTheDocument()
      })

      // And I expect to see a success message
      expectCollaboratorAddedSuccess()
    })

    it('should add new collaborator rows to the table on success', async () => {
      // we have no initial collaborators
      mockGetCollaborators()

      // Given I've mocked a response for add collaborators
      const mockAddedCollaborators = [
        collaboratorFromSuggestion(userSuggestions[0]),
        collaboratorFromSuggestion(teamSuggestions[0]),
      ]
      const {mockGetCollaboratorsCalled} = await mockAddCollaboratorsAndRenderView(
        userSuggestions,
        mockAddedCollaborators,
      )

      // And I've added some collaborators
      await addCollaborator(user1, mockGetCollaboratorsCalled)

      mockGetCollaborators([
        collaboratorFromSuggestion(userSuggestions[0]),
        collaboratorFromSuggestion(teamSuggestions[0]),
      ])
      // When I invite collaborators
      await inviteCollaborators()

      // Then I expect my new rows from the mock server response to have been added
      expect(await findCollaboratorRow(user1)).toBeInTheDocument()
      expect(await findCollaboratorRow(`@${team1} • 10 members`)).toBeInTheDocument()

      // And I expect my counter to have been updated
      expectTableCounterHasText('1 member, 1 team')
    })

    it('should display an error, retain the input, and maintain table state on failure to add collaborators', async () => {
      // we have no initial collaborators
      mockGetCollaborators()

      // Given a mocked user suggestions response
      const mockGetCollaboratorsCalled = mockGetSuggestedCollaborators(userSuggestions)

      // And a mocked error response for adding collaborators
      mockAddCollaborators([], [`user/${userSuggestions[0].user.id}`])

      // When I render the access view
      await renderAccessView()

      // And I add a collaborator
      const pill = await addCollaborator(user1, mockGetCollaboratorsCalled)
      await inviteCollaborators()

      // Then I expect an error to be displayed
      expect(await screen.findByTestId('failure-message')).toBeInTheDocument()

      // And the collaborator pill is still displayed
      expect(pill).toBeInTheDocument()

      // And the table count is 0
      expectTableCounterHasText('0 members')

      // And the table is empty
      expect(screen.getByTestId('collaborators-table-blankslate-no-collaborators')).toBeInTheDocument()
    })
  })

  describe('Updating collaborators', () => {
    it("should allow updating a user's role", async () => {
      const collaborators = [collaboratorFromSuggestion(userSuggestions[0])]

      // Given a mocked collaborator response
      mockGetCollaborators(collaborators)

      // And a mocked add collaborator response
      const newRole = CollaboratorRole.Admin
      mockAddCollaborators([{...collaborators[0], role: newRole}])

      // When I render the manage access view
      await renderAccessView()

      // Then I expect the collaborator to have a "Read" role
      const collaborator = await findCollaboratorRow(user1)
      const collaboratorTestId = collaborator.getAttribute('data-testid') as string
      const roleSelect = getRoleSelect(collaboratorTestId)
      expect(roleSelect).toHaveTextContent('Role: Read')

      mockGetCollaborators([{...collaborators[0], role: newRole}])
      // And if I click on the button to update the role, and update it via dropdown
      await changeCollaboratorRoleSelectOption(roleSelect, 'admin')

      // Then I expect that the role has been updated
      expect(getRoleSelect(collaboratorTestId)).toHaveTextContent('Role: Admin')
    })
  })

  describe('Removing collaborators', () => {
    it('should remove actors from the table', async () => {
      // Given an existing collaborator
      mockGetCollaborators([collaboratorFromSuggestion(userSuggestions[0])])
      mockRemoveCollaborators()
      await renderAccessView()

      const collaborator = await findCollaboratorRow(user1)
      mockGetCollaborators([])
      // When I click the remove button inside of the row
      await userEvent.click(within(collaborator).getByRole('button', {name: 'Remove'}))

      // Then I expect the counter to be updated
      await waitFor(() => {
        expectTableCounterHasText('0 members')
      })

      // And I expect the collaborator to have been removed
      expect(collaborator).not.toBeInTheDocument()
    })
  })

  describe('Manage collaborators', () => {
    function getBulkRemove() {
      return screen.queryByTestId('collaborators-remove-bulk')
    }

    async function selectAllCollaborators() {
      await userEvent.click(screen.getByTestId('collaborators-checkbox-bulk'))
    }

    async function findRowCheckbox(str: string) {
      const row = await findCollaboratorRow(str)
      return within(row).getByRole('checkbox')
    }

    it('should display the bulk remove button, selected count, and role when multiple collaborators are selected', async () => {
      const collaborators = [
        collaboratorFromSuggestion(userSuggestions[0]),
        collaboratorFromSuggestion(userSuggestions[1]),
      ]

      // Given a mocked collaborator response
      mockGetCollaborators(collaborators)

      // When I render the manage access view
      await renderAccessView()

      // When I select the first collaborator
      const checkbox1 = await findRowCheckbox(user1)
      await userEvent.click(checkbox1)

      // The bulk remove button should not be present
      expect(getBulkRemove()).not.toBeInTheDocument()

      // And when I select another collaborator
      const checkbox2 = await findRowCheckbox(user2)
      await userEvent.click(checkbox2)

      // The bulk remove button should be present
      expect(getBulkRemove()).toBeInTheDocument()

      // And the selection counter has been updated
      expectTableCounterHasText('2 selected')

      // And the role is displayed
      expect(getRoleSelect('collaborators-header-dropdown')).toHaveTextContent('Role: Read')
    })

    it('should allow selecting all colaborators by clicking the checkbox in the table header', async () => {
      const collaborators = [
        collaboratorFromSuggestion(userSuggestions[0]),
        collaboratorFromSuggestion(userSuggestions[1]),
      ]

      // Given a mocked collaborator response
      mockGetCollaborators(collaborators)

      // When I render the manage access view
      await renderAccessView()

      const checkbox1 = await findRowCheckbox(user1)
      const checkbox2 = await findRowCheckbox(user2)

      expect(checkbox1).not.toBeChecked()
      expect(checkbox2).not.toBeChecked()

      // When I click on the checkbox to select all
      await selectAllCollaborators()

      // Then I expect the row checkboxes to be checked
      expect(checkbox1).toBeChecked()
      expect(checkbox2).toBeChecked()
    })

    it('should allow bulk removal of collaborators', async () => {
      const collaborators = [
        collaboratorFromSuggestion(userSuggestions[0]),
        collaboratorFromSuggestion(userSuggestions[1]),
      ]

      // Given a mocked collaborator response
      mockGetCollaborators(collaborators)

      // And a mocked remove collaborator response
      mockRemoveCollaborators()

      // When I render the manage access view
      await renderAccessView()

      // And I wait for my collaborator rows to load
      await findCollaboratorRow(user1)
      await findCollaboratorRow(user2)

      // When I click on the checkbox to select all
      await selectAllCollaborators()
      mockGetCollaborators([])
      // And I opt to remove the collaborators
      await userEvent.click(getBulkRemove() as HTMLElement)

      // Then I expect the collaborators to be removed
      expect(await screen.findByTestId('collaborators-table-blankslate-no-collaborators')).toBeInTheDocument()
    })

    it('should allow bulk update of collaborator roles', async () => {
      const collaborators = [
        collaboratorFromSuggestion(userSuggestions[0]),
        collaboratorFromSuggestion(userSuggestions[1]),
      ]

      // Given a mocked collaborator response
      mockGetCollaborators(collaborators)

      // And a mocked update collaborator response
      mockAddCollaborators([
        {...collaborators[0], role: CollaboratorRole.Admin},
        {...collaborators[1], role: CollaboratorRole.Reader},
      ])

      // When I render the manage access view
      await renderAccessView()

      // And I wait for my collaborator rows to load
      await findCollaboratorRow(user1)
      await findCollaboratorRow(user2)

      // When I click on the checkbox to select all
      await userEvent.click(screen.getByTestId('collaborators-checkbox-bulk'))

      // And I opt to update collaborator role
      const roleSelect = getRoleSelect('collaborators-header-dropdown')
      expect(roleSelect).toHaveTextContent('Role: Read')
      mockGetCollaborators([
        {...collaborators[0], role: CollaboratorRole.Admin},
        {...collaborators[1], role: CollaboratorRole.Reader},
      ])
      await changeCollaboratorRoleSelectOption(roleSelect, 'admin')

      // Then I expect the collaborators to be updated
      await waitFor(() => {
        expect(roleSelect).toHaveTextContent('Role: Mixed')
      })
    })
  })

  describe('Filtering collaborators', () => {
    function getCollaboratorInput(): HTMLInputElement {
      return screen.getByTestId('filter-collaborators-input')
    }

    async function filterCollaborators(filter: string) {
      await userEvent.type(getCollaboratorInput(), filter)
    }

    function getCollaboratorInputValue() {
      return getCollaboratorInput().value
    }

    const mixedTypeCollaborators = [
      collaboratorFromSuggestion(userSuggestions[0], CollaboratorRole.Reader),
      collaboratorFromSuggestion(userSuggestions[1], CollaboratorRole.Writer),
      collaboratorFromSuggestion(teamSuggestions[0], CollaboratorRole.Reader),
      collaboratorFromSuggestion(teamSuggestions[1], CollaboratorRole.Admin),
    ]

    async function clickTypeSelectDropdown() {
      await userEvent.click(screen.getByTestId('collaborators-header-type-filter-button'))
    }

    async function filterByTypeSelect(type: string) {
      await clickTypeSelectDropdown()
      await userEvent.click(screen.getByTestId(`filter-${type}`))
    }

    async function clickRoleSelectDropdown() {
      await userEvent.click(screen.getByTestId('collaborators-header-role-filter-button'))
    }

    async function filterByRoleSelect(role: string) {
      await clickRoleSelectDropdown()
      await userEvent.click(screen.getByTestId(`filter-${role}`))
    }

    async function mockCollaboratorsAndRenderView() {
      mockGetCollaborators(mixedTypeCollaborators)
      await renderAccessView()

      // Wait for rows to load
      await expectHasCollaboratorRows(4)
    }

    async function expectCollaboratorInputToContain(string: string) {
      return waitFor(() => {
        expect(getCollaboratorInputValue()).toContain(string)
      })
    }

    async function expectCollaboratorInputNotToContain(string: string) {
      return waitFor(() => {
        expect(getCollaboratorInputValue()).not.toContain(string)
      })
    }

    it('should display collaborators matching free text query', async () => {
      await mockCollaboratorsAndRenderView()

      await filterCollaborators(user2)

      await expectHasCollaboratorRows(1)
      expect(await findCollaboratorRow(user2)).toBeInTheDocument()
    })

    it('should hide collaborators that do not match free text query', async () => {
      await mockCollaboratorsAndRenderView()

      // When I filter the collaborators
      await filterCollaborators('foo')

      // Then I expect the empty state to be present
      expect(await screen.findByTestId('collaborators-table-blankslate-filtering')).toBeInTheDocument()

      // And I expect the rows to be hidden
      await expectHasCollaboratorRows(0)

      // But the count still reflects the number of collaborators
      expectTableCounterHasText('2 members, 2 teams')
    })

    describe('Filtering by role', () => {
      it('should filter by selected role item', async () => {
        await mockCollaboratorsAndRenderView()

        await filterByRoleSelect('write')

        await expectHasCollaboratorRows(1)
        await expectCollaboratorInputToContain('role:write')
      })

      it('should filter by selected role and text', async () => {
        await mockCollaboratorsAndRenderView()

        await filterByRoleSelect('read')

        await expectCollaboratorInputToContain('role:read')
        await expectHasCollaboratorRows(2)

        /**
         * NOTE: For some reason when typing multiple
         * characters in the input field after filtering by role, the role select
         * menu button becomes focused in RTL after the first character is typed.
         * Closing the role select menu is a workaround for this issue.
         */
        await clickRoleSelectDropdown()
        await filterCollaborators(' user-1')

        await expectHasCollaboratorRows(1)
        await expectCollaboratorInputToContain('role:read user-1')
      })

      it('should filter by selected role via text input', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('role:write')

        await expectHasCollaboratorRows(1)

        await clickRoleSelectDropdown()

        expect(screen.getByTestId('filter-write')).toBeChecked()
      })

      it('should update text input after a new role is selected', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators(`role:write ${user2}`)

        await expectHasCollaboratorRows(1)

        await filterByRoleSelect('read')

        await expectHasCollaboratorRows(0)
        await expectCollaboratorInputNotToContain('role:write')
      })

      it('should ignore role attribute if 2 roles are present in text input', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('role:read role:write')

        await expectHasCollaboratorRows(0)

        await clickRoleSelectDropdown()

        expect(screen.queryAllByRole('menuitemradio', {checked: true})).toHaveLength(0)

        await userEvent.click(screen.getByTestId('filter-read'))

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputNotToContain('role:write')
      })

      it('should remove the role if an already selected option is clicked again', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('role:admin 2')

        await expectHasCollaboratorRows(1)
        // await expectCollaboratorInputToContain('role:admin 2')

        await filterByRoleSelect('admin')

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputNotToContain('role:admin')
      })
    })

    describe('Filtering by type', () => {
      it('should filter by selected item type', async () => {
        await mockCollaboratorsAndRenderView()

        await filterByTypeSelect('user')

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputToContain('type:user')
      })

      it('should filter by selected item type and text', async () => {
        await mockCollaboratorsAndRenderView()

        await filterByTypeSelect('team')

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputToContain(`type:team`)

        /**
         * NOTE: For some reason when typing multiple
         * characters in the input field after filtering by type, the type select
         * menu button becomes focused in RTL after the first character is typed.
         * Closing the type select menu is a workaround for this issue.
         */
        await clickTypeSelectDropdown()
        await filterCollaborators(` ${team1}`)

        await expectHasCollaboratorRows(1)
        await expectCollaboratorInputToContain(`type:team ${team1}`)
      })

      it('should filter by type when selected via text', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('type:team')

        await expectHasCollaboratorRows(2)

        await clickTypeSelectDropdown()

        expect(screen.getByTestId('filter-team')).toBeChecked()
      })

      it('should update type in text input when a new one is selected', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators(`type:team ${team1}`)

        await expectHasCollaboratorRows(1)

        await filterByTypeSelect('user')

        await expectHasCollaboratorRows(0)
        await expectCollaboratorInputNotToContain('type:team')
      })

      it('should ignore type attribute if 2 types are present in the input', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('type:team type:user')

        await expectHasCollaboratorRows(0)

        await clickTypeSelectDropdown()

        expect(screen.queryAllByRole('menuitemradio', {checked: true})).toHaveLength(0)

        await userEvent.click(screen.getByTestId('filter-user'))

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputNotToContain('type:team')
      })

      it('should remove the type if an already selected option is clicked again', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('type:team 1')

        await expectHasCollaboratorRows(1)

        await filterByTypeSelect('team')

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputNotToContain('type:team')
      })
    })

    describe('Filtering by type and role', () => {
      it('should filter by selected type and selected role item', async () => {
        await mockCollaboratorsAndRenderView()

        await filterByTypeSelect('user')

        await expectHasCollaboratorRows(2)
        await expectCollaboratorInputToContain('type:user')

        await filterByRoleSelect('read')

        await expectHasCollaboratorRows(1)
        await expectCollaboratorInputToContain('type:user role:read')
      })

      it('should filter by selected type and selected role item when typed via input', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('type:user role:read')

        await expectHasCollaboratorRows(1)
      })

      it('should update type and role in text input when a different one is selected', async () => {
        await mockCollaboratorsAndRenderView()

        await filterCollaborators('type:user role:read')
        await expectHasCollaboratorRows(1)

        await filterByRoleSelect('admin')
        await expectCollaboratorInputToContain('type:user role:admin')

        await filterByTypeSelect('team')

        await expectHasCollaboratorRows(1)
        await expectCollaboratorInputToContain('type:team role:admin')
      })
    })
  })

  describe('Collaborators table', () => {
    it('should display an error if getting collaborators fails', async () => {
      // Given a mocked collaborator response
      mockGetCollaboratorsWithError('Bad response')

      // When I render the manage access view
      await renderAccessView()

      // Then I expect an error to be displayed
      expect(await screen.findByTestId('collaborators-table-blankslate-error')).toBeInTheDocument()
    })
  })
})

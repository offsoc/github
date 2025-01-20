import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NoMemberAccessBlankslate} from '../NoMemberAccessBlankslate'
import {CopilotForBusinessSeatPolicy} from '../../../types'
import type {CopilotForBusinessOrganization} from '../../../types'

describe('NoMemberAccessBlankslate', () => {
  const mockOnClick = jest.fn()

  const copilotOrg: CopilotForBusinessOrganization = {
    id: 1,
    billable: true,
    has_seat: true,
    name: 'test-org',
    add_seat_link: '',
  }

  const seatBreakdown = {
    seats_assigned: 0,
    seats_billed: 3,
    seats_pending: 2,
    description: 'Seats',
  }

  describe('when Copilot is disabled', () => {
    test('Renders the correct copy and no CTA to add seats', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.Disabled}
          organization={copilotOrg}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )

      expect(screen.queryByText('Assign Copilot seats')).not.toBeInTheDocument()

      expect(screen.queryByTestId('seat-requester-avatar-stack')).not.toBeInTheDocument()
    })

    test('displays correct text when zero pending request', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.Disabled}
          organization={copilotOrg}
          pendingRequests={{
            count: 0,
            requesters: [],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      expect(
        screen.getByText(
          'No members are using GitHub Copilot in this organization. To maximize your developer velocity using AI, enable Copilot and start adding users.',
        ),
      ).toBeInTheDocument()
      expect(screen.queryByText('Assign Copilot seats')).not.toBeInTheDocument()

      expect(screen.queryByTestId('seat-requester-avatar-stack')).not.toBeInTheDocument()
    })

    test('displays correct text when one pending request', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.Disabled}
          organization={copilotOrg}
          pendingRequests={{
            count: 1,
            requesters: [{id: 1, display_login: 'user1', profile_name: 'name1'}],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const body = screen.getByTestId('seat-management-body-text')
      expect(body).toHaveTextContent(
        '@user1 is waiting for access to Copilot. To maximize your developer velocity using AI, enable Copilot in your organization to give members access.',
      )
      expect(screen.queryByText('Assign Copilot seats')).not.toBeInTheDocument()

      const user = screen.getByTestId('seat-requester-name-hover-1')
      expect(user).toHaveTextContent('@user1')
      const avatars = screen.getAllByTestId('seat-requester-avatar')
      expect(avatars.length).toBe(1)
    })

    test('displays correct text when there are 2 pending requests', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.Disabled}
          organization={copilotOrg}
          pendingRequests={{
            count: 2,
            requesters: [
              {id: 1, display_login: 'user1', profile_name: 'name1'},
              {id: 2, display_login: 'user2', profile_name: 'name2'},
            ],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const body = screen.getByTestId('seat-management-body-text')
      expect(body).toHaveTextContent(
        '@user1 and 1 more member are waiting for access to Copilot. To maximize your developer velocity using AI, enable Copilot in your organization to give members access.',
      )
      expect(screen.queryByText('Assign Copilot seats')).not.toBeInTheDocument()

      const user = screen.getByTestId('seat-requester-name-hover-1')
      expect(user).toHaveTextContent('@user1')
      const avatars = screen.getAllByTestId('seat-requester-avatar')
      expect(avatars.length).toBe(2)
    })

    test('displays correct text when there are 6 pending requests', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.Disabled}
          organization={copilotOrg}
          pendingRequests={{
            count: 6,
            requesters: [
              {id: 1, display_login: 'user1', profile_name: 'name1'},
              {id: 2, display_login: 'user2', profile_name: 'name2'},
              {id: 3, display_login: 'user3', profile_name: 'name3'},
              {id: 4, display_login: 'user4', profile_name: 'name4'},
              {id: 5, display_login: 'user5', profile_name: 'name5'},
              {id: 6, display_login: 'user6', profile_name: 'name6'},
            ],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const body = screen.getByTestId('seat-management-body-text')
      expect(body).toHaveTextContent(
        '@user1 and 5 more members are waiting for access to Copilot. To maximize your developer velocity using AI, enable Copilot in your organization to give members access.',
      )
      expect(screen.queryByText('Assign Copilot seats')).not.toBeInTheDocument()

      const user = screen.getByTestId('seat-requester-name-hover-1')
      expect(user).toHaveTextContent('@user1')
      const avatars = screen.getAllByTestId('seat-requester-avatar')
      expect(avatars.length).toBe(4)
    })
  })

  describe('when Copilot is enabled for selected seats', () => {
    test('Renders the correct copy and a CTA to add seats', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      expect(screen.getByText('No seats assigned')).toBeInTheDocument()
      expect(screen.getByText('Assign Copilot seats')).toBeInTheDocument()

      const avatar = screen.queryByTestId('seat-requester-avatar-stack')
      expect(avatar).not.toBeInTheDocument()
    })

    test('displays correct text when zero pending request', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          pendingRequests={{
            count: 0,
            requesters: [],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      expect(
        screen.getByText(
          'No members are using GitHub Copilot in this organization. To maximize your developer velocity using AI, start assigning seats to users.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('Assign Copilot seats')).toBeInTheDocument()

      const avatar = screen.queryByTestId('seat-requester-avatar-stack')
      expect(avatar).not.toBeInTheDocument()
    })

    test('displays correct text when one pending request', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          pendingRequests={{
            count: 1,
            requesters: [{id: 1, display_login: 'user1', profile_name: 'name'}],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const body = screen.getByTestId('seat-management-body-text')
      expect(body).toHaveTextContent(
        '@user1 is waiting for access to Copilot. Review their requests to offer members in your organization access to Copilot.',
      )
      expect(screen.getByText('Review access requests')).toBeInTheDocument()
      expect(screen.getByText('Assign Copilot seats')).toBeInTheDocument()

      const user = screen.getByTestId('seat-requester-name-hover-1')
      expect(user).toHaveTextContent('@user1')
      const avatars = screen.getAllByTestId('seat-requester-avatar')
      expect(avatars.length).toBe(1)
    })

    test('displays correct text when there are 2 pending requests', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          pendingRequests={{
            count: 2,
            requesters: [
              {id: 1, display_login: 'user1', profile_name: 'name1'},
              {id: 2, display_login: 'user2', profile_name: 'name2'},
            ],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const body = screen.getByTestId('seat-management-body-text')
      expect(body).toHaveTextContent(
        '@user1 and 1 more member are waiting for access to Copilot. Review their requests to offer members in your organization access to Copilot.',
      )
      expect(screen.getByText('Review access requests')).toBeInTheDocument()
      expect(screen.getByText('Assign Copilot seats')).toBeInTheDocument()

      const user = screen.getByTestId('seat-requester-name-hover-1')
      expect(user).toHaveTextContent('@user1')
      const avatars = screen.getAllByTestId('seat-requester-avatar')
      expect(avatars.length).toBe(2)
    })

    test('displays correct text when there are 6 pending requests', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          pendingRequests={{
            count: 6,
            requesters: [
              {id: 1, display_login: 'user1', profile_name: 'name1'},
              {id: 2, display_login: 'user2', profile_name: 'name2'},
              {id: 3, display_login: 'user3', profile_name: 'name3'},
              {id: 4, display_login: 'user4', profile_name: 'name4'},
              {id: 5, display_login: 'user5', profile_name: 'name5'},
              {id: 6, display_login: 'user6', profile_name: 'name6'},
            ],
          }}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const body = screen.getByTestId('seat-management-body-text')
      expect(body).toHaveTextContent(
        '@user1 and 5 more members are waiting for access to Copilot. Review their requests to offer members in your organization access to Copilot.',
      )
      expect(screen.getByText('Review access requests')).toBeInTheDocument()
      expect(screen.getByText('Assign Copilot seats')).toBeInTheDocument()

      const user = screen.getByTestId('seat-requester-name-hover-1')
      expect(user).toHaveTextContent('@user1')
      const avatars = screen.getAllByTestId('seat-requester-avatar')
      expect(avatars.length).toBe(4)
    })

    test('calls setPreselectRequesters(false)', () => {
      const preselect = jest.fn()
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          pendingRequests={{
            count: 1,
            requesters: [{id: 1, display_login: 'user1', profile_name: 'name1'}],
          }}
          setPreselectRequesters={preselect}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const button = screen.getByText('Assign Copilot seats')
      fireEvent.click(button)
      expect(preselect).toHaveBeenCalledWith(false)
    })

    test('calls setPreselectRequesters(true)', () => {
      const preselect = jest.fn()
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForSelected}
          organization={copilotOrg}
          pendingRequests={{
            count: 1,
            requesters: [{id: 1, display_login: 'user1', profile_name: 'name1'}],
          }}
          setPreselectRequesters={preselect}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )
      const button = screen.getByText('Review access requests')
      fireEvent.click(button)
      expect(preselect).toHaveBeenCalledWith(true)
    })
  })

  describe('when Copilot is enabled for all seats', () => {
    test('Renders the correct copy and no CTA to add seats', () => {
      render(
        <NoMemberAccessBlankslate
          onClick={mockOnClick}
          policy={CopilotForBusinessSeatPolicy.EnabledForAll}
          organization={copilotOrg}
          setPreselectRequesters={jest.fn()}
          currentPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setCurrentPolicy={jest.fn()}
          selectedPolicy={CopilotForBusinessSeatPolicy.Disabled}
          setSelectedPolicy={jest.fn()}
          seatCount={2}
          setPayload={jest.fn()}
          seatBreakdown={seatBreakdown}
          setPolicyChangeIntent={jest.fn()}
          policyChangeIntent={null}
          membersCount={1}
          businessTrial={undefined}
          nextBillingDate={'2022-01-01'}
          planText={'Business'}
        />,
      )

      expect(screen.getByText('No seats assigned')).toBeInTheDocument()
      expect(screen.queryByText('Assign Copilot seats')).not.toBeInTheDocument()
    })
  })
})

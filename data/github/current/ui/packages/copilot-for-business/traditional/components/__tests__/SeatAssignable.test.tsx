import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {
  UserSeat,
  UserSeatNoDisplayName,
  TeamSeat,
  UserInviteSeat,
  EmailInviteSeat,
  EnterpriseTeamSeat,
} from '../../../test-utils/mock-data'
import SeatAssignable from '../SeatAssignable'

describe('SeatAssignable', () => {
  describe('When rendering a User seat', () => {
    test('Renders the user name hovercard with the correct links', () => {
      render(<SeatAssignable seat={UserSeat} owner="blah" />)
      const hovercard = screen.getByTestId(`seat-assignable-name-hover-${UserSeat.assignable.id}`)
      expect(hovercard).toHaveAttribute('href', `/orgs/blah/people/${UserSeat.assignable.login}`)
      expect(hovercard).toHaveAttribute('data-hovercard-url', `/users/${UserSeat.assignable.login}/hovercard`)
    })

    test('Renders the user avatar hovercard with the correct link', () => {
      render(<SeatAssignable seat={UserSeat} owner="blah" />)
      const hovercard = screen.getByTestId('seat-assignable-avatar-hover')
      expect(hovercard).toHaveAttribute('href', `/orgs/blah/people/${UserSeat.assignable.login}`)
      expect(hovercard).toHaveAttribute('data-hovercard-url', `/users/${UserSeat.assignable.login}/hovercard`)
    })

    describe('When the user has a display_name', () => {
      test("Renders the user's display_name", () => {
        render(<SeatAssignable seat={UserSeat} owner="blah" />)
        const assignable = screen.getByTestId(`seat-assignable-name-hover-${UserSeat.assignable.id}`)
        expect(assignable).toHaveTextContent(`@${UserSeat.assignable.login}`)
      })

      test("Renders subtext with the user's login", () => {
        render(<SeatAssignable seat={UserSeat} owner="blah" />)
        const assignable = screen.getByTestId('seat-assignable-subtext')
        expect(assignable).toHaveTextContent(UserSeat.assignable.display_name as string)
      })
    })

    describe('When the user does not have a display_name', () => {
      test("Renders the user's login", () => {
        render(<SeatAssignable seat={UserSeatNoDisplayName} owner="blah" />)
        const assignable = screen.getByTestId(`seat-assignable-name-hover-${UserSeatNoDisplayName.assignable.id}`)
        expect(assignable).toHaveTextContent(UserSeatNoDisplayName.assignable.login as string)
      })

      test('Does not render subtext', () => {
        render(<SeatAssignable seat={UserSeatNoDisplayName} owner="blah" />)
        const assignable = screen.queryByTestId('seat-assignable-subtext')
        expect(assignable).not.toBeInTheDocument()
      })
    })
  })

  describe('When rendering a Team seat', () => {
    test('Renders the team name hovercard with the correct links', () => {
      render(<SeatAssignable seat={TeamSeat} owner="blah" />)
      const hovercard = screen.getByTestId(`seat-assignable-name-hover-${TeamSeat.assignable.id}`)
      expect(hovercard).toHaveAttribute('href', `/orgs/blah/teams/${TeamSeat.assignable.slug}`)
      expect(hovercard).toHaveAttribute('data-hovercard-url', `/orgs/blah/teams/${TeamSeat.assignable.slug}/hovercard`)
    })

    test('Renders the team avatar hovercard with the correct link', () => {
      render(<SeatAssignable seat={TeamSeat} owner="blah" />)
      const hovercard = screen.getByTestId('seat-assignable-avatar-hover')
      expect(hovercard).toHaveAttribute('href', `/orgs/blah/teams/${TeamSeat.assignable.slug}`)
      expect(hovercard).toHaveAttribute('data-hovercard-url', `/orgs/blah/teams/${TeamSeat.assignable.slug}/hovercard`)
    })
  })

  describe('When rendering an EnterpriseTeam seat', () => {
    test('Renders the enterprise team name hovercard with the correct link', () => {
      render(<SeatAssignable seat={EnterpriseTeamSeat} owner="blah" />)

      const link = screen.getByRole('link', {name: EnterpriseTeamSeat.assignable.login})
      expect(link).toHaveAttribute('href', `/enterprises/blah/teams/${EnterpriseTeamSeat.assignable.slug}/members`)
    })
  })

  describe('When rendering an OrganizationInvitation seat', () => {
    describe('When the invite has an invitee user', () => {
      test('Renders the team name hovercard with the correct links', () => {
        render(<SeatAssignable seat={UserInviteSeat} owner="blah" />)
        const hovercard = screen.getByTestId(`seat-assignable-name-hover-${UserInviteSeat.assignable.id}`)
        expect(hovercard).toHaveAttribute('href', `/${UserInviteSeat.assignable.invitee!.login}`)
        expect(hovercard).toHaveAttribute(
          'data-hovercard-url',
          `/users/${UserInviteSeat.assignable.invitee!.login}/hovercard`,
        )
      })

      test('Renders the team avatar hovercard with the correct link', () => {
        render(<SeatAssignable seat={UserInviteSeat} owner="blah" />)
        const hovercard = screen.getByTestId('seat-assignable-avatar-hover')
        expect(hovercard).toHaveAttribute('href', `/${UserInviteSeat.assignable.invitee!.login}`)
        expect(hovercard).toHaveAttribute(
          'data-hovercard-url',
          `/users/${UserInviteSeat.assignable.invitee!.login}/hovercard`,
        )
      })
    })

    describe('When the invite does not have an invitee user and instead invites via email', () => {
      test('Renders the mail icon', () => {
        render(<SeatAssignable seat={EmailInviteSeat} owner="blah" />)
        const mailIcon = screen.getByTestId('seat-assignable-invite-mail-icon')
        expect(mailIcon).toBeInTheDocument()
      })

      test('Renders the team name hovercard with the correct links', () => {
        render(<SeatAssignable seat={EmailInviteSeat} owner="blah" />)
        const email = screen.getByTestId(`seat-assignable-invite-email-${EmailInviteSeat.assignable.id}`)
        expect(email).toHaveTextContent(EmailInviteSeat.assignable.email as string)
      })

      test('Does not render hovercards', () => {
        render(<SeatAssignable seat={EmailInviteSeat} owner="blah" />)
        const nameHovercard = screen.queryByTestId('seat-assignable-name-hover')
        expect(nameHovercard).not.toBeInTheDocument()
        const avatarHovercard = screen.queryByTestId('seat-assignable-avatar-hover')
        expect(avatarHovercard).not.toBeInTheDocument()
      })
    })
  })
})

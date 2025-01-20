/* eslint eslint-comments/no-use: off */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {render, type User} from '@github-ui/react-core/test-utils'
import {mockFetch} from '@github-ui/mock-fetch'

import {AddMembersDialog, type AddMembersDialogProps} from '../AddMembersDialog'
import type {CopilotForBusinessTrial, InvitationAssignable, TeamAssignable, UserAssignable} from '../../../types'
import {SeatType} from '../../../types'
import {COPILOT_BUSINESS_LICENSE_COST} from '../../../constants'
import {currency} from '@github-ui/formatters'
import {id} from '../../../helpers/id'
import {PendingCancellationUser, getSeatManagementRoutePayload} from '../../../test-utils/mock-data'

jest.setTimeout(60_000)

const confirmPurchaseMock = jest.fn()
const onDismissMock = jest.fn()

const cancelledUser: UserAssignable = {
  id: 100,
  display_login: 'cancelled',
  profile_name: 'The Cancelled',
  org_member: true,
  avatar_url: 'https://avatars.githubusercontent.com/u/0?v=4',
  type: SeatType.User,
}
const orgMember: UserAssignable = {
  id: 666,
  avatar_url: '',
  display_login: 'buddy',
  org_member: true,
  profile_name: 'buddy',
  type: SeatType.User,
}

const otherOrgMember: UserAssignable = {
  id: 667,
  avatar_url: '',
  display_login: 'buddy-two',
  org_member: true,
  profile_name: 'buddy-two',
  type: SeatType.User,
}

const pendingInvitee: InvitationAssignable = {
  id: 1,
  type: SeatType.OrganizationInvitation,
  display_login: 'invitee@emails.biz',
  org_member: false,
}

const orgTeamMember: UserAssignable = {
  id: 2,
  avatar_url: '',
  display_login: 'other-buddy',
  org_member: true,
  profile_name: 'other-buddy',
  type: SeatType.User,
}

const team2: TeamAssignable = {
  id: 10,
  avatar_url: '',
  name: 'awesome-team',
  type: SeatType.Team,
  slug: 'awesome-team',
  org_member: true,
  member_ids: [2, 3],
}

const emptyTeam: TeamAssignable = {
  id: 2,
  avatar_url: '',
  name: 'empty-team',
  type: SeatType.Team,
  slug: 'empty-team',
  org_member: true,
  member_ids: [],
}

const allAssignables = [orgMember, otherOrgMember, pendingInvitee, orgTeamMember, team2, emptyTeam]
const clickAllAssignables = async (user: User) => {
  let clickables: HTMLElement[] = []
  await waitFor(async () => {
    const checkboxes = await screen.findAllByRole('checkbox')
    clickables = checkboxes.filter(box => !(box as HTMLInputElement).disabled)
  })

  for (const clickable of clickables) {
    user.click(clickable)
  }

  return clickables
}

const emptyLicenses = {user_ids: [], team_ids: [], invite_user_ids: [], invite_emails: []}

const getUniqueMemberCount = (assignables: Array<UserAssignable | InvitationAssignable | TeamAssignable>): number => {
  const userIds = []
  for (const seat of assignables) {
    if (seat.type === SeatType.Team) {
      userIds.push(...seat.member_ids)
    } else if (seat.type === SeatType.User) {
      userIds.push(seat.id)
    }
  }
  return new Set(userIds).size
}

function renderAddMembersDialog(props: Partial<AddMembersDialogProps> = {}) {
  return render(
    <AddMembersDialog
      confirmPurchase={confirmPurchaseMock}
      onDismiss={onDismissMock}
      isOpen={true}
      organization="cool-org"
      totalSeatBillingCount={0}
      businessTrial={undefined}
      licenses={emptyLicenses}
      planText="Business"
      {...props}
    />,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.unmock('../../hooks/use-copilot-settings-api')
})

describe('<AddMembersDialog />', () => {
  describe('when first opening', () => {
    beforeEach(() => {
      mockFetch.mockRouteOnce('/organizations/cool-org/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [],
        total: 1,
      })
    })

    test('renders org member selection by default', async () => {
      renderAddMembersDialog()

      await waitFor(async () => {
        const expectedNavEl = await screen.findByTestId('nav-search')
        expect(expectedNavEl.getAttribute('aria-current')).toBeTruthy()
      })

      await waitFor(async () => {
        const mainEl = screen.getByTestId('org-assignables-list')
        expect(mainEl).toBeInTheDocument()
      })

      await waitFor(async () => {
        const continueBtn = await screen.findByText('Continue to purchase')
        expect(continueBtn as HTMLButtonElement).not.toBeDisabled()
      })

      const estimatedPriceText = screen.queryByTestId('estimated-cost-display')
      expect(estimatedPriceText).toBeNull()
    })

    test('switches between upload types using nav', async () => {
      renderAddMembersDialog()

      let navEl: HTMLElement | null = null
      await waitFor(async () => {
        navEl = await screen.findByTestId('nav-upload-csv')
      })

      fireEvent.click(navEl!)

      await waitFor(async () => {
        expect(await screen.findByTestId('upload-csv-form')).toBeInTheDocument()
      })
    })
  })

  describe('with member feature requests', () => {
    beforeEach(() => {
      mockFetch.mockRouteOnce('/organizations/cool-org/settings/copilot/members?page=1&sort=requested_at_desc&q=', {
        assignables: [orgMember, otherOrgMember],
        total: 2,
      })
    })

    test('preselect checkboxes if there are requests', async () => {
      const requester = {id: 666, display_login: 'buddy', profile_name: 'buddy'}
      renderAddMembersDialog({pendingRequesters: [requester]})

      let checkboxes: HTMLElement[] = []
      await waitFor(async () => {
        checkboxes = await screen.findAllByRole('checkbox')
      })
      expect(checkboxes.length).toBe(2)
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()
    })

    test('sort by requested_at_desc', async () => {
      const requester1 = {id: 666, display_login: 'buddy', profile_name: 'buddy', requested_at: '2021-01-02'}
      const requester2 = {id: 667, display_login: 'buddy-two', profile_name: 'buddy-two', requested_at: '2021-01-01'}
      renderAddMembersDialog({pendingRequesters: [requester1, requester2]})

      let assignables: HTMLElement[] = []
      await waitFor(async () => {
        assignables = await screen.findAllByTestId(/assignable-list-item/)
      })
      expect(assignables.length).toBe(2)
      expect(assignables[0]).toHaveTextContent(/buddy/)
      expect(assignables[1]).toHaveTextContent(/buddy-two/)
    })
  })

  describe('selecting users', () => {
    beforeEach(() => {
      mockFetch.mockRouteOnce('/organizations/cool-org/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: allAssignables,
        total: allAssignables.length,
      })
    })

    test('assignables display correctly', async () => {
      renderAddMembersDialog()

      await waitFor(async () => {
        const teamItem = screen.getByTestId(`assignable-list-item-${id(team2)}`)
        expect(teamItem).toHaveTextContent(/Team with 2 members/)
      })
    })

    test.skip('updates UI when an assignable is selected', async () => {
      const {user} = renderAddMembersDialog()

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      const totalNumbers = getUniqueMemberCount(allAssignables)

      await waitFor(async () => {
        const estimatedPriceText = screen.getByTestId('estimated-cost-display')
        const expectedText = `${totalNumbers} seats with an approximate cost of ${currency(
          totalNumbers * COPILOT_BUSINESS_LICENSE_COST,
        )}`
        expect(estimatedPriceText.textContent).toBe(expectedText)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
        expect(continueBtn as HTMLButtonElement).not.toBeDisabled()
      })
    })

    test.skip('updates UI when assignables are selected during a Copilt Business trial', async () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      const {user} = renderAddMembersDialog({businessTrial: trial})

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      const totalNumbers = getUniqueMemberCount(allAssignables)

      await waitFor(async () => {
        const estimatedPriceText = screen.getByTestId('estimated-cost-display')
        const expectedText = `${totalNumbers} seats with an approximate cost of ${currency(0)} (Free until `
        expect(estimatedPriceText.textContent).toContain(expectedText)
      })

      let continueBtn: HTMLElement | null = null
      continueBtn = await screen.findByText('Continue to purchase')
      expect(continueBtn as HTMLButtonElement).not.toBeDisabled()
    })

    test.skip('shows the estimated cost appropriately when assignables are selected during a Copilot Enterprise trial', async () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial

      const {user} = renderAddMembersDialog({businessTrial: trial})

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      const totalNumbers = getUniqueMemberCount(allAssignables)

      await waitFor(async () => {
        const estimatedPriceText = screen.getByTestId('estimated-cost-display')
        const expectedText = `${totalNumbers} seats with an approximate cost of ${currency(
          totalNumbers * COPILOT_BUSINESS_LICENSE_COST,
        )}`
        expect(estimatedPriceText.textContent).toContain(expectedText)
      })

      let continueBtn: HTMLElement | null = null
      continueBtn = await screen.findByText('Continue to purchase')
      expect(continueBtn as HTMLButtonElement).not.toBeDisabled()
    })

    test.skip('can navigate between selection and confirmation dialogs when items are selected', async () => {
      const {user} = renderAddMembersDialog()

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
        expect(continueBtn as HTMLButtonElement).not.toBeDisabled()
      })

      await user.click(continueBtn!)

      let finishBtn: HTMLElement | null = null
      let backBtn: HTMLElement | null = null
      await waitFor(async () => {
        finishBtn = await screen.findByRole('button', {name: 'Purchase 4 seats'})
        backBtn = await screen.findByRole('button', {name: 'Back'})

        expect(finishBtn).toBeInTheDocument()
        expect(backBtn).toBeInTheDocument()
      })

      await user.click(backBtn!)

      await waitFor(async () => {
        expect(await screen.findByTestId('org-assignables-list')).toBeInTheDocument()
      })
      await waitFor(async () => {
        expect(await screen.findByTestId('org-assignables-list')).toBeInTheDocument()
        expect(screen.queryByText('Confirm seats purchase')).not.toBeInTheDocument()
      })
    })

    test.skip('can click through to finish seat assignments', async () => {
      // We need to do this because the final fetch call updates state of a component,
      // and we don't have anything else to wait for
      jest.spyOn(console, 'error').mockImplementation()
      const {user} = renderAddMembersDialog()

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      let finishBtn: HTMLElement | null = null

      await waitFor(async () => {
        finishBtn = await screen.findByRole('button', {name: 'Purchase 4 seats'})
      })

      const payload = getSeatManagementRoutePayload()
      mockFetch.mockRouteOnce('/organizations/cool-org/settings/copilot/seats/create', payload)

      fireEvent.click(finishBtn!)

      expect(mockFetch.fetch).toHaveBeenCalledWith('/organizations/cool-org/settings/copilot/seats/create', {
        method: 'POST',
        body: JSON.stringify({
          teams: [team2.name, emptyTeam.name],
          users: [
            orgMember.display_login,
            otherOrgMember.display_login,
            pendingInvitee.display_login,
            orgTeamMember.display_login,
          ],
        }),
        signal: new AbortController().signal,
        headers: expect.any(Object),
      })

      await waitFor(async () => {
        expect(confirmPurchaseMock).toHaveBeenCalledWith(payload)
      })
    })

    test.skip('renders $19 for cost per seat when on Copilot Business plan', async () => {
      const {user} = renderAddMembersDialog()

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      expect(await screen.findByText('Estimated monthly cost is $76.00 ($19/month each seat).')).toBeInTheDocument()
    })

    test.skip('renders $39 for cost per seat when on Copilot Enterprise plan', async () => {
      const {user} = renderAddMembersDialog({planText: 'Enterprise'})

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      expect(await screen.findByText('Estimated monthly cost is $156.00 ($39/month each seat).')).toBeInTheDocument()
    })

    test.skip('renders free for cost per seat when on Copilot Business trial', async () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'business',
      } as CopilotForBusinessTrial
      const {user} = renderAddMembersDialog({businessTrial: trial})

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      await screen.findByText('Cost per seat')
      expect(screen.queryByTestId('add-members-cost-per-seat-datum')).toHaveTextContent('Free')
    })

    test.skip('renders $19 for cost per seat when on Copilot Enterprise trial', async () => {
      const trial = {
        has_trial: true,
        copilot_plan: 'enterprise',
      } as CopilotForBusinessTrial
      const {user} = renderAddMembersDialog({businessTrial: trial, planText: 'Enterprise'})

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      await screen.findByText('Cost per seat')
      expect(screen.queryByTestId('add-members-cost-per-seat-datum')).toHaveTextContent('$19.00')
    })

    test('only counts a user once when that user is also in a team', async () => {
      renderAddMembersDialog()
      const idPrefixes = [`Team-${team2.id}`, `User-${orgTeamMember.id}`]
      await Promise.all(
        idPrefixes.map(async idPrefix => {
          const clickable = await screen.findByTestId(`${idPrefix}-checkbox`)
          fireEvent.click(clickable)
        }),
      )

      const costDisplay = screen.getByTestId('estimated-cost-display').textContent
      expect(costDisplay).toContain('2 seats')
      expect(costDisplay).toContain('with an approximate cost of')
      expect(costDisplay).toContain('$38.00')

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      expect(screen.getByTestId('confirmation-messages-2-members').textContent).toContain('2 members')
      expect(screen.queryByTestId('add-member-seat-count')).not.toBeInTheDocument()
      expect(screen.queryByTestId('add-member-seat-breakdown')).not.toBeInTheDocument()
    })

    test('count is correct when adding a team with members who already have seats', async () => {
      renderAddMembersDialog({totalSeatBillingCount: 1, licenses: {...emptyLicenses, user_ids: [orgTeamMember.id]}})
      const clickable = await screen.findByTestId(`Team-${team2.id}-checkbox`)
      fireEvent.click(clickable)

      const costDisplay = screen.getByTestId('estimated-cost-display').textContent
      expect(costDisplay).toContain('1 seat')
      expect(costDisplay).toContain('with an approximate cost of')
      expect(costDisplay).toContain('$19.00')

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      expect(screen.getByTestId('add-member-seat-count').textContent).toContain('2')
      expect(screen.getByTestId('add-member-seat-breakdown').textContent).toContain('(1 existing 1 new)')
    })

    test('display is correct when a team has no members', async () => {
      renderAddMembersDialog()
      const clickable = await screen.findByTestId(`Team-${emptyTeam.id}-checkbox`)
      fireEvent.click(clickable)

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      expect(screen.getByTestId('confirmation-messages-0-members').textContent).toContain('0')
      expect(screen.queryByTestId('add-member-seat-count')).not.toBeInTheDocument()
      expect(screen.queryByTestId('add-member-seat-breakdown')).not.toBeInTheDocument()
    })
  })

  describe('re-adding cancelled users', () => {
    beforeEach(() => {
      mockFetch.mockRouteOnce('/organizations/cool-org/settings/copilot/members?page=1&sort=name_asc&q=', {
        assignables: [cancelledUser],
        total: 1,
      })
    })

    test("count of new seats is correct when readding a user who's was previously cancelled", async () => {
      const {user} = renderAddMembersDialog({
        totalSeatBillingCount: 1,
        licenses: {...emptyLicenses, user_ids: [PendingCancellationUser.id]},
      })

      await waitFor(async () => {
        await clickAllAssignables(user)
      })

      let continueBtn: HTMLElement | null = null
      await waitFor(async () => {
        continueBtn = await screen.findByText('Continue to purchase')
      })

      fireEvent.click(continueBtn!)

      await waitFor(async () => {
        const seatCount = await screen.findByText(/(1 existing 0 new)/)
        expect(seatCount).toBeInTheDocument()
      })
    })
  })
})

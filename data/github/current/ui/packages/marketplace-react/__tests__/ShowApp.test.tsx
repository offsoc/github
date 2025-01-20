import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'
import {ShowApp} from '../routes/ShowApp'
import {getShowAppRoutePayload, mockAppListing, mockPlanInfo} from '../test-utils/mock-data'
import {TagSectionIdentifier} from '../components/legacy/TagSection'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

jest.mock('@github-ui/react-core/use-feature-flag')
function mockUseFeatureFlag(flag: string, value: boolean): void {
  ;(useFeatureFlag as jest.Mock).mockImplementation(flagName => flagName === flag && value)
}

describe('ShowApp', () => {
  describe('when the marketplace_layout_redesign flag is disabled', () => {
    test('Renders the legacy ShowApp page with relevant listing info', () => {
      const routePayload = getShowAppRoutePayload()
      render(<ShowApp />, {
        routePayload,
      })
      expect(screen.getByRole('heading', {level: 1})).toHaveTextContent(routePayload.listing.name)
      expect(screen.getByRole('img', {name: routePayload.listing.name})).toHaveAttribute(
        'src',
        routePayload.listing.listingLogoUrl,
      )
      expect(screen.getByRole('link', {name: routePayload.listing.ownerLogin})).toHaveAttribute(
        'href',
        `/${routePayload.listing.ownerLogin}`,
      )
      expect(screen.getByTestId('short-description')).toHaveTextContent(routePayload.listing.shortDescription || '')
      expect(screen.getByTestId('description')).toHaveTextContent(routePayload.listing.fullDescription || '')
      expect(screen.getByTestId('description')).toHaveTextContent(routePayload.listing.extendedDescription || '')
      expect(screen.getByTestId('legacy-app-listing')).toBeInTheDocument()
      expect(screen.queryByTestId('app-listing')).not.toBeInTheDocument()
    })

    describe('sidebar', () => {
      describe('about section', () => {
        test('does not render if the app does not have a verified owner or a verified domain', () => {
          const routePayload = getShowAppRoutePayload({
            listing: mockAppListing({isVerifiedOwner: false}),
            verified_domain: undefined,
          })
          render(<ShowApp />, {routePayload})

          expect(screen.queryByRole('heading', {name: 'About'})).not.toBeInTheDocument()
        })

        test('renders if the app has a verified owner', () => {
          const routePayload = getShowAppRoutePayload({
            listing: mockAppListing({isVerifiedOwner: true}),
            verified_domain: undefined,
          })
          render(<ShowApp />, {routePayload})

          expect(screen.getByRole('heading', {name: 'About'})).toBeInTheDocument()
          expect(
            screen.getByText(
              'GitHub has verified that the publisher controls the domain and meets other requirements.',
            ),
          ).toBeInTheDocument()
        })

        test('renders if the app has a verified domain', () => {
          const routePayload = getShowAppRoutePayload({
            listing: mockAppListing({isVerifiedOwner: false}),
            verified_domain: 'www.verified-domain.com',
          })
          render(<ShowApp />, {routePayload})

          expect(screen.getByRole('heading', {name: 'About'})).toBeInTheDocument()
          expect(screen.getByRole('link', {name: 'www.verified-domain.com'})).toBeInTheDocument()
        })

        test('renders if the app is a Copilot extension', () => {
          const routePayload = getShowAppRoutePayload({
            listing: mockAppListing({copilotApp: true}),
            verified_domain: undefined,
          })
          render(<ShowApp />, {routePayload})

          expect(screen.getByRole('heading', {name: 'About'})).toBeInTheDocument()
          expect(screen.getByRole('link', {name: 'GitHub Copilot'})).toHaveAttribute(
            'href',
            'https://github.com/features/copilot/plans',
          )
          expect(
            screen.getByText('An Admin must enable access for organization or enterprise use.'),
          ).toBeInTheDocument()
        })
      })

      describe('tag sections', () => {
        test('renders each of the sections when there is data for everything', () => {
          const routePayload = getShowAppRoutePayload()
          render(<ShowApp />, {routePayload})

          const sections = screen.getAllByRole('heading', {level: 3})
          expect(sections[0]).toHaveTextContent(TagSectionIdentifier.Category)
          expect(sections[1]).toHaveTextContent(TagSectionIdentifier.SupportedLanguages)
          expect(sections[2]).toHaveTextContent(TagSectionIdentifier.Customers)
          expect(sections[3]).toHaveTextContent(TagSectionIdentifier.FromTheDeveloper)
        })

        test('does not render the languages section when there are no supported languages', () => {
          const routePayload = getShowAppRoutePayload({supported_languages: []})
          render(<ShowApp />, {routePayload})

          const sections = screen.getAllByRole('heading', {level: 3})
          expect(sections[0]).toHaveTextContent(TagSectionIdentifier.Category)
          expect(sections[1]).toHaveTextContent(TagSectionIdentifier.Customers)
          expect(sections[2]).toHaveTextContent(TagSectionIdentifier.FromTheDeveloper)
          expect(screen.queryByText(TagSectionIdentifier.SupportedLanguages)).not.toBeInTheDocument()
        })

        test('does not render the customer section when there are no featured customers', () => {
          const routePayload = getShowAppRoutePayload({customers: []})
          render(<ShowApp />, {routePayload})

          const sections = screen.getAllByRole('heading', {level: 3})
          expect(sections[0]).toHaveTextContent(TagSectionIdentifier.Category)
          expect(sections[1]).toHaveTextContent(TagSectionIdentifier.SupportedLanguages)
          expect(sections[2]).toHaveTextContent(TagSectionIdentifier.FromTheDeveloper)
          expect(screen.queryByText(TagSectionIdentifier.Customers)).not.toBeInTheDocument()
        })
      })
    })

    describe('header actions', () => {
      describe('setup button', () => {
        test('hides the setup button when the viewer has purchased the app for themselves and all organizations', () => {
          const routePayload = getShowAppRoutePayload({
            plan_info: mockPlanInfo({viewer_has_purchased: true, viewer_has_purchased_for_all_organizations: true}),
          })
          render(<ShowApp />, {
            routePayload,
          })

          expect(screen.queryByTestId('setup-button')).not.toBeInTheDocument()
        })

        test('shows the setup button when the viewer has purchased the app for themselves but not all organizations', () => {
          const routePayload = getShowAppRoutePayload({
            plan_info: mockPlanInfo({viewer_has_purchased: true, viewer_has_purchased_for_all_organizations: false}),
          })
          render(<ShowApp />, {
            routePayload,
          })

          expect(screen.getByTestId('setup-button')).toHaveTextContent('Add')
        })

        test('shows the setup button when the viewer has not purchased the app for themselves but has for some orgs', () => {
          const routePayload = getShowAppRoutePayload({
            plan_info: mockPlanInfo({
              viewer_has_purchased: false,
              viewer_has_purchased_for_all_organizations: true,
              any_orgs_purchased: true,
            }),
          })
          render(<ShowApp />, {
            routePayload,
          })

          expect(screen.getByTestId('setup-button')).toHaveTextContent('Add')
        })

        test('shows the setup button when the viewer has not purchased the app for themselves or any orgs', () => {
          const routePayload = getShowAppRoutePayload({
            plan_info: mockPlanInfo({
              viewer_has_purchased: false,
              viewer_has_purchased_for_all_organizations: false,
              any_orgs_purchased: false,
            }),
          })
          render(<ShowApp />, {
            routePayload,
          })

          expect(screen.getByTestId('setup-button')).toHaveTextContent('Set up a free trial')
        })
      })

      describe('action menu', () => {
        describe('when the viewer has not purchased for themselves, any orgs, has not installed, and cannot edit the listing', () => {
          test('hides the action menu', () => {
            const routePayload = getShowAppRoutePayload()
            render(<ShowApp />, {routePayload})

            expect(screen.queryByTestId('listing-actions')).not.toBeInTheDocument()
          })
        })

        describe('when the viewer has purchased for themselves', () => {
          test('shows the action menu with an option to edit the current plan', () => {
            const routePayload = getShowAppRoutePayload({plan_info: mockPlanInfo({viewer_has_purchased: true})})
            render(<ShowApp />, {routePayload})

            const actionMenu = screen.getByTestId('listing-actions')
            expect(actionMenu).toBeInTheDocument()
            fireEvent.click(screen.getByTestId('listing-actions-button'))
            expect(screen.getByText('Edit current plan')).toBeInTheDocument()
            expect(screen.queryByText('Configure account access')).not.toBeInTheDocument()
            expect(screen.queryByText('Manage app listing')).not.toBeInTheDocument()
          })
        })

        describe('when the viewer has purchased for some of their orgs', () => {
          test('shows the action menu with an option to edit the current plan', () => {
            const routePayload = getShowAppRoutePayload({
              plan_info: mockPlanInfo({any_orgs_purchased: true}),
            })
            render(<ShowApp />, {routePayload})

            const actionMenu = screen.getByTestId('listing-actions')
            expect(actionMenu).toBeInTheDocument()
            fireEvent.click(screen.getByTestId('listing-actions-button'))
            expect(screen.getByText('Edit current plan')).toBeInTheDocument()
            expect(screen.queryByText('Configure account access')).not.toBeInTheDocument()
            expect(screen.queryByText('Manage app listing')).not.toBeInTheDocument()
          })
        })

        describe('when the viewer has installed the app', () => {
          test('shows the action menu with an option to configure account access', () => {
            const routePayload = getShowAppRoutePayload({
              plan_info: mockPlanInfo({installed_for_viewer: true}),
            })
            render(<ShowApp />, {routePayload})

            const actionMenu = screen.getByTestId('listing-actions')
            expect(actionMenu).toBeInTheDocument()
            fireEvent.click(screen.getByTestId('listing-actions-button'))
            expect(screen.queryByText('Edit current plan')).not.toBeInTheDocument()
            expect(screen.getByText('Configure account access')).toBeInTheDocument()
            expect(screen.queryByText('Manage app listing')).not.toBeInTheDocument()
          })
        })

        describe('when the viewer can edit the app', () => {
          test('shows the action menu with an option to manage the listing', () => {
            const routePayload = getShowAppRoutePayload({user_can_edit: true})
            render(<ShowApp />, {routePayload})

            const actionMenu = screen.getByTestId('listing-actions')
            expect(actionMenu).toBeInTheDocument()
            fireEvent.click(screen.getByTestId('listing-actions-button'))
            expect(screen.queryByText('Edit current plan')).not.toBeInTheDocument()
            expect(screen.queryByText('Configure account access')).not.toBeInTheDocument()
            expect(screen.getByText('Manage app listing')).toBeInTheDocument()
          })
        })
      })
    })
  })

  describe('when the marketplace_layout_redesign flag is enabled', () => {
    test('Renders the legacy ShowApp page with relevant listing info', () => {
      mockUseFeatureFlag('marketplace_layout_redesign', true)
      const routePayload = getShowAppRoutePayload()
      render(<ShowApp />, {
        routePayload,
      })
      expect(screen.getByTestId('app-listing')).toBeInTheDocument()
      expect(screen.queryByTestId('legacy-app-listing')).not.toBeInTheDocument()
    })
  })
})

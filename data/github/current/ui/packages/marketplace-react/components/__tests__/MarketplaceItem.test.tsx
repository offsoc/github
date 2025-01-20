import {screen, fireEvent} from '@testing-library/react'
import {sendEvent} from '@github-ui/hydro-analytics'
import MarketplaceItem from '../MarketplaceItem'
import {mockAppListing, mockActionListing} from '../../test-utils/mock-data'
import type {ActionListing, AppListing} from '../../types'
import {renderWithFilterContext} from '../../test-utils/Render'

jest.mock('@github-ui/hydro-analytics', () => {
  return {
    ...jest.requireActual('@github-ui/hydro-analytics'),
    sendEvent: jest.fn(),
  }
})

beforeEach(() => {
  jest.resetAllMocks()
})

const renderComponent = (listing: AppListing | ActionListing, isFeatured: boolean) => {
  renderWithFilterContext(<MarketplaceItem listing={listing} isFeatured={isFeatured} />)
}

describe('MarketplaceItem', () => {
  describe('when rendering an app listing', () => {
    test('renders relevant information about the app', () => {
      const appListing = mockAppListing()
      renderComponent(appListing, false)

      expect(screen.getByText(appListing.name)).toBeInTheDocument()
      expect(screen.getByText(appListing.shortDescription || 'Fail otherwise')).toBeInTheDocument()
      expect(screen.getByTestId('listing-type-label')).toHaveTextContent('App')
      expect(screen.getByTestId('logo')).toHaveStyle({
        backgroundColor: `#${appListing.bgColor}`,
      })
      expect(screen.getByAltText(`${appListing.name} logo`)).toHaveAttribute('src', appListing.listingLogoUrl)
    })

    test('renders non-featured content when isFeatured is false', () => {
      const appListing = mockAppListing()
      renderComponent(appListing, false)

      expect(screen.getByTestId('non-featured-item')).toBeInTheDocument()
      expect(screen.queryByTestId('featured-item')).not.toBeInTheDocument()
      expect(screen.getByTestId('marketplace-item')).toHaveClass('gap-3 p-3')
      expect(screen.getByTestId('marketplace-item')).not.toHaveClass('flex-column p-4')
    })

    test('renders featured content when isFeatured is true', () => {
      const appListing = mockAppListing()
      renderComponent(appListing, true)

      expect(screen.getByTestId('featured-item')).toBeInTheDocument()
      expect(screen.queryByTestId('non-featured-item')).not.toBeInTheDocument()
      expect(screen.getByTestId('marketplace-item')).toHaveClass('flex-column p-4')
      expect(screen.getByTestId('marketplace-item')).not.toHaveClass('gap-3 p-3')
    })

    test('Fires click event on select', () => {
      const sendEventCalls = sendEvent as jest.Mock
      const appListing = mockAppListing()
      renderComponent(appListing, false)

      const link = screen.getByText(appListing.name)
      fireEvent.click(link)

      expect(sendEventCalls.mock.calls.length).toBe(1)
      expect(sendEventCalls.mock.calls[0][0]).toEqual('marketplace_listing_click')
      expect(sendEventCalls.mock.calls[0][1].destination_url).toEqual(`/marketplace/${appListing.slug}`)
      expect(sendEventCalls.mock.calls[0][1].marketplace_listing_id).toEqual(appListing.id)
    })
  })

  describe('when rendering an action listing', () => {
    test('renders relevant information about the action', () => {
      const actionListing = mockActionListing()
      renderComponent(actionListing, false)

      expect(screen.getByText(actionListing.name)).toBeInTheDocument()
      expect(screen.getByText(actionListing.description || 'Fail otherwise')).toBeInTheDocument()
      expect(screen.getByTestId('listing-type-label')).toHaveTextContent('Action')
      expect(screen.getByTestId('logo')).toHaveStyle({
        backgroundColor: `#${actionListing.color}`,
      })
      expect(screen.getByTestId('logo')).toHaveTextContent(actionListing.iconSvg || '') // icon_svg is not null here
    })

    test('renders non-featured content when isFeatured is false', () => {
      const actionListing = mockActionListing()
      renderComponent(actionListing, false)

      expect(screen.getByTestId('non-featured-item')).toBeInTheDocument()
      expect(screen.queryByTestId('featured-item')).not.toBeInTheDocument()
      expect(screen.getByTestId('marketplace-item')).toHaveClass('gap-3 p-3')
      expect(screen.getByTestId('marketplace-item')).not.toHaveClass('flex-column p-4')
    })

    test('renders featured content when isFeatured is true', () => {
      const actionListing = mockActionListing()
      renderComponent(actionListing, true)

      expect(screen.getByTestId('featured-item')).toBeInTheDocument()
      expect(screen.queryByTestId('non-featured-item')).not.toBeInTheDocument()
      expect(screen.getByTestId('marketplace-item')).toHaveClass('flex-column p-4')
      expect(screen.getByTestId('marketplace-item')).not.toHaveClass('gap-3 p-3')
    })

    test('Does not fire a click event on select', () => {
      const sendEventCalls = sendEvent as jest.Mock
      const actionListing = mockActionListing()
      renderComponent(actionListing, false)

      const link = screen.getByText(actionListing.name)
      fireEvent.click(link)

      expect(sendEventCalls.mock.calls.length).toBe(0)
    })
  })
})

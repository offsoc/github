import {fireEvent, render, screen} from '@testing-library/react'
import {ThemeProvider} from '@primer/react'
import {NavigationContextProvider} from '../../contexts/NavigationContext'
import {
  type Props as EnterpriseCloudSummaryHeaderMenuProps,
  EnterpriseCloudSummaryHeaderMenu,
} from '../EnterpriseCloudSummaryHeaderMenu'

const defaultProps: EnterpriseCloudSummaryHeaderMenuProps = {
  isCsvDownloadDisabled: false,
  isSelfServe: false,
  isSelfServeBlocked: false,
  isVolumeLicensed: false,
  onDownloadCsvSelect: jest.fn(),
  onManageSeatsSelect: jest.fn(),
}
interface OverrideProps {
  isStafftools?: boolean
  isCsvDownloadDisabled?: boolean
  isSelfServe?: boolean
  isSelfServeBlocked?: boolean
  isVolumeLicensed?: boolean
  onDownloadCsvSelect?: jest.Mock
  onManageSeatsSelect?: jest.Mock
  enterpriseContactUrl?: string
}

const renderMenu = (overrideProps: OverrideProps = {}) => {
  return render(
    <ThemeProvider>
      <NavigationContextProvider
        enterpriseContactUrl={'/enterprise-contact-url'}
        isStafftools={overrideProps.isStafftools ?? false}
        slug={'test-co'}
      >
        <EnterpriseCloudSummaryHeaderMenu {...defaultProps} {...overrideProps} />
      </NavigationContextProvider>
    </ThemeProvider>,
  )
}

describe('EnterpriseCloudSummaryHeaderMenu Component', () => {
  test('header menu button renders and functions', () => {
    renderMenu()

    const menuButton = screen.getByTestId('ghe-summary-menu-button')
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-label', 'Open menu')

    fireEvent.click(menuButton)

    const menuEl = screen.getByTestId('ghe-summary-menu')
    expect(menuEl).toBeInTheDocument()
  })

  test('calls onDownloadCsvSelect when "Download CSV report" is clicked', () => {
    const onDownloadCsvSelect = jest.fn()
    renderMenu({onDownloadCsvSelect})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const downloadItem = screen.getByTestId('ghe-summary-menu-download-item')
    expect(downloadItem).toBeInTheDocument()

    fireEvent.click(downloadItem)

    expect(onDownloadCsvSelect).toHaveBeenCalled()
  })

  test('disables "Download CSV report" when isCsvDownloadDisabled is true', () => {
    renderMenu({isCsvDownloadDisabled: true})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const downloadItem = screen.getByTestId('ghe-summary-menu-download-item')
    expect(downloadItem).toHaveAttribute('aria-disabled', 'true')
  })

  test('shows "Manage seats" when volume-licensed and self-served', () => {
    renderMenu({isSelfServe: true, isVolumeLicensed: true})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const manageSeatsItem = screen.getByTestId('ghe-summary-menu-manage-seats-item')
    expect(manageSeatsItem).toBeInTheDocument()
    expect(manageSeatsItem).toHaveTextContent('Manage seats')
  })

  test('does not show "Manage seats" when volume-licensed but sales-served', () => {
    renderMenu({isSelfServe: false, isVolumeLicensed: true})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const manageSeatsItem = screen.queryByTestId('ghe-summary-menu-manage-seats-item')
    expect(manageSeatsItem).not.toBeInTheDocument()
  })

  test('does not show "Manage seats" when volume-licensed and self-served but has self-service blocked', () => {
    renderMenu({isSelfServe: true, isVolumeLicensed: true, isSelfServeBlocked: true})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const manageSeatsItem = screen.queryByTestId('ghe-summary-menu-manage-seats-item')
    expect(manageSeatsItem).not.toBeInTheDocument()
  })

  test('does not show "Manage seats" when self-served but metered-licensed', () => {
    renderMenu({isSelfServe: true, isVolumeLicensed: false})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const manageSeatsItem = screen.queryByTestId('ghe-summary-menu-manage-seats-item')
    expect(manageSeatsItem).not.toBeInTheDocument()
  })

  test('does not show "Manage seats" when `isStafftools` is set', () => {
    renderMenu({isStafftools: true, isVolumeLicensed: true, isSelfServe: true})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const manageSeatsItem = screen.queryByTestId('ghe-summary-menu-manage-seats-item')
    expect(manageSeatsItem).not.toBeInTheDocument()
  })

  test('calls onManageSeatsSelect when "Manage seats" is clicked', () => {
    const onManageSeatsSelect = jest.fn()
    renderMenu({isSelfServe: true, isVolumeLicensed: true, onManageSeatsSelect})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    // click "Manage seats"
    fireEvent.click(screen.getByTestId('ghe-summary-menu-manage-seats-item'))

    expect(onManageSeatsSelect).toHaveBeenCalled()
  })

  test('shows "Contact sales" when volume-licensed, sales-served, and enterpriseContactUrl is present', () => {
    renderMenu({isSelfServe: false, isVolumeLicensed: true, enterpriseContactUrl: '/enterprise-contact-url'})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const contactSalesHeading = screen.getByTestId('ghe-summary-menu-contact-sales-heading')
    expect(contactSalesHeading).toBeInTheDocument()
    expect(contactSalesHeading).toHaveTextContent('Contact sales to buy more licenses')

    const contactSalesLink = screen.getByTestId('ghe-summary-menu-contact-sales-link')
    expect(contactSalesLink).toBeInTheDocument()
    expect(contactSalesLink).toHaveAttribute('href', '/enterprise-contact-url')
  })

  test('does not show "Contact sales" when metered-licensed and self-served', () => {
    renderMenu({isSelfServe: true, isVolumeLicensed: false, enterpriseContactUrl: '/enterprise-contact-url'})

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const contactSalesHeading = screen.queryByTestId('ghe-summary-menu-contact-sales-heading')
    expect(contactSalesHeading).not.toBeInTheDocument()

    const contactSalesLink = screen.queryByTestId('ghe-summary-menu-contact-sales-link')
    expect(contactSalesLink).not.toBeInTheDocument()
  })

  test('does not show "Contact sales" when `isStafftools` is set', () => {
    renderMenu({
      isStafftools: true,
      isVolumeLicensed: true,
      isSelfServe: true,
      enterpriseContactUrl: '/enterprise-contact-url',
    })

    // open the menu
    fireEvent.click(screen.getByTestId('ghe-summary-menu-button'))

    const contactSalesHeading = screen.queryByTestId('ghe-summary-menu-contact-sales-heading')
    expect(contactSalesHeading).not.toBeInTheDocument()

    const contactSalesLink = screen.queryByTestId('ghe-summary-menu-contact-sales-link')
    expect(contactSalesLink).not.toBeInTheDocument()
  })
})

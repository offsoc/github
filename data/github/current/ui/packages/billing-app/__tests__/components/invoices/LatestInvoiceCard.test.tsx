import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import LatestInvoiceCard from '../../../components/invoices/LatestInvoiceCard'

import type {LatestInvoiceCardProps} from '../../../components/invoices/LatestInvoiceCard'

const DEFAULT_PROPS: LatestInvoiceCardProps = {
  latestInvoiceBalance: 10.02,
  invoiceDueDate: 'Feb 15, 2025',
  invoiceNumber: 'INV000101',
  overdue: false,
  meteredViaAzure: false,
}

describe('LatestInvoiceCard', () => {
  test('renders card', () => {
    render(<LatestInvoiceCard {...DEFAULT_PROPS} />)

    const latestInvoiceCard = screen.getByTestId('latest-invoice-card')
    expect(latestInvoiceCard).toBeInTheDocument()
  })

  test('renders latest invoice balance', () => {
    render(<LatestInvoiceCard {...DEFAULT_PROPS} />)

    const latestInvoiceBalance = screen.getByText(`$${DEFAULT_PROPS.latestInvoiceBalance}`)
    expect(latestInvoiceBalance).toBeInTheDocument()
  })

  test('shows invoice due date', () => {
    render(<LatestInvoiceCard {...DEFAULT_PROPS} />)

    const latestInvoiceDueDate = screen.getByText(`by ${DEFAULT_PROPS.invoiceDueDate}`)
    expect(latestInvoiceDueDate).toBeInTheDocument()
  })

  test('shows pay now button', () => {
    render(<LatestInvoiceCard {...DEFAULT_PROPS} />)

    const payNowButton = screen.getByText('Pay now')
    expect(payNowButton).toBeInTheDocument()
  })

  describe('#overdue', () => {
    test('Shows overdue label when overdue', () => {
      render(<LatestInvoiceCard {...DEFAULT_PROPS} overdue />)

      const overdueLabel = screen.getByText('Overdue')
      expect(overdueLabel).toBeInTheDocument()
    })

    test('Hides overdue label when not overdue', () => {
      render(<LatestInvoiceCard {...DEFAULT_PROPS} overdue={false} />)

      const overdueLabel = screen.queryByText('Overdue')
      expect(overdueLabel).toBeNull()
    })

    test('Hides invoice due date when overdue', () => {
      render(<LatestInvoiceCard {...DEFAULT_PROPS} overdue />)

      const latestInvoiceDueDate = screen.queryByText(`by ${DEFAULT_PROPS.invoiceDueDate}`)
      expect(latestInvoiceDueDate).toBeNull()
    })
  })

  describe('#meteredViaAzure', () => {
    test('renders metered via Azure copy when meteredViaAzure is true', () => {
      render(<LatestInvoiceCard {...DEFAULT_PROPS} meteredViaAzure />)

      const meteredViaAzureCopy = screen.getByText('Metered usage billed via Azure is not included.')
      expect(meteredViaAzureCopy).toBeInTheDocument()
    })

    test('hides metered via Azure copy when meteredViaAzure is false', () => {
      render(<LatestInvoiceCard {...DEFAULT_PROPS} meteredViaAzure={false} />)

      const meteredViaAzureCopy = screen.queryByText('Metered usage billed via Azure is not included.')
      expect(meteredViaAzureCopy).toBeNull()
    })
  })
})

import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor} from '@testing-library/react'

import type {InvoicesPagePayload} from '../../../routes/stafftools'
import {InvoicesPage} from '../../../routes/stafftools'

import {CUSTOMER_SELECTIONS, MOCK_INVOICE} from '../../../test-utils/mock-data'
import {generateInvoiceRequest, getInvoicesRequest} from '../../../services/invoices'

import type {CustomerSelection} from '../../../types/usage'

function invoiceRoutePayload({
  customerSelections = CUSTOMER_SELECTIONS,
  slug = 'test',
}: {
  customerSelections?: CustomerSelection[]
  slug?: string
}): InvoicesPagePayload {
  return {
    customerSelections,
    slug,
  }
}

// This is necessary to mock because of the soft navigation in the form.
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    mark: jest.fn(),
    clearResourceTimings: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue({pop: jest.fn()}),
    measure: jest.fn(),
  },
})

jest.mock('../../../services/invoices', () => ({
  generateInvoiceRequest: jest.fn(),
  getInvoicesRequest: jest.fn(),
}))

describe('Invoices', () => {
  describe('when the generate invoice button is pressed', () => {
    it('displays the invoice generation form', async () => {
      const routePayload = invoiceRoutePayload({})
      const {user} = render(<InvoicesPage />, {routePayload})

      expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Invoices for Metered usage (w/o cost centers)')
      const button = screen.getByRole('button', {name: 'Generate Invoice'})
      await user.click(button)

      await waitFor(() =>
        expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
          'Generate invoice for Metered usage (w/o cost centers)',
        ),
      )
    })

    it('submits the form when the generate button is pressed', async () => {
      ;(generateInvoiceRequest as jest.Mock).mockResolvedValue({
        statusCode: 200,
      })
      const routePayload = invoiceRoutePayload({})
      const {user} = render(<InvoicesPage />, {routePayload})

      await waitFor(() => expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('Invoices'))
      const button = screen.getByRole('button', {name: 'Generate Invoice'})
      await user.click(button)

      await waitFor(() =>
        expect(screen.getByRole('heading', {level: 3})).toHaveTextContent(
          'Generate invoice for Metered usage (w/o cost centers)',
        ),
      )

      const selectYear = screen.getByRole('combobox', {name: 'Year'})
      const selectMonth = screen.getByRole('combobox', {name: 'Month'})
      const generateButton = screen.getByRole('button', {name: 'Generate'})

      await user.selectOptions(selectMonth, '1')
      await user.selectOptions(selectYear, '2021')
      await user.click(generateButton)

      await act(async () => {
        expect(generateInvoiceRequest).toHaveBeenCalledWith(routePayload.slug, {
          customerId: routePayload.customerSelections[0]?.id,
          year: 2021,
          month: 2,
        })
      })
    })
  })

  it('Renders an alert when an error is present', async () => {
    ;(getInvoicesRequest as jest.Mock).mockResolvedValueOnce({
      statusCode: 500,
      error: 'an error occurred',
      invoices: [],
    })
    const routePayload = invoiceRoutePayload({})
    render(<InvoicesPage />, {routePayload})

    const text = await screen.findByTestId('invoices-loading-error')
    expect(text).toHaveTextContent('Something went wrong')
  })

  it('Renders the invoices for the selected customer', async () => {
    ;(getInvoicesRequest as jest.Mock)
      .mockResolvedValueOnce({
        statusCode: 200,
        invoices: [MOCK_INVOICE],
      })
      .mockResolvedValueOnce({
        statusCode: 200,
        invoices: [{...MOCK_INVOICE, year: 2021, month: 5}],
      })
    const routePayload = invoiceRoutePayload({
      customerSelections: [{id: 'uuid', displayText: 'cost center 1'}, ...CUSTOMER_SELECTIONS],
    })

    const {user} = render(<InvoicesPage />, {routePayload})

    expect(screen.getByRole('heading')).toHaveTextContent('Invoices for Metered usage (w/o cost centers)')
    const text = await screen.findByTestId('0-invoice-date')
    expect(text).toHaveTextContent('Jan 2021')

    // select a cost center from the dropdown
    const costCenterSelector = screen.getByLabelText('Change cost center selection')
    await user.click(costCenterSelector)
    const costCenterOption = screen.getByText('cost center 1')

    await user.click(costCenterOption)
    expect(await screen.findByRole('heading')).toHaveTextContent('Invoices for cost center 1')
    expect(await screen.findByTestId('0-invoice-date')).toHaveTextContent('May 2021')
  })
})

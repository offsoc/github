import last from 'lodash-es/last'
import type {ReactNode} from 'react'
import React, {useState, useMemo} from 'react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {Box, Button, Details, Dialog, FormControl, Octicon, Text, Select, useDetails} from '@primer/react'
import {ChevronDownIcon, ChevronLeftIcon} from '@primer/octicons-react'

import {ErrorComponent} from '../../components'
import CostCenterSelector from '../../components/common/CostCenterSelector'
import {generateInvoiceRequest} from '../../services/invoices'
import useInvoices from '../../hooks/invoice/use-invoices'
import {formatDate} from '../../utils/date'
import {formatMoneyDisplay} from '../../utils/money'

import type {Invoice, GenerateInvoiceRequest} from '../../types/invoices'
import type {CustomerSelection} from '../../types/usage'
import {RequestState} from '../../enums'

const tableContainerStyle = {
  borderColor: 'border.default',
  borderWidth: 1,
  borderStyle: 'solid',
  fontWeight: 'normal',
  borderRadius: 2,
}

const sharedRowStyles = {
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderColor: 'border.default',
  p: 3,
}

const tableHeaderStyle = {
  ...sharedRowStyles,
  background: 'var(--bgColor-muted, var(--color-canvas-subtle))',
}

type InvoiceRowProps = {
  invoice: Invoice
  idx: number
}

type Months = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'

const months: Months[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const InvoiceRow = ({invoice, idx}: InvoiceRowProps) => {
  const {getDetailsProps, open} = useDetails({closeOnOutsideClick: false})

  const rowSummary = (
    <Box key={idx} as="tr" sx={sharedRowStyles}>
      <Box as="td" sx={{py: 3, px: 3}}>
        <Box sx={{display: 'inline-block', verticalAlign: 'middle'}}>
          <Text sx={{fontWeight: 'bold', fontSize: 1}}>Index {idx}</Text>
        </Box>
      </Box>
      <Box as="td" sx={{py: 3, px: 3}}>
        <Box sx={{display: 'inline-block', verticalAlign: 'middle'}}>
          <Text data-testid={`${idx}-invoice-date`} sx={{fontSize: 1}}>
            {formatDate(invoice.year, invoice.month)}
          </Text>
        </Box>
      </Box>

      <Box as="td" sx={{py: 3, px: 3}}>
        <Box sx={{display: 'inline-block', verticalAlign: 'middle'}}>
          <Text sx={{fontSize: 1}}>{formatMoneyDisplay(invoice.usageTotal.gross)}</Text>
        </Box>
      </Box>
      <Box as="td" sx={{py: 3, px: 3}}>
        <Box sx={{display: 'inline-block', verticalAlign: 'middle'}}>
          <Text sx={{fontSize: 1}}>{formatMoneyDisplay(invoice.usageTotal.discount)}</Text>
        </Box>
      </Box>
      <Box as="td" sx={{py: 3, px: 3}}>
        <Box sx={{display: 'inline-block', verticalAlign: 'middle'}}>
          <Text sx={{fontSize: 1}}>{formatMoneyDisplay(invoice.usageTotal.net)}</Text>
        </Box>
      </Box>
      <Box as="td" sx={{py: 3, px: 3}}>
        <Box sx={{display: 'inline-block', verticalAlign: 'middle'}}>
          <Text sx={{fontSize: 1}}>{invoice.usageTotal.quantity}</Text>
        </Box>
      </Box>

      <Box as="td" sx={{py: 3, px: 3}}>
        <Details {...getDetailsProps()} sx={{p: 2, pr: 0}}>
          <Box
            as={'summary'}
            sx={{p: 2}}
            title={open ? 'Hide Invoice Breakdown' : 'Show Invoice Breakdown'}
            data-testid={'invoice-details'}
          >
            <Octicon icon={open ? ChevronDownIcon : ChevronLeftIcon} />
          </Box>
        </Details>
      </Box>
    </Box>
  )

  return (
    <>
      {rowSummary}
      {open && (
        <Box
          key={`${idx}-detail`}
          as="tr"
          sx={{
            ...sharedRowStyles,
            borderTop: 0,
          }}
        >
          <Box as="td" sx={{p: 0}} colSpan={7}>
            <Box as="pre" sx={{p: 3, m: 0, overflowX: 'auto', whiteSpace: 'pre-wrap'}}>
              {JSON.stringify(invoice, null, 2)}
            </Box>
          </Box>
        </Box>
      )}
    </>
  )
}

function InvoiceGeneration({slug, selectedCustomer}: {slug: string; selectedCustomer: CustomerSelection}) {
  const returnFocusRef = React.useRef(null)
  const [isOpen, setIsOpen] = useState<boolean | undefined>(false)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const getMonthPicker = useMemo(() => {
    const monthElements: ReactNode[] = months.map((month, idx) => {
      return (
        <Select.Option key={month} value={`${idx}`}>
          {month}
        </Select.Option>
      )
    })

    return (
      <FormControl>
        <FormControl.Label sx={{alignSelf: 'center'}}>Month</FormControl.Label>
        <Select
          value={currentMonth}
          aria-label="Month"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newDate = new Date(currentYear, Number(e.target.value))
            setCurrentDate(newDate)
          }}
        >
          {monthElements}
        </Select>
      </FormControl>
    )
  }, [currentMonth, currentYear, setCurrentDate])

  const getYearPicker = useMemo(() => {
    const years: ReactNode[] = []
    const todaysYear = new Date().getFullYear()
    const minYear = todaysYear - 10
    const maxYear = todaysYear
    for (let i = minYear; i <= maxYear; i++) {
      years.push(
        <Select.Option key={i} value={`${i}`}>
          {i}
        </Select.Option>,
      )
    }

    return (
      <FormControl>
        <FormControl.Label sx={{alignSelf: 'center'}}>Year</FormControl.Label>
        <Select
          value={currentYear}
          aria-label="Year"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const newDate = new Date(Number(e.target.value), currentMonth)

            setCurrentDate(newDate)
          }}
        >
          {years}
        </Select>
      </FormControl>
    )
  }, [currentMonth, currentYear, setCurrentDate])

  const {addToast} = useToastContext()

  async function generateInvoice() {
    const data: GenerateInvoiceRequest = {
      customerId: selectedCustomer.id,
      year: currentYear,
      month: currentMonth + 1, // currentMonth is 0 indexed but billing-platform expects months 1-12 so add 1
    }

    try {
      const {error} = await generateInvoiceRequest(slug, data)
      if (error) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: `There was an issue generating your invoice ${error}`,
        })
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'Invoice scheduled for generation',
        })
      }
    } catch {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'Error generating invoice',
      })
    } finally {
      setIsOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await generateInvoice()
  }

  // Form
  return (
    <>
      <Button aria-label="Generate Invoice" size="small" ref={returnFocusRef} onClick={() => setIsOpen(true)}>
        Generate Invoice
      </Button>
      <Dialog
        isOpen={isOpen}
        returnFocusRef={returnFocusRef}
        onDismiss={() => setIsOpen(false)}
        aria-labelledby="label"
      >
        <Dialog.Header>
          <Text as="h3" sx={{ml: 2, mb: 0}}>
            Generate invoice for {selectedCustomer.displayText}
          </Text>
        </Dialog.Header>
        <Box sx={{p: 3}}>
          <Box sx={{p: 2, mb: 2}}>
            <Text as="p" id="label" sx={{mb: 1}}>
              Populates an invoice for the given year and month.
            </Text>
            <Text as="p" sx={{color: 'fg.subtle', m: 0}} className="text-small">
              &bull; An invoice won&apos;t be generated if there&apos;s no usage for the given period.
            </Text>
            <Text as="p" sx={{color: 'fg.subtle', m: 0}} className="text-small">
              &bull; If there is an existing invoice for the period, it will be updated.
            </Text>
          </Box>
          <form onSubmit={handleSubmit}>
            <Box sx={{display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row'}}>
              {getMonthPicker}
              {getYearPicker}
            </Box>
            <Box sx={{display: 'flex', mt: 3, justifyContent: 'center'}}>
              <Button type="submit" variant="primary">
                Generate
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>
    </>
  )
}

export interface InvoicesPagePayload {
  customerSelections: CustomerSelection[]
  slug: string
  error?: string
}

export function InvoicesPage() {
  const {customerSelections, slug} = useRoutePayload<InvoicesPagePayload>()

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSelection>(
    last(customerSelections) as CustomerSelection,
  )

  const {invoices, requestState} = useInvoices({enterpriseSlug: slug, customerId: selectedCustomer?.id})

  const header = (
    <Box as="header" className="Subhead" sx={{alignItems: 'center', justifyContent: 'space-between'}}>
      <CostCenterSelector
        getHeadingText={(sc: CustomerSelection) => {
          return `Invoices for ${sc.displayText}`
        }}
        selections={customerSelections}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        title={`View invoices for`}
        as={'h2'}
      />
      <InvoiceGeneration selectedCustomer={selectedCustomer} slug={slug} />
    </Box>
  )

  if (requestState === RequestState.ERROR) {
    return (
      <div>
        {header}
        <ErrorComponent testid="invoices-loading-error" text="Something went wrong" />
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div>
        {header}
        <Box
          sx={{
            fontSize: 4,
            pt: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          No invoices found
        </Box>
      </div>
    )
  }

  return (
    <div>
      {header}
      <Box sx={tableContainerStyle}>
        <Box as="table" sx={{width: '100%', textAlign: 'left', borderRadius: 2}} data-hpc>
          <thead>
            <tr>
              <Box as="th" sx={{...tableHeaderStyle, borderTopLeftRadius: 2}}>
                Invoice
              </Box>
              <Box as="th" sx={tableHeaderStyle}>
                Date
              </Box>
              <Box as="th" sx={tableHeaderStyle}>
                Gross
              </Box>
              <Box as="th" sx={tableHeaderStyle}>
                Discount
              </Box>
              <Box as="th" sx={tableHeaderStyle}>
                Net
              </Box>
              <Box as="th" sx={tableHeaderStyle}>
                Quantity
              </Box>
              <Box as="th" sx={{...tableHeaderStyle, borderTopRightRadius: 2}}>
                Details
              </Box>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, idx) => {
              return <InvoiceRow invoice={invoice} idx={idx} key={idx} />
            })}
          </tbody>
        </Box>
      </Box>
    </div>
  )
}

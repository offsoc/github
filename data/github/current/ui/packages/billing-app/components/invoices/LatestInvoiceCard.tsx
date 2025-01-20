import {Box, Heading, Text, Link, Button, Label} from '@primer/react'

import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle, Fonts} from '../../utils/style'
import {PAST_INVOICES_ROUTE, SHOW_INVOICE_ROUTE, PAY_INVOICE_ROUTE} from '../../routes'
import useRoute from '../../hooks/use-route'

export const paymentDueCopyContainerStyle = {
  fontSize: Fonts.FontSizeSmall,
  color: 'fg.muted',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
}

export interface LatestInvoiceCardProps {
  latestInvoiceBalance: number
  invoiceDueDate: string
  invoiceNumber: string
  overdue: boolean
  meteredViaAzure: boolean
}

export default function LatestInvoiceCard(props: LatestInvoiceCardProps) {
  const {path: pastInvoicesRoute} = useRoute(PAST_INVOICES_ROUTE)
  const {path: showInvoiceRoute} = useRoute(SHOW_INVOICE_ROUTE, {invoiceNumber: props.invoiceNumber})
  const {path: payInvoiceRoute} = useRoute(PAY_INVOICE_ROUTE, {invoiceNumber: props.invoiceNumber})

  return (
    <Box sx={boxStyle} data-testid="latest-invoice-card">
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading as="h3" sx={{...cardHeadingStyle, fontSize: Fonts.FontSizeNormal}}>
          Latest invoice
        </Heading>

        <>
          <div>
            <Button as="a" href={payInvoiceRoute} variant="primary" size="small">
              Pay now
            </Button>
          </div>
        </>
      </Box>

      <Box sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 2}}>
        <div>
          <Text sx={{fontSize: 4}}>{formatMoneyDisplay(props.latestInvoiceBalance)}</Text>
        </div>
        <div>
          {!props.overdue && <>by {props.invoiceDueDate}</>}
          {props.overdue && <Label variant="attention">Overdue</Label>}
        </div>
      </Box>

      <Box sx={paymentDueCopyContainerStyle}>
        {props.meteredViaAzure ? <p>Metered usage billed via Azure is not included.</p> : <br />}

        <p>
          <Link inline href={showInvoiceRoute} sx={{fontSize: Fonts.FontSizeSmall}} target="_blank">
            View invoice
          </Link>
          {' | '}
          <Link inline href={pastInvoicesRoute}>
            Past invoices
          </Link>
        </p>
      </Box>
    </Box>
  )
}

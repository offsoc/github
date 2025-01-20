import {Box, Heading, Text, Link, Label} from '@primer/react'

import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle, Fonts} from '../../utils/style'
import {PAYMENT_HISTORY_ROUTE} from '../../routes'
import useRoute from '../../hooks/use-route'
import {paymentDueCopyContainerStyle} from './PaymentDueCard'

import type {PaymentDueCardProps} from './PaymentDueCard'

export default function AutoPayEnabledCard(props: PaymentDueCardProps) {
  const {path: paymentHistoryRoute} = useRoute(PAYMENT_HISTORY_ROUTE)

  return (
    <Box sx={boxStyle} data-testid="auto-pay-enabled-payment-due-card">
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading as="h3" sx={{...cardHeadingStyle, fontSize: Fonts.FontSizeNormal}}>
          Past due
        </Heading>

        <Link href={paymentHistoryRoute} sx={{fontSize: Fonts.FontSizeSmall}}>
          Payment history
        </Link>
      </Box>

      <Box sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 2}}>
        <div>
          <Text sx={{fontSize: 4}}>{formatMoneyDisplay(props.latestBillAmount)}</Text>
        </div>
        <div>{props.overdue && <Label variant="attention">Overdue</Label>}</div>
      </Box>

      <Box sx={paymentDueCopyContainerStyle}>
        {props.meteredViaAzure && <p>Metered usage billed via Azure is not included.</p>}
        <p>
          Your next payment is scheduled for <Text sx={{fontWeight: 'bold'}}>{props.nextPaymentDate}.</Text>
        </p>
      </Box>
    </Box>
  )
}

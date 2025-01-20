import {Box, Heading, Text, Link, Button, Label} from '@primer/react'

import {formatMoneyDisplay} from '../../utils/money'
import {boxStyle, cardHeadingStyle, Fonts} from '../../utils/style'
import {ONE_TIME_PAYMENT_ROUTE, PAYMENT_HISTORY_ROUTE} from '../../routes'
import useRoute from '../../hooks/use-route'
import {paymentDueCopyContainerStyle} from './PaymentDueCard'

import type {PaymentDueCardProps} from './PaymentDueCard'

const INDIA_RBI_DOC_LINK =
  'https://docs.github.com/billing/managing-the-plan-for-your-github-account/one-time-payments-for-customers-in-india'

export default function AutoPayDisabledCard(props: PaymentDueCardProps) {
  const {path: oneTimePaymentRoute} = useRoute(ONE_TIME_PAYMENT_ROUTE)
  const {path: paymentHistoryRoute} = useRoute(PAYMENT_HISTORY_ROUTE)

  return (
    <Box sx={boxStyle} data-testid="auto-pay-disabled-payment-due-card">
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Heading as="h3" sx={{...cardHeadingStyle, fontSize: Fonts.FontSizeNormal}}>
          Past due
        </Heading>

        {!props.hasBill ? (
          <Link href={paymentHistoryRoute} sx={{fontSize: Fonts.FontSizeSmall}}>
            Payment history
          </Link>
        ) : (
          <>
            <div>
              <Button as="a" href={oneTimePaymentRoute} variant="primary" size="small">
                Pay now
              </Button>
            </div>
          </>
        )}
      </Box>

      <Box sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 2}}>
        <div>
          <Text sx={{fontSize: 4}}>{formatMoneyDisplay(props.latestBillAmount)}</Text>
        </div>
        <div>
          {props.hasBill && !props.overdue && <>by {props.nextPaymentDate}</>}
          {props.overdue && <Label variant="attention">Overdue</Label>}
        </div>
      </Box>

      <Box sx={paymentDueCopyContainerStyle}>
        {props.meteredViaAzure && <p>Metered usage billed via Azure is not included.</p>}

        <p>
          Automatic{' '}
          <Link inline href={INDIA_RBI_DOC_LINK} sx={{color: 'fg.muted'}} target="_blank">
            recurring payments are disabled
          </Link>
          .
        </p>
      </Box>
    </Box>
  )
}

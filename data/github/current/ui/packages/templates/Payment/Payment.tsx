import {useState} from 'react'
import {Box, PageLayout, Heading, Button} from '@primer/react'
import {ArrowLeftIcon} from '@primer/octicons-react'

import Overview from './Overview'
import Account from './Account'
import BillingPeriod from './BillingPeriod'
import Navigation from './Navigation'
import TotalSeats from './TotalSeats'
import BillingInformation from './BillingInformation'
import PaymentMethod from './PaymentMethod'

const YEARLY_PRICE = 19.5
const MONTHLY_PRICE = 24
const CREDIT = 223

export function Payment() {
  const [billingPeriod, setBillingPeriod] = useState('yearly')
  const [seats, setSeats] = useState(20)

  return (
    <Box
      sx={{
        bg: 'canvas.default',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'stretch',
        alignItems: 'stretch',
        flexDirection: 'column',
        pb: 5,
      }}
    >
      <Navigation />
      <PageLayout containerWidth="large">
        <PageLayout.Content
          padding="none"
          sx={{
            p: [0, 0, 4],
            minHeight: ['auto', 'auto', '100vh'],
          }}
        >
          <div>
            <Button
              as="a"
              variant="invisible"
              href="https://github.com"
              leadingVisual={ArrowLeftIcon}
              sx={{
                color: 'accent.fg',
                fontSize: 1,
                fontWeight: 'semibold',
                mb: [3, 3, 5],
                marginLeft: [-3, -3, -2],
              }}
            >
              Compare plans
            </Button>
          </div>
          <Box
            sx={{
              maxWidth: 1400,
              mx: 'auto',
              px: [0, 0, 2],
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Heading
              as="h1"
              sx={{
                flex: 1,
                fontWeight: 'semibold',
                fontSize: [3, 3, 4],
                pb: 3,
                borderBottomWidth: 1,
                borderBottomColor: 'border.default',
                borderBottomStyle: 'solid',
              }}
            >
              Subscribe to GitHub Enterprise
            </Heading>
            <Account />
            <BillingPeriod
              billingPeriod={billingPeriod}
              setBillingPeriod={setBillingPeriod}
              yearlyPrice={YEARLY_PRICE}
              monthlyPrice={MONTHLY_PRICE}
            />
            <TotalSeats seats={seats} setSeats={setSeats} />
            <BillingInformation />
            <PaymentMethod />
          </Box>
        </PageLayout.Content>
        <PageLayout.Pane position="end" sticky>
          <Overview
            yearlyPrice={YEARLY_PRICE}
            monthlyPrice={MONTHLY_PRICE}
            credit={CREDIT}
            billingPeriod={billingPeriod}
            seats={seats}
          />
        </PageLayout.Pane>
      </PageLayout>
    </Box>
  )
}

import {Box, Text, Radio, Label, Heading} from '@primer/react'

type BillingPeriodProps = {
  billingPeriod: string
  setBillingPeriod: (billingPeriod: string) => void
  monthlyPrice: number
  yearlyPrice: number
}

function BillingPeriod({billingPeriod, setBillingPeriod, monthlyPrice, yearlyPrice}: BillingPeriodProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  return (
    <Box
      sx={{
        py: [2, 2, 3],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Heading
        as="h2"
        sx={{
          flex: 1,
          fontWeight: 'bold',
          fontSize: 2,
        }}
      >
        Billing period
      </Heading>

      <Box
        sx={{
          display: 'grid',
          pt: 3,
          gridTemplateColumns: 'auto',
          gap: 3,
        }}
      >
        <Box
          sx={{
            borderStyle: 'solid',
            borderWidth: 1,
            display: 'flex',
            fontSize: 1,
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: 'shadow.small',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              p: 3,
              borderBottomStyle: 'solid',
              borderBottomWidth: 1,
              borderBottomColor: 'border.default',
            }}
          >
            <Radio
              aria-describedby="price-yearly"
              name="cycle"
              value="yearly"
              id="yearly"
              onChange={() => setBillingPeriod('yearly')}
              checked={billingPeriod === 'yearly'}
            />
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                gap: [1, 1, 0],
                width: '100%',
                flexDirection: ['column', 'column', 'row'],
              }}
            >
              <Box as="label" htmlFor="yearly" sx={{fontWeight: 'bold'}}>
                Pay yearly{' '}
                <Label variant="accent" sx={{ml: [1, 1, 2]}}>
                  2 months free
                </Label>
              </Box>
              <Text
                id="price-yearly"
                sx={{
                  color: 'fg.muted',
                  flex: 1,
                  textAlign: ['left', 'left', 'right'],
                  fontWeight: 'normal',
                }}
              >
                {formatter.format(yearlyPrice)} per seat / month
              </Text>
            </Box>
          </Box>
          <Box sx={{display: 'flex', gap: 2, p: 3}}>
            <div>
              <Radio
                aria-describedby="price-monthly"
                name="cycle"
                value="monthly"
                id="monthly"
                onChange={() => setBillingPeriod('monthly')}
                checked={billingPeriod === 'monthly'}
              />
            </div>
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                gap: [1, 1, 0],
                width: '100%',
                flexDirection: ['column', 'column', 'row'],
              }}
            >
              <Box as="label" htmlFor="monthly" sx={{fontWeight: 'bold'}}>
                Pay monthly{' '}
              </Box>
              <Text
                id="price-monthly"
                sx={{
                  color: 'fg.muted',
                  flex: 1,
                  fontWeight: 'normal',
                  textAlign: ['left', 'left', 'right'],
                }}
              >
                {formatter.format(monthlyPrice)} per seat / month
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default BillingPeriod

import {Box, Text, Heading, Button, Link} from '@primer/react'

type OverviewProps = {
  credit: number
  seats: number
  billingPeriod: string
  monthlyPrice: number
  yearlyPrice: number
}

function Overview({credit, seats, billingPeriod, monthlyPrice, yearlyPrice}: OverviewProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  const safeSeats = seats > 0 ? seats : 1
  const totalCycle = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice
  const totalWithSeats = totalCycle * safeSeats * (billingPeriod === 'monthly' ? 1 : 12)
  const final = totalWithSeats - credit

  const CTA = () => {
    return (
      <>
        <Button variant="primary" sx={{width: '100%'}}>
          Pay {formatter.format(Math.max(final, 0))}
        </Button>
        <Box
          sx={{
            fontSize: 0,
            textAlign: 'center',
            color: 'fg.muted',
            pt: 3,
            mx: 'auto',
            maxWidth: '83%',
          }}
        >
          By clicking pay you agree to our{' '}
          <Link
            sx={{display: 'inline'}}
            href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
            inline
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            sx={{display: 'inline'}}
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            inline
          >
            Privacy
          </Link>
          .
        </Box>
      </>
    )
  }
  return (
    <Box as="section" aria-labelledby="overview-heading" sx={{pt: [0, 0, 10]}}>
      <Box
        sx={{
          pb: 3,
          display: ['block', 'block', 'none'],
        }}
      >
        <Heading
          id="overview-heading"
          as="h2"
          sx={{
            flex: 1,
            fontWeight: 'bold',
            fontSize: 2,
          }}
        >
          New plan
        </Heading>
      </Box>
      <Box
        sx={{
          display: 'flex',
          px: 3,
          pt: [2, 2, 3],
          pb: 4,
          top: 0,
          borderRadius: 2,
          borderColor: 'border.default',
          borderWidth: 1,
          borderStyle: 'solid',
          flexDirection: 'column',
          boxShadow: 'shadow.small',
        }}
      >
        <Text
          as="h2"
          sx={{
            fontSize: 2,
            fontWeight: 'semibold',
            display: ['none', 'none', 'block'],
          }}
        >
          New plan
        </Text>
        <Text
          sx={{
            fontSize: [4, 4, 5],
            fontWeight: 'semibold',
            borderBottomWidth: 1,
            borderBottomColor: 'border.default',
            borderBottomStyle: 'solid',
            py: 2,
          }}
        >
          {formatter.format(totalWithSeats)}{' '}
          <Text
            sx={{
              fontSize: 1,
              color: 'fg.muted',
              fontWeight: 'normal',
            }}
          >
            / {billingPeriod === 'monthly' ? 'month' : 'year'}
          </Text>
        </Text>
        <Box
          sx={{
            gridTemplateColumns: ['auto', 'auto', 'auto auto'],
            display: 'grid',
            fontSize: 1,
            color: 'fg.muted',
            borderBottomWidth: [0, 0, 1],
            borderBottomColor: 'border.default',
            borderBottomStyle: 'solid',
            pb: [0, 0, 3],
            pt: 3,
            mb: [0, 0, 3],
            gap: 2,
          }}
        >
          <div>
            {safeSeats} {safeSeats > 1 ? 'seats' : 'seat'}{' '}
            <Box sx={{display: ['inline', 'inline', 'none']}}>({formatter.format(totalCycle)}/month)</Box>
          </div>{' '}
          <Text
            sx={{
              display: ['none', 'none', 'block'],
              textAlign: ['left', 'left', 'right'],
            }}
          >
            {formatter.format(totalCycle)}/month
          </Text>
          <div>
            Unused time on old plan{' '}
            <Box
              sx={{
                display: ['inline-block', 'inline-block', 'none'],
              }}
            >
              (-{formatter.format(credit)})
            </Box>
          </div>
          <Text
            sx={{
              display: ['none', 'none', 'block'],
              textAlign: ['left', 'left', 'right'],
            }}
          >
            -{formatter.format(credit)}
          </Text>
        </Box>
        <Box sx={{display: ['none', 'none', 'block']}}>
          <CTA />
        </Box>
      </Box>
      <Box sx={{display: ['block', 'block', 'none'], pt: 4}}>
        <CTA />
      </Box>
    </Box>
  )
}

export default Overview

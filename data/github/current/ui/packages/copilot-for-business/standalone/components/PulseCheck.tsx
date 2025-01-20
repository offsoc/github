import {currency as formatCurrency} from '@github-ui/formatters'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import {type BoxProps, Box, Link, Text} from '@primer/react'
import type React from 'react'
import {COPILOT_BUSINESS_LICENSE_COST} from '../../constants'

function Card(props: React.PropsWithChildren<BoxProps>) {
  const {children, sx = {}, ...rest} = props
  return (
    <Box
      sx={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'border.subtle',
        borderRadius: 6,
        p: 3,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  )
}

const PulseCard = (props: React.PropsWithChildren<object>) => (
  <Card sx={{display: 'flex', flexDirection: 'column', flex: '1 0 0%', alignSelf: 'start'}}>{props.children}</Card>
)

export function PulseCheck(props: {licenses: number; slug: string}) {
  return (
    <Box
      as="section"
      sx={{display: 'flex', width: '100%', gap: 3, marginBottom: 3}}
      role="region"
      aria-label="Insights"
    >
      <PulseCard>
        <Text as="p" sx={{fontWeight: 600, fontSize: 14}}>
          Total consumed seats
        </Text>
        <Text as="p" sx={{fontSize: 4, color: 'fg.default'}} data-testid="license-pulse-text">
          {props.licenses}
        </Text>
        <Text as="p" sx={{color: 'fg.muted', fontSize: 12, marginBottom: 0}}>
          Number of unique members with access to Copilot Business.
        </Text>
      </PulseCard>
      <PulseCard>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Text as="p" sx={{fontWeight: 600, fontSize: 14}}>
            Estimated monthly cost
          </Text>
          <Link target="_blank" href={`${ssrSafeLocation.origin}/enterprises/${props.slug}/settings/billing`}>
            Review billing details
          </Link>
        </Box>
        <Text as="p" sx={{fontSize: 4, color: 'fg.default'}} data-testid="cost-pulse-text">
          {`${formatCurrency(props.licenses * COPILOT_BUSINESS_LICENSE_COST)}`}
        </Text>
        <Text as="p" sx={{color: 'fg.muted', fontSize: 12, marginBottom: 0}} data-testid="per-seat-pulse-text">
          Each purchased seat is ${COPILOT_BUSINESS_LICENSE_COST} USD/month.
        </Text>
      </PulseCard>
    </Box>
  )
}

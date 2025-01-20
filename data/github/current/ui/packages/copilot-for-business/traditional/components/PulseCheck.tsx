import {currency as formatCurrency} from '@github-ui/formatters'
import {ssrSafeLocation} from '@github-ui/ssr-utils'
import type {BoxProps} from '@primer/react'
import {Box, Link, Text} from '@primer/react'
import {planCost} from '../../helpers/plan'
import {capitalizeFirstLetter, pluralize} from '../../helpers/text'
import type {CopilotForBusinessTrial, PlanText, SeatBreakdown} from '../../types'
import {AccessibleBreak, CopilotCard} from './Ui'

type Props = {
  slug: string
  seatBreakdown: SeatBreakdown
  type?: 'organization' | 'enterprise'
  trial?: CopilotForBusinessTrial
  planText: PlanText
}

type StyleProps = Pick<BoxProps, 'sx'>['sx']

const FALLBACK = 'No data yet'
const noDataStyle: StyleProps = {
  color: 'fg.muted',
  fontSize: 2,
  // fallback text has a different size, and therefore can create boxes of unequal height.
  // so, set line height equal to the line height of the larger text
  lineHeight: '36px',
}
const withDataStyle: StyleProps = {fontSize: 4, color: 'fg.default'}
const cfbHelpLink =
  'https://docs.github.com/enterprise-cloud@latest/copilot/overview-of-github-copilot/about-github-copilot-for-business'
const csHelpLink = 'https://notreal.ly'

export function PulseCheck(props: Props) {
  const {type = 'organization', planText, seatBreakdown} = props
  const seatCount = seatBreakdown.seats_billed + seatBreakdown.seats_pending
  const trial = props.trial ?? ({} as CopilotForBusinessTrial)
  const {has_trial, active, ends_at, copilot_plan} = trial

  const renderCostText = () => {
    let text = ''
    if (has_trial && copilot_plan === 'business') {
      text = 'Free'
    } else if (seatCount) {
      text = `${formatCurrency(seatCount * planCost(planText))}`
    }

    return (
      <Text as="p" sx={text ? withDataStyle : noDataStyle} data-testid="cost-pulse-text">
        {text || FALLBACK}
      </Text>
    )
  }

  const renderPerSeatText = () => {
    let text = ''
    if (has_trial && active) {
      text = `Free Copilot ${capitalizeFirstLetter(copilot_plan)} trial until ${new Date(ends_at).toLocaleDateString(
        'en-US',
        {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        },
      )}`
    } else if (!has_trial) {
      text = `Each purchased seat is $${planCost(planText)} USD/month.`
    }

    return text
  }

  const renderLicenseText = () => {
    return (
      <Text as="p" sx={seatCount ? withDataStyle : noDataStyle} data-testid="license-pulse-text">
        {seatCount ? pluralize(seatCount, 'seat', 's') : FALLBACK}
      </Text>
    )
  }

  return (
    <Box
      as="section"
      sx={{display: 'flex', width: '100%', gap: 3, marginBottom: 3}}
      role="region"
      aria-label="Insights"
    >
      <CopilotCard
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 0%',
          alignSelf: 'start',
        }}
      >
        <Text as="p" sx={{fontWeight: 600, fontSize: 14}}>
          Copilot seats
        </Text>
        {renderLicenseText()}
        <Text as="p" sx={{color: 'fg.muted', fontSize: 12, marginBottom: 0}}>
          Number of purchased seats in this {type}.
          <AccessibleBreak />
          <Link target="_blank" href={type === 'organization' ? cfbHelpLink : csHelpLink} inline={true}>
            Learn more about licenses
          </Link>
          .
        </Text>
      </CopilotCard>
      <CopilotCard
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 0 0%',
          alignSelf: 'start',
        }}
      >
        <Text as="p" sx={{fontWeight: 600, fontSize: 14}}>
          Estimated monthly cost
        </Text>
        {renderCostText()}
        <Text as="p" sx={{color: 'fg.muted', fontSize: 12, marginBottom: 0}} data-testid="per-seat-pulse-text">
          {renderPerSeatText()}
          <AccessibleBreak />
          <Link
            target="_blank"
            href={`${ssrSafeLocation.origin}/${type}s/${props.slug}/settings/billing/summary`}
            inline={true}
          >
            Review billing details
          </Link>
          .
        </Text>
      </CopilotCard>
    </Box>
  )
}

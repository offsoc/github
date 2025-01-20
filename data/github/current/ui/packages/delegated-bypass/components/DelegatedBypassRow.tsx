import type {FC} from 'react'
import type {ExemptionRequest, ExemptionResponse} from '../delegated-bypass-types'
import {User} from './User'
import {Box, Label, Link} from '@primer/react'
import {pluralize} from '../helpers/string'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'

type DelegatedBypassRowProps = {
  exemptionRequest: ExemptionRequest
  baseExemptionUrl: string
}

export const DelegatedBypassRow: FC<DelegatedBypassRowProps> = ({exemptionRequest, baseExemptionUrl}) => {
  const rulesetNames = exemptionRequest.rulesetNames
  const exemptionResponses = exemptionRequest.exemptionResponses
  const requestType = exemptionRequest.requestType
  const label = exemptionRequest.metadata?.label
  const result = FinalDecision(exemptionResponses)
  const {resolvePath} = useRelativeNavigation()
  const exemptionRequestLink = `${baseExemptionUrl}${exemptionRequest.number}`

  return (
    <>
      <Box
        as="li"
        sx={{
          borderTopColor: 'border.default',
          borderTopStyle: 'solid',
          borderTopWidth: 1,
          '&:first-child': {borderTopWidth: 0},
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 2,
            paddingX: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              justifyContent: 'center',
            }}
          >
            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 1}}>
              <Link sx={{fontWeight: 'bold', color: 'fg.default'}} href={resolvePath(exemptionRequestLink)}>
                {requestType === 'secret_scanning'
                  ? `Bypass push protection: ${label}`
                  : `Bypass ${truncation(rulesetNames)}`}
              </Link>
            </Box>
            <Box
              sx={{
                color: 'fg.muted',
                fontSize: 0,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'baseline',
              }}
            >
              <User user={exemptionRequest.requester} />
              &nbsp;submitted on {DateConversion(exemptionRequest.createdAt)}&nbsp;
              {exemptionResponses.length > 0 && result.reviewer && (
                <>
                  <span className="text-small">{`• Request ${result.status} by`}</span>
                  &nbsp;
                  <User user={result.reviewer} />
                </>
              )}
            </Box>
          </Box>
          <Box sx={{display: ['flex'], alignItems: 'center', marginLeft: 2}}>
            <ExemptionStatusLabel exemptionRequest={exemptionRequest} />
          </Box>
        </Box>
      </Box>
    </>
  )
}

const truncation = (rulesetNames: string[]) => {
  if (rulesetNames.length > 1) {
    const numOthers = rulesetNames.length - 1
    return `${rulesetNames[0]} and ${numOthers} more ${pluralize(numOthers, 'ruleset', 'rulesets', false)}`
  }
  return rulesetNames
}

const DateConversion = (date: string) => {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

const ExemptionStatusLabel = ({exemptionRequest}: {exemptionRequest: ExemptionRequest}) => {
  let statusLabel = null
  switch (exemptionRequest.status.toLowerCase()) {
    case 'cancelled':
      statusLabel = <Label variant="secondary">Cancelled</Label>
      break
    case 'completed':
      statusLabel = <Label variant="success">Completed</Label>
      break
    case 'rejected':
      statusLabel = <Label variant="danger">Denied</Label>
      break
    default:
      if (exemptionRequest.expired) {
        statusLabel = <Label variant="secondary">Expired</Label>
      }
      break
  }

  return statusLabel
}

const FinalDecision = (responses: ExemptionResponse[]) => {
  if (responses.length === 0) {
    return {status: '', reviewer: undefined, reviewerUrl: ''}
  }

  const firstDenial = responses.find(response => response.status === 'rejected')
  const result = {
    status: firstDenial?.status.toLowerCase() ?? 'approved',
    reviewer: firstDenial?.reviewer ?? responses[responses.length - 1]?.reviewer,
    reviewerUrl: firstDenial?.reviewer.path ?? responses[responses.length - 1]?.reviewer.path,
  }

  if (result.status === 'rejected') {
    result.status = 'denied'
  }
  return result
}

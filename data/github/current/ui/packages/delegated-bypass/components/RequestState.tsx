import {useMemo} from 'react'
import {Box} from '@primer/react'
import type {ExemptionResponse, ExemptionRequest, Ruleset} from '../delegated-bypass-types'
import {PendingRulesetResponseStatusLine, RequestStatusLine, RulesetResponseStatusLine} from './StatusLine'

export function RequestState({
  request,
  responses,
  rulesets,
  isRequester,
  reviewerLogin,
}: {
  request: ExemptionRequest
  responses: ExemptionResponse[]
  rulesets?: Ruleset[]
  isRequester: boolean
  reviewerLogin?: string
}) {
  const statuses = useMemo(
    () =>
      rulesets?.map(ruleset => {
        const rulesetResponses = responses.filter(({rulesetIds}) => rulesetIds?.includes(ruleset.id))
        const response = rulesetResponses[rulesetResponses.length - 1]
        return {
          ruleset,
          response,
        }
      }) || [],
    [rulesets, responses],
  )
  const mostRecentTimestamp = useMemo(
    () =>
      responses
        .map(({updatedAt}) => new Date(updatedAt))
        .reduce((a, b) => (a > b ? a : b), new Date(request.createdAt))
        .toUTCString(),
    [responses, request],
  )
  const isRequestPending = request.status === 'pending'
  const expirationTimestamp = useMemo(() => {
    const expiresAt = request.expiresAt
    return expiresAt ? expiresAt : ''
  }, [request])

  return (
    <Box sx={{width: '100%', mt: 4}}>
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{width: '100%', display: 'flex', flexDirection: 'column', gap: 2}}>
          <RequestStatusLine
            requestStatus="pending"
            timestamp={request.createdAt}
            hideAction={!isRequester || !isRequestPending}
            changedRulesets={request.changedRulesets}
          />
          {responses.map(response => (
            <RulesetResponseStatusLine
              key={`response-${response.id}`}
              response={response}
              rulesets={rulesets?.filter(ruleset => response.rulesetIds?.includes(ruleset.id)) || []}
              reviewerLogin={reviewerLogin}
              requestStatus={request.status}
            />
          ))}
          {statuses.map(
            ({ruleset, response}) =>
              !response && (
                <PendingRulesetResponseStatusLine
                  key={`ruleset-${ruleset.id}`}
                  ruleset={ruleset}
                  hideAction={!isRequestPending}
                />
              ),
          )}
          {!isRequestPending ? (
            <RequestStatusLine
              requestStatus={request.status}
              timestamp={request.status === 'expired' ? expirationTimestamp : mostRecentTimestamp}
              hideAction={!isRequester}
              changedRulesets={request.changedRulesets}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

import {Box, Text, Pagination} from '@primer/react'
import {Subhead} from '../components/Subhead'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {BypassRequestsRoutePayload} from '../delegated-bypass-types'
import {DelegatedBypassRow} from '../components/DelegatedBypassRow'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {BypassRequestsFilterBar} from '../components/BypassRequestsFilterBar'
import {requestsIndexPath} from '../helpers/requests-filter'
import {BypassRequestsBlank} from '../components/BypassRequestsBlank'

export function BypassRequestsPage() {
  return <BypassRequestsComponent />
}

function BypassRequestsComponent() {
  const {exemptionRequests, filter, sourceType, repositories, hasMoreRequests, baseExemptionUrl} =
    useRoutePayload<BypassRequestsRoutePayload>()
  const {navigate} = useRelativeNavigation()

  let {page} = filter
  page = page || 1
  const pageCount = hasMoreRequests ? page + 1 : page

  return (
    <>
      <Subhead heading="Bypass Requests" beta={true} />
      <Box sx={{mb: 2}}>
        <Text sx={{fontWeight: 'normal', color: 'fg.muted'}} as="span">
          View all requests to bypass push rules.
        </Text>
      </Box>
      <BypassRequestsFilterBar filter={filter} sourceType={sourceType} repositories={repositories} />
      {exemptionRequests.length > 0 ? (
        <Box
          as="ol"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'canvas.default',
            borderColor: 'border.default',
            borderStyle: 'solid',
            borderWidth: 1,
            color: 'fg.default',
            position: 'relative',
            ml: 0,
          }}
        >
          {exemptionRequests.map(exemptionRequest => (
            <DelegatedBypassRow
              key={exemptionRequest.id}
              exemptionRequest={exemptionRequest}
              baseExemptionUrl={
                sourceType === 'organization' ? exemptionRequest.repoExemptionsBaseUrl : baseExemptionUrl
              }
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            borderColor: 'border.default',
            borderStyle: 'solid',
            borderWidth: 1,
            marginTop: 2,
          }}
        >
          <BypassRequestsBlank />
        </Box>
      )}
      {(page !== 1 || pageCount !== 1) && (
        <Pagination
          pageCount={pageCount}
          currentPage={page}
          onPageChange={(e, newPage) => {
            e.preventDefault()
            if (page !== newPage) {
              navigate('.', requestsIndexPath({filter: {...filter, page: newPage}}), true)
            }
          }}
          showPages={false}
        />
      )}
    </>
  )
}

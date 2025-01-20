import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {ExemptionRequestPayload} from '../delegated-bypass-types'
import {RequestReviewerForm} from '../components/RequestReviewerForm'
import {RequestState} from '../components/RequestState'
import {ExemptionRequestContainer} from '../components/ExemptionRequestContainer'
import {RequestFormProvider} from '../contexts/RequestFormContext'
import {componentRegistry} from '../components/RequestForm/index'
import {useRequestTypeContext} from '../contexts/RequestTypeContext'
import {requestNotAtTerminalStatus} from '../components/StatusLine'

export function ExemptionRequestPage() {
  const {ruleSuite, request, reviewer, rulesets, responses} = useRoutePayload<ExemptionRequestPayload>()
  const requestType = useRequestTypeContext()

  const {violations, displayName} = componentRegistry[requestType]
  return (
    <ExemptionRequestContainer
      ruleSuite={ruleSuite}
      requestCompleted={request.status === 'completed'}
      violations={violations}
      displayName={displayName}
      requestType={requestType}
    >
      <RequestState
        request={request}
        responses={responses}
        rulesets={rulesets}
        isRequester={!!reviewer?.isRequester}
        reviewerLogin={reviewer?.login}
      />
      {reviewer?.isValid && !reviewer.hasUndismissedReview && requestNotAtTerminalStatus(request.status) && (
        <RequestFormProvider readOnly formValues={{...request.metadata}}>
          <RequestReviewerForm request={request} />
        </RequestFormProvider>
      )}
    </ExemptionRequestContainer>
  )
}

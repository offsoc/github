import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {componentRegistry, RequestForm} from '../components/RequestForm/index'
import type {NewExemptionRequestPayload} from '../delegated-bypass-types'
import {ExemptionRequestContainer} from '../components/ExemptionRequestContainer'
import {useRequestTypeContext} from '../contexts/RequestTypeContext'
import {RequestFormProvider} from '../contexts/RequestFormContext'

export function NewExemptionRequestPage() {
  const {ruleSuite} = useRoutePayload<NewExemptionRequestPayload>()
  const requestType = useRequestTypeContext()

  const {displayName, FormControls, instructions, violations} = componentRegistry[requestType]

  return (
    <ExemptionRequestContainer
      ruleSuite={ruleSuite}
      displayName={displayName}
      violations={violations}
      requestType={requestType}
    >
      <RequestFormProvider readOnly={false}>
        <RequestForm instructions={instructions}>{FormControls ? <FormControls /> : null}</RequestForm>
      </RequestFormProvider>
    </ExemptionRequestContainer>
  )
}

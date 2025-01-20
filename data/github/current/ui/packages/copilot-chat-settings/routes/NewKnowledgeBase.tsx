import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {RelayEnvironmentProvider} from 'react-relay'

import {NewKnowledgeBaseForm} from '../components/docs/NewKnowledgeBaseForm'
import type {NewKnowledgeBasePayload} from './payloads'

export function NewKnowledgeBase() {
  const payload = useRoutePayload<NewKnowledgeBasePayload>()

  return (
    <Providers>
      <NewKnowledgeBaseForm docsetOwner={payload.docsetOwner} />
    </Providers>
  )
}

const queryClient = new QueryClient()

// eslint-disable-next-line @typescript-eslint/ban-types
function Providers({children}: React.PropsWithChildren<{}>) {
  const environment = relayEnvironmentWithMissingFieldHandlerForNode()
  return (
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RelayEnvironmentProvider>
  )
}

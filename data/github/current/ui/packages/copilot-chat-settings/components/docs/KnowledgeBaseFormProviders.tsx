import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {RelayEnvironmentProvider} from 'react-relay'

const queryClient = new QueryClient()

// eslint-disable-next-line @typescript-eslint/ban-types
export function KnowledgeBaseFormProviders({children}: React.PropsWithChildren<{}>) {
  const environment = relayEnvironmentWithMissingFieldHandlerForNode()
  return (
    <RelayEnvironmentProvider environment={environment}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </RelayEnvironmentProvider>
  )
}

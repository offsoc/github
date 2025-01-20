import {IssueViewerContextProvider} from '@github-ui/issue-viewer/IssueViewerContextProvider'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {type FC, Suspense} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'

import {PaginationContextProvider, ViewPreferenceContextProvider, RepositoryContextProvider} from './contexts'
import {SsoAppPayloadAdapter} from './utils/sso/SsoAppPayloadAdapter'

type AppProps = {
  children?: React.ReactNode
}

const environment = relayEnvironmentWithMissingFieldHandlerForNode()

const App: FC<AppProps> = ({children}) => (
  <RelayEnvironmentProvider environment={environment}>
    <IssueViewerContextProvider>
      <SsoAppPayloadAdapter>
        <PaginationContextProvider>
          <ViewPreferenceContextProvider>
            <RepositoryContextProvider>
              <Suspense fallback={<span>Loading...</span>}>{children}</Suspense>
            </RepositoryContextProvider>
          </ViewPreferenceContextProvider>
        </PaginationContextProvider>
      </SsoAppPayloadAdapter>
    </IssueViewerContextProvider>
  </RelayEnvironmentProvider>
)

export default App

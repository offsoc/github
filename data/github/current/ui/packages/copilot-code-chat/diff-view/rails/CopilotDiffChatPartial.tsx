import {assertDataPresent} from '@github-ui/assert-data-present'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {registerReactPartial} from '@github-ui/react-core/register-partial'
import {relayEnvironmentWithMissingFieldHandlerForNode} from '@github-ui/relay-environment'
import {Suspense, useEffect} from 'react'
import {RelayEnvironmentProvider, graphql, useLazyLoadQuery} from 'react-relay'
import {
  DiffHeaderAskCopilotButton,
  ErrorAskCopilotButton,
  LoadingAskCopilotButton,
} from '../shared/DiffHeaderAskCopilotButton'
import {InjectedDiffEntries} from './InjectedDiffEntries'
import type {
  CopilotDiffChatPartial_DiffChatQuery,
  CopilotDiffChatPartial_DiffChatQuery$variables,
} from './__generated__/CopilotDiffChatPartial_DiffChatQuery.graphql'

const relayEnvironment = relayEnvironmentWithMissingFieldHandlerForNode()

const DiffChatQuery = graphql`
  query CopilotDiffChatPartial_DiffChatQuery(
    $repoOwner: String!
    $repoName: String!
    $prNumber: Int!
    $startOid: String!
    $endOid: String!
  ) {
    repository(owner: $repoOwner, name: $repoName) {
      pullRequest(number: $prNumber) {
        ...InjectedDiffEntries_PullRequestFragment
        ...DiffHeaderAskCopilotButton_data
      }
    }
  }
`

/** This has to be a separate component to use the Relay environment. */
function DiffChat(props: CopilotDiffChatPartial_DiffChatQuery$variables) {
  const pullRequest = useLazyLoadQuery<CopilotDiffChatPartial_DiffChatQuery>(DiffChatQuery, props).repository
    ?.pullRequest
  assertDataPresent(pullRequest)

  return (
    <>
      <InjectedDiffEntries pullRequestKey={pullRequest} startOid={props.startOid} endOid={props.endOid} />
      <DiffHeaderAskCopilotButton pullRequestKey={pullRequest} />
    </>
  )
}

/**
 * One partial for each Rails diff view inserts React components for each file, minimizing the performance cost of
 * instantiating many partials. In other words:
 *
 * > _One Partial to rule them all, One Partial to find them, One Partial to bring them all and in the React bind them._
 */
export function CopilotDiffChatPartial(props: CopilotDiffChatPartial_DiffChatQuery$variables) {
  // add a class name when rendering so that we can know when to change some styles downstream
  useEffect(() => {
    document.querySelector('diff-layout')?.classList.add('copilot-chat-enabled')
  }, [])

  return (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <ErrorBoundary fallback={<ErrorAskCopilotButton />}>
        <Suspense fallback={<LoadingAskCopilotButton />}>
          <DiffChat {...props} />
        </Suspense>
      </ErrorBoundary>
    </RelayEnvironmentProvider>
  )
}

registerReactPartial('copilot-code-chat', {
  Component: CopilotDiffChatPartial,
})

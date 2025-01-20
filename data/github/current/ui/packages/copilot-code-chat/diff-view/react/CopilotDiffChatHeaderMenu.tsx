import {assertDataPresent} from '@github-ui/assert-data-present'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {
  DiffHeaderAskCopilotButton,
  ErrorAskCopilotButton,
  LoadingAskCopilotButton,
} from '../shared/DiffHeaderAskCopilotButton'
import type {
  CopilotDiffChatHeaderMenu_Query,
  CopilotDiffChatHeaderMenu_Query$variables,
} from './__generated__/CopilotDiffChatHeaderMenu_Query.graphql'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Suspense} from 'react'
import styles from './CopilotDiffChatHeaderMenu.module.css'
import {CopilotCodeChatAccessLoader} from './DiffChatWrapper'

const HeaderMenuQuery = graphql`
  query CopilotDiffChatHeaderMenu_Query($pullRequestId: ID!, $startOid: String!, $endOid: String!) {
    pullRequest: node(id: $pullRequestId) {
      ... on PullRequest {
        ...DiffHeaderAskCopilotButton_data
      }
    }
  }
`

interface CopilotDiffChatHeaderMenuProps {
  queryVariables: CopilotDiffChatHeaderMenu_Query$variables
}

const BaseCopilotDiffChatHeaderMenu: React.FC<CopilotDiffChatHeaderMenuProps> = ({queryVariables}) => {
  const pullRequest = useLazyLoadQuery<CopilotDiffChatHeaderMenu_Query>(HeaderMenuQuery, queryVariables)?.pullRequest
  assertDataPresent(pullRequest)

  return <DiffHeaderAskCopilotButton pullRequestKey={pullRequest} />
}

// wrapper/loader
export const CopilotDiffChatHeaderMenu: React.FC<CopilotDiffChatHeaderMenuProps> = props => (
  <div className={styles.prxAskCopilotButton}>
    <ErrorBoundary fallback={<ErrorAskCopilotButton />}>
      <Suspense fallback={<LoadingAskCopilotButton />}>
        <CopilotCodeChatAccessLoader>
          <BaseCopilotDiffChatHeaderMenu {...props} />
        </CopilotCodeChatAccessLoader>
      </Suspense>
    </ErrorBoundary>
  </div>
)

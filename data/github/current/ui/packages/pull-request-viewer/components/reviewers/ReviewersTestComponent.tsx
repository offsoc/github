import {graphql, useLazyLoadQuery} from 'react-relay'
import type {createMockEnvironment} from 'relay-test-utils'

import PullRequestsAppWrapper from '../../test-utils/PullRequestsAppWrapper'
import type {ReviewersTestComponentQuery} from './__generated__/ReviewersTestComponentQuery.graphql'
import Reviewers from './Reviewers'

interface TestComponentProps {
  environment: ReturnType<typeof createMockEnvironment>
}

export function ReviewersTestComponent(props: TestComponentProps) {
  const TestComponentWithQuery = () => {
    const data = useLazyLoadQuery<ReviewersTestComponentQuery>(
      graphql`
        query ReviewersTestComponentQuery @relay_test_operation {
          pullRequest: node(id: "test-id") {
            ... on PullRequest {
              ...Reviewers_pullRequest
            }
          }
        }
      `,
      {},
    )
    if (!data.pullRequest) {
      return null
    }

    return <Reviewers pullRequest={data.pullRequest} />
  }

  return (
    <PullRequestsAppWrapper environment={props.environment} pullRequestId={'mock'}>
      <TestComponentWithQuery />
    </PullRequestsAppWrapper>
  )
}

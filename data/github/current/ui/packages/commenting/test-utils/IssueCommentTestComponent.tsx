import {noop} from '@github-ui/noop'
import {ComponentWithLazyLoadQuery} from '@github-ui/relay-test-utils/RelayComponents'
import React from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {createMockEnvironment} from 'relay-test-utils'

import type {IssueComment_issueComment$key} from '../components/issue-comment/__generated__/IssueComment_issueComment.graphql'
import {IssueComment} from '../components/issue-comment/IssueComment'

type IssueCommentTestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  commentId?: string
  isMinimized?: boolean
}

export function IssueCommentTestComponent({environment}: IssueCommentTestComponentProps) {
  const query = graphql`
    query IssueCommentTestComponentQuery($commentId: ID!) @relay_test_operation {
      comment: node(id: $commentId) {
        ... on Comment {
          ...IssueComment_issueComment
        }
      }
    }
  `
  const queryVariables = {
    commentId: 'IC_kwAEAg',
  }

  const createComponent = (data: unknown) => (
    <IssueComment
      comment={(data as {comment: IssueComment_issueComment$key}).comment}
      onLinkClick={noop}
      navigate={noop}
    />
  )
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">
        <ComponentWithLazyLoadQuery dataToComponent={createComponent} query={query} queryVariables={queryVariables} />
      </React.Suspense>
    </RelayEnvironmentProvider>
  )
}

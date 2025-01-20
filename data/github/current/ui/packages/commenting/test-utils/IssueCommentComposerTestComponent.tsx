import {noop} from '@github-ui/noop'
import {ComponentWithLazyLoadQuery} from '@github-ui/relay-test-utils/RelayComponents'
import React, {forwardRef} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {createMockEnvironment} from 'relay-test-utils'

import type {IssueCommentComposer$key} from '../components/issue-comment/__generated__/IssueCommentComposer.graphql'
import type {IssueCommentComposerSecondary$key} from '../components/issue-comment/__generated__/IssueCommentComposerSecondary.graphql'
import type {IssueCommentComposerViewer$key} from '../components/issue-comment/__generated__/IssueCommentComposerViewer.graphql'
import {IssueCommentComposer} from '../components/issue-comment/IssueCommentComposer'
import type {MarkdownComposerRef} from '../hooks/use-markdown-body'

type IssueCommentComposerTestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  ref: React.Ref<MarkdownComposerRef>
}

export const IssueCommentComposerTestComponent = forwardRef<
  MarkdownComposerRef,
  IssueCommentComposerTestComponentProps
>(({environment}, ref) => {
  const query = graphql`
    query IssueCommentComposerTestComponentQuery($commentId: ID!) @relay_test_operation {
      comment: node(id: $commentId) {
        ... on Comment {
          ...IssueCommentComposer
          ...IssueCommentComposerSecondary
        }
      }
      viewer {
        ...IssueCommentComposerViewer
      }
    }
  `
  const queryVariables = {
    commentId: 'IC_kwAEAg',
  }

  const createComponent = (data: unknown) => {
    return (
      <IssueCommentComposer
        issue={(data as {comment: IssueCommentComposer$key}).comment}
        issueSecondary={(data as {comment: IssueCommentComposerSecondary$key}).comment}
        viewer={(data as {viewer: IssueCommentComposerViewer$key}).viewer}
        onChange={noop}
        onSave={noop}
        onCancel={noop}
        singleKeyShortcutEnabled={true}
        ref={ref}
      />
    )
  }

  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="Loading...">
        <ComponentWithLazyLoadQuery dataToComponent={createComponent} query={query} queryVariables={queryVariables} />
      </React.Suspense>
    </RelayEnvironmentProvider>
  )
})
IssueCommentComposerTestComponent.displayName = 'IssueCommentComposerTestComponent'

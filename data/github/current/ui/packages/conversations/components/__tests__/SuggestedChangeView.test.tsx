import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {generateSuggestedChangeLineRangeFromDiffThread, SUGGESTED_CHANGES_ERRORS} from '../../suggested-changes'
import {
  buildComment,
  buildCommentAuthor,
  buildPullRequestDiffThread,
  buildReviewThread,
  mockCommentingImplementation,
  mockViewerData,
} from '../../test-utils/query-data'
import type {
  Comment,
  CommentingImplementation,
  Subject,
  SuggestedChange,
  SuggestedChangesConfiguration,
  ViewerData,
} from '../../types'
import {ReviewThreadComment} from '../ReviewThreadComment'

// Mock child components that fetch data on render, since we're not testing that functionality here
jest.mock('@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer', () => ({
  MarkdownEditHistoryViewer: () => null,
}))

jest.mock('@github-ui/reaction-viewer/ReactionViewer', () => ({
  ReactionViewer: () => null,
}))

interface TestComponentProps {
  comment: Comment
  commentingImplementation?: CommentingImplementation
  isOutdated: boolean
  filePath?: string
  skipValidationData?: boolean
  skipViewerData?: boolean
  isThreadResolved?: boolean
  subject?: Subject
  suggestedChangesConfig?: SuggestedChangesConfiguration
  viewerData?: ViewerData
}

// We test SuggestedChanges via ReviewThreadComment because it depends on the markdown body HTML
// Markdown-body HTML includes a div.js-apply-changes element in the API response that we are using to append React Portals to in the component
function TestComponent({
  comment,
  commentingImplementation,
  isOutdated = false,
  filePath = 'README.md',
  skipValidationData = false,
  isThreadResolved = false,
  subject,
  suggestedChangesConfig,
  viewerData,
  skipViewerData = false,
}: TestComponentProps) {
  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <ReviewThreadComment
        comment={comment}
        commentConnectionId={'connectionIdFromThread'}
        commentingImplementation={commentingImplementation ?? mockCommentingImplementation}
        filePath={filePath}
        isOutdated={isOutdated}
        isThreadResolved={isThreadResolved}
        repositoryId="test-id"
        subject={subject}
        subjectId="test-id"
        suggestedChangesConfig={
          suggestedChangesConfig ?? {
            showSuggestChangesButton: true,
            sourceContentFromDiffLines: 'my suggestion',
            onInsertSuggestedChange: noop,
            shouldInsertSuggestedChange: false,
            isValidSuggestionRange: true,
          }
        }
        applySuggestedChangesValidationData={
          !skipValidationData
            ? {
                lineRange: generateSuggestedChangeLineRangeFromDiffThread(
                  buildReviewThread({
                    subjectType: 'LINE',
                    subject: buildPullRequestDiffThread({
                      abbreviatedOid: '1234567',
                      startDiffSide: 'RIGHT',
                      endDiffSide: 'RIGHT',
                      startLine: 4,
                      endLine: 4,
                    }),
                  }),
                ),
              }
            : undefined
        }
        threadId="test-id"
        viewerData={skipViewerData ? undefined : viewerData ?? mockViewerData}
      />
    </AnalyticsProvider>
  )
}

const singleSuggestionBodyHTML = `
<div class="markdown-body">
  <p>Good idea?</p>
  <div class="js-suggested-changes-blob">
    <div>
      Suggested change
    </div>
    <table>
      <tbody>
        <tr>
        <td class="blob-num blob-num-deletion" data-line-number="3"></td>
        <td class="blob-code-inner blob-code-deletion js-blob-code-deletion blob-code-marker-deletion">change me</td>
      </tr>
      <tr>
        <td class="blob-num blob-num-addition text-right" data-line-number="3"></td>
        <td class="blob-code-inner blob-code-addition js-blob-code-addition blob-code-marker-addition">change me</td>
      </tr>
    </tbody>
    </table>
    <div class="js-apply-changes"></div>
  </div>
</div>
`

describe('SuggestedChangeView', () => {
  describe('does not render suggested change view', () => {
    test('when suggested changes are not enabled', () => {
      const comment = buildComment({
        author: buildCommentAuthor({login: 'commenter-with-association'}),
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
      })

      render(
        <TestComponent
          comment={comment}
          commentingImplementation={{...mockCommentingImplementation, suggestedChangesEnabled: false}}
          isOutdated={false}
          subject={{
            isInMergeQueue: false,
            state: 'OPEN',
          }}
        />,
      )

      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when validation data is not passed', () => {
      const comment = buildComment({
        author: buildCommentAuthor({login: 'commenter-with-association'}),
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          skipValidationData={true}
          subject={{
            isInMergeQueue: false,
            state: 'OPEN',
          }}
        />,
      )

      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })
  })

  test('shows more than one "Add suggestion to batch" button if there are 2 or more suggested changes', () => {
    const comment = buildComment({
      author: buildCommentAuthor({login: 'commenter-with-association'}),
      bodyHTML: `
        <div class="markdown-body">
          <p>Good idea?</p>
          <div class="js-suggested-changes-blob">
            <div>
              Suggested change
            </div>
            <div itemprop="text" class="blob-wrapper data file">
              <table>
                <tbody>
                  <tr>
                    <td class="blob-num blob-num-deletion" data-line-number="1"></td>
                    <td class="blob-code-inner blob-code-deletion js-blob-code-deletion blob-code-marker-deletion">Dolores debitis sint. At mollitia occaecati. Debitis blanditiis soluta.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="js-apply-changes"></div>
          </div>
          <p>Or we could do this</p>
          <div class="js-suggested-changes-blob">
            <div>
              Suggested change
            </div>
            <div itemprop="text" class="blob-wrapper data file">
              <table>
                <tbody>
                  <tr>
                    <td class="blob-num blob-num-addition" data-line-number="1"></td>
                    <td class="blob-code-inner blob-code-addition js-blob-code-addition blob-code-marker-addition">Dolores debitis sint.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="js-apply-changes"></div>
          </div>
        </div>
      `,
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    render(
      <TestComponent
        comment={comment}
        commentingImplementation={mockCommentingImplementation}
        isOutdated={false}
        subject={{
          isInMergeQueue: false,
          state: 'OPEN',
        }}
      />,
    )

    const addSuggestionToBatchButtons = screen.getAllByRole('button', {name: 'Add suggestion to batch'})
    expect(addSuggestionToBatchButtons).toHaveLength(2)
  })

  test('adding a suggestion to a batch makes an apply suggestion button show up with a label indicating how many changes are in the batch', async () => {
    const mockSuggestedChangesBatch: SuggestedChange[] = []
    const mockCommentingImplementationWithPendingSuggestedChanges = {
      ...mockCommentingImplementation,
      addSuggestedChangeToPendingBatch: (sg: SuggestedChange) => mockSuggestedChangesBatch.push(sg),
      pendingSuggestedChangesBatch: mockSuggestedChangesBatch,
    }
    // please note that markdown-body HTML includes a div.js-apply-changes element in the API response that we are using to append React Portals to in the component
    const comment = buildComment({
      bodyHTML: singleSuggestionBodyHTML,
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    const {rerender, user} = render(
      <TestComponent
        comment={comment}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
        subject={{
          isInMergeQueue: false,
          state: 'OPEN',
        }}
        isOutdated={false}
      />,
    )

    const addSuggestionToBatchButton = screen.getByRole('button', {name: 'Add suggestion to batch'})
    await user.click(addSuggestionToBatchButton)
    expectAnalyticsEvents({
      type: 'comments.add_suggested_change_to_batch',
      target: 'ADD_SUGGESTED_CHANGE_TO_BATCH_BUTTON',
    })
    // by rerendering explicitly, it saves us from needing to mock out the context provider that's in a separate package
    rerender(
      <TestComponent
        comment={comment}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
        isOutdated={false}
        subject={{
          isInMergeQueue: false,
          state: 'OPEN',
        }}
      />,
    )
    expect(screen.getByRole('button', {name: 'Apply suggestion (1)'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Remove from batch'})).toBeInTheDocument()
  })

  test('once a suggestion is added to batch, you can remove from batch', async () => {
    const mockSuggestedChangesBatch: SuggestedChange[] = []
    const mockCommentingImplementationWithPendingSuggestedChanges = {
      ...mockCommentingImplementation,
      addSuggestedChangeToPendingBatch: (sg: SuggestedChange) => mockSuggestedChangesBatch.push(sg),
      pendingSuggestedChangesBatch: mockSuggestedChangesBatch,
      removeSuggestedChangeFromPendingBatch: (_: SuggestedChange) => {
        // this mock function just resets the batch to an empty array; we don't need to test the actual implementation here
        mockSuggestedChangesBatch.length = 0
      },
    }
    // please note that markdown-body HTML includes a div.js-apply-changes element in the API response that we are using to append React Portals to in the component
    const comment = buildComment({
      bodyHTML: `
        <div class="markdown-body">
          <p>Good idea?</p>
          <div class="js-suggested-changes-blob">
            <div>
              Suggested change
            </div>
            <div itemprop="text" class="blob-wrapper data file">
              <table>
                <tbody>
                  <tr>
                    <td class="blob-num blob-num-deletion" data-line-number="1"></td>
                    <td class="blob-code-inner blob-code-deletion js-blob-code-deletion blob-code-marker-deletion">Dolores debitis sint. At mollitia occaecati. Debitis blanditiis soluta.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="js-apply-changes"></div>
          </div>
        </div>
      `,
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    const {rerender, user} = render(
      <TestComponent
        comment={comment}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
        isOutdated={false}
        subject={{
          isInMergeQueue: false,
          state: 'OPEN',
        }}
      />,
    )
    expect(screen.queryByText('Pending in batch')).not.toBeInTheDocument()
    const addSuggestionToBatchButton = screen.getByRole('button', {name: 'Add suggestion to batch'})
    await user.click(addSuggestionToBatchButton)
    // by rerendering explicitly, it saves us from needing to mock out the context provider that's in a separate package
    rerender(
      <TestComponent
        comment={comment}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
        isOutdated={false}
        subject={{
          isInMergeQueue: false,
          state: 'OPEN',
        }}
      />,
    )
    const removeFromBatchButton = screen.getByRole('button', {name: 'Remove from batch'})
    expect(removeFromBatchButton).toBeInTheDocument()

    expect(screen.getByText('Pending in batch')).toBeInTheDocument()
    expect(mockCommentingImplementationWithPendingSuggestedChanges.pendingSuggestedChangesBatch).toHaveLength(1)

    await user.click(removeFromBatchButton)
    rerender(
      <TestComponent
        comment={comment}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
        isOutdated={false}
      />,
    )
    expect(mockCommentingImplementationWithPendingSuggestedChanges.pendingSuggestedChangesBatch).toHaveLength(0)
    expect(screen.queryByText('Pending in batch')).not.toBeInTheDocument()
    expectAnalyticsEvents(
      {
        type: 'comments.add_suggested_change_to_batch',
        target: 'ADD_SUGGESTED_CHANGE_TO_BATCH_BUTTON',
      },
      {
        type: 'comments.remove_suggested_change_from_batch',
        target: 'REMOVE_SUGGESTED_CHANGE_FROM_BATCH_BUTTON',
      },
    )
  })

  describe('showing validation messages', () => {
    test('when the comment is outdated', () => {
      const comment = buildComment({
        author: buildCommentAuthor({login: 'commenter-with-association'}),
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={true}
          subject={{
            isInMergeQueue: false,
            state: 'OPEN',
          }}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.IS_OUTDATED)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when the comment is pending', () => {
      const comment = buildComment({
        author: buildCommentAuthor({login: 'commenter-with-association'}),
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        state: 'PENDING',
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          subject={{
            isInMergeQueue: false,
            state: 'OPEN',
          }}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.IS_PENDING)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when the comment is resolved', () => {
      const comment = buildComment({
        author: buildCommentAuthor({login: 'commenter-with-association'}),
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          isThreadResolved={true}
          subject={{
            isInMergeQueue: false,
            state: 'OPEN',
          }}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.IS_RESOLVED)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when subject data is not passed', () => {
      const author = buildCommentAuthor({login: 'commenter-with-association'})
      const comment = buildComment({
        author,
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        reference: {
          number: 1,
          author,
        },
      })

      render(<TestComponent comment={comment} isOutdated={false} isThreadResolved={false} subject={{}} />)

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_CLOSED)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when the pull request is closed', () => {
      const author = buildCommentAuthor({login: 'commenter-with-association'})
      const comment = buildComment({
        author,
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        reference: {
          number: 1,
          author,
        },
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          isThreadResolved={false}
          subject={{isInMergeQueue: false, state: 'CLOSED'}}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_CLOSED)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when the pull request is in the merge queue', () => {
      const author = buildCommentAuthor({login: 'commenter-with-association'})
      const comment = buildComment({
        author,
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        reference: {
          number: 1,
          author,
        },
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          isThreadResolved={false}
          subject={{isInMergeQueue: true, state: 'OPEN'}}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.PULL_REQUEST_IS_IN_MERGE_QUEUE)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when the user does not have permission to apply the suggestion', () => {
      const author = buildCommentAuthor({login: 'commenter-with-association'})
      const comment = buildComment({
        author,
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        reference: {
          number: 1,
          author,
        },
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          isThreadResolved={false}
          subject={{isInMergeQueue: false, state: 'OPEN'}}
          viewerData={{...mockViewerData, viewerCanApplySuggestion: false}}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.USER_CANNOT_APPLY_SUGGESTION)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when user data is not passed', () => {
      const author = buildCommentAuthor({login: 'commenter-with-association'})
      const comment = buildComment({
        author,
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        reference: {
          number: 1,
          author,
        },
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          isThreadResolved={false}
          subject={{isInMergeQueue: false, state: 'OPEN'}}
          skipViewerData={true}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.USER_CANNOT_APPLY_SUGGESTION)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })

    test('when the suggested change is equivalent to the original line(s)', () => {
      const author = buildCommentAuthor({login: 'commenter-with-association'})
      const comment = buildComment({
        author,
        bodyHTML: singleSuggestionBodyHTML,
        viewerDidAuthor: false,
        viewerRelationship: 'CONTRIBUTOR',
        reference: {
          number: 1,
          author,
        },
      })

      render(
        <TestComponent
          comment={comment}
          isOutdated={false}
          suggestedChangesConfig={{
            showSuggestChangesButton: true,
            sourceContentFromDiffLines: 'change me',
            onInsertSuggestedChange: noop,
            shouldInsertSuggestedChange: false,
            isValidSuggestionRange: true,
          }}
          subject={{
            isInMergeQueue: false,
            state: 'OPEN',
          }}
        />,
      )

      expect(screen.getByText(SUGGESTED_CHANGES_ERRORS.UNCHANGED_CODE)).toBeInTheDocument()
      const addSuggestionToBatchButtons = screen.queryAllByRole('button', {name: 'Add suggestion to batch'})
      expect(addSuggestionToBatchButtons).toHaveLength(0)
    })
  })
})

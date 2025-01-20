import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen, waitFor} from '@testing-library/react'

import {generateSuggestedChangeLineRangeFromDiffThread} from '../../suggested-changes'
import {
  buildComment,
  buildCommentAuthor,
  buildPullRequestDiffThread,
  buildReviewThread,
  mockCommentingImplementation,
  mockViewerData,
} from '../../test-utils/query-data'
import type {ApplySuggestedChangesValidationData, Comment, CommentingImplementation} from '../../types'
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
  applySuggestedChangesValidationData?: ApplySuggestedChangesValidationData
}

jest.setTimeout(10000)

function TestComponent({
  comment,
  commentingImplementation,
  isOutdated = false,
  filePath = 'README.md',
  applySuggestedChangesValidationData,
}: TestComponentProps) {
  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <ReviewThreadComment
        comment={comment}
        commentConnectionId={'connectionIdFromThread'}
        commentingImplementation={commentingImplementation ?? mockCommentingImplementation}
        filePath={filePath}
        isOutdated={isOutdated}
        isThreadResolved={false}
        repositoryId="test-id"
        subject={{
          isInMergeQueue: false,
          state: 'OPEN',
        }}
        subjectId="test-id"
        suggestedChangesConfig={{
          showSuggestChangesButton: true,
          sourceContentFromDiffLines: 'original source line',
          onInsertSuggestedChange: noop,
          shouldInsertSuggestedChange: false,
          isValidSuggestionRange: true,
        }}
        applySuggestedChangesValidationData={
          applySuggestedChangesValidationData ?? {
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
        }
        threadId="test-id"
        viewerData={mockViewerData}
      />
    </AnalyticsProvider>
  )
}

describe('rendering comments', () => {
  test('renders the comments in the thread and has no outdated, pending, or author labels by default', async () => {
    const comment = buildComment({
      author: buildCommentAuthor({login: 'commenter-with-no-association'}),
      bodyHTML: 'test comment',
      viewerDidAuthor: false,
      authorAssociation: 'NONE',
    })

    render(<TestComponent comment={comment} isOutdated={false} />)

    expect(screen.getByText('test comment')).toBeVisible()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText('Outdated')).not.toBeInTheDocument()
    expect(screen.queryByText('Author')).not.toBeInTheDocument()
  })

  test('renders the pending label if the comment state is pending', async () => {
    const comment = buildComment({
      bodyHTML: 'test comment',
      state: 'PENDING',
    })

    render(<TestComponent comment={comment} isOutdated={false} />)

    expect(screen.getByText('Pending')).toBeVisible()
  })

  // Skipping temporarily, see https://github.com/github/pull-requests/issues/9022
  test.skip('renders the outdated label if the comment thread is outdated', async () => {
    const comment = buildComment({bodyHTML: 'test comment'})

    render(<TestComponent comment={comment} isOutdated={true} />)

    expect(screen.getByText('Outdated')).toBeVisible()
  })

  test('renders the author label if commenter is PR author', async () => {
    const comment = buildComment({
      bodyHTML: 'test comment',
      viewerDidAuthor: true,
    })

    render(<TestComponent comment={comment} isOutdated={false} />)

    expect(screen.getByText('Author')).toBeVisible()
  })

  test('renders the author association label if commenter has association', async () => {
    const comment = buildComment({
      author: buildCommentAuthor({login: 'commenter-with-association'}),
      bodyHTML: 'test comment',
      viewerDidAuthor: false,
      authorAssociation: 'CONTRIBUTOR',
    })

    render(<TestComponent comment={comment} isOutdated={false} />)

    expect(screen.getByText('Contributor')).toBeVisible()
  })

  test('renders the comment actions button and a permalink to the comment', async () => {
    const comment = buildComment({
      bodyHTML: 'test comment',
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
      currentDiffResourcePath: '/monalisa/smile/pull/1/files#r1',
      url: '/monalisa/smile/pull/1#r1',
    })

    render(<TestComponent comment={comment} isOutdated={false} />)

    expect(screen.getByLabelText('Comment actions')).toBeVisible()
    // Since the link uses the `<relative-time>` custom element there's no way to figure out the proper
    // accessible name for us to query by.
    const links = screen.queryAllByRole('link')
    expect(links[1]?.getAttribute('href')).toEqual(`${window.location.origin}${window.location.pathname}#r1`)
  })

  test('copy link button', async () => {
    const comment = buildComment({
      bodyHTML: 'test comment',
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
      currentDiffResourcePath: '/monalisa/smile/pull/1/files#r1',
      url: '/monalisa/smile/pull/1#r1',
    })

    const {user} = render(<TestComponent comment={comment} isOutdated={false} />)
    const actionMenu = await screen.findByLabelText('Comment actions')
    await user.click(actionMenu)

    const button = await screen.findByLabelText('Copy link')
    await user.click(button)

    await expect(navigator.clipboard.readText()).resolves.toEqual(
      `${window.location.origin}${window.location.pathname}#r1`,
    )
  })
})

describe('editing comments', () => {
  afterEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  test('submitting clears local storage and saves the comment', async () => {
    const mockSaveComment = jest.fn((args: {onCompleted?: () => void}) => args.onCompleted?.())
    const commentingImpl = {
      ...mockCommentingImplementation,
      editComment: mockSaveComment,
    }
    const comment = buildComment({
      bodyHTML: 'original comment text',
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    const {user} = render(
      <TestComponent comment={comment} commentingImplementation={commentingImpl} isOutdated={false} />,
    )

    const actionMenu = await screen.findByLabelText('Comment actions')
    await user.click(actionMenu)

    const button = await screen.findByLabelText('Edit')
    await user.click(button)

    expect(screen.getByRole('button', {name: 'Update'})).toBeVisible()

    const cachedCommentKey = `${comment.id}`
    const updatedCommentText = 'This is an updated comment'

    const input = await screen.findByPlaceholderText('Leave a comment')
    // clear the input before typing
    await user.clear(input)
    await user.type(input, updatedCommentText)

    const cachedComment = window.localStorage.getItem(cachedCommentKey)
    const parsedCachedComment =
      cachedComment && cachedComment !== '' ? (JSON.parse(cachedComment) as {text: string}) : null

    expect(parsedCachedComment?.text).toEqual(updatedCommentText)
    expect(screen.getByPlaceholderText('Leave a comment')).toHaveValue(updatedCommentText)

    const updateButton = await screen.findByRole('button', {name: 'Update'})
    await user.click(updateButton)

    // the comment should be cleared from localStorage
    const clearedCachedComment = window.localStorage.getItem(cachedCommentKey)
    expect(clearedCachedComment).toBeNull()

    // the editor should be hidden
    expect(screen.queryByPlaceholderText('Leave a comment')).toBeNull()

    // the comment should be updated
    expect(mockSaveComment).toHaveBeenCalledTimes(1)
  })

  test('cancelling will clear the content in local storage and hide the text editor', async () => {
    const mockSaveComment = jest.fn((args: {onCompleted?: () => void}) => args.onCompleted?.())
    const commentingImpl = {
      ...mockCommentingImplementation,
      editComment: mockSaveComment,
    }
    const comment = buildComment({
      bodyHTML: 'original comment text',
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    const {user} = render(
      <TestComponent comment={comment} commentingImplementation={commentingImpl} isOutdated={false} />,
    )

    const actionMenu = await screen.findByLabelText('Comment actions')
    await user.click(actionMenu)

    const button = await screen.findByLabelText('Edit')
    await user.click(button)

    expect(screen.getByRole('button', {name: 'Update'})).toBeVisible()

    const cachedCommentKey = `${comment.id}`
    const updatedCommentText = 'This is an updated comment'

    const input = await screen.findByPlaceholderText('Leave a comment')
    // clear the input before typing
    await user.clear(input)
    await user.type(input, updatedCommentText)

    const cachedComment = window.localStorage.getItem(cachedCommentKey)
    const parsedCachedComment =
      cachedComment && cachedComment !== '' ? (JSON.parse(cachedComment) as {text: string}) : null

    expect(parsedCachedComment?.text).toEqual('This is an updated comment')
    expect(screen.getByPlaceholderText('Leave a comment')).toHaveValue(updatedCommentText)

    const cancelButton = await screen.findByRole('button', {name: 'Cancel'})
    await user.click(cancelButton)

    // the comment should be cleared from localStorage
    const clearedCachedComment = window.localStorage.getItem(cachedCommentKey)
    expect(clearedCachedComment).toBeNull()

    // the comment body should not have been updated
    expect(mockSaveComment).toHaveBeenCalledTimes(0)
    expect(screen.queryByPlaceholderText('Leave a comment')).toBeNull()
    expect(screen.getByText('original comment text')).toBeVisible()
  })

  test('focuses on the comment box when editing a comment', async () => {
    const mockSaveComment = jest.fn((args: {onCompleted?: () => void}) => args.onCompleted?.())
    const commentingImpl = {
      ...mockCommentingImplementation,
      editComment: mockSaveComment,
    }
    const comment = buildComment({
      bodyHTML: 'original comment text',
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    const {user} = render(
      <TestComponent comment={comment} commentingImplementation={commentingImpl} isOutdated={false} />,
    )

    const actionMenu = await screen.findByLabelText('Comment actions')
    await user.click(actionMenu)

    const button = await screen.findByLabelText('Edit')
    await user.click(button)

    // expect the comment box to be focused
    await waitFor(() => expect(screen.getByPlaceholderText('Leave a comment')).toHaveFocus())
  })

  test('shows a validation error if suggested change is invalid', async () => {
    const mockSaveComment = jest.fn((args: {onCompleted?: () => void}) => args.onCompleted?.())
    const commentingImpl = {
      ...mockCommentingImplementation,
      editComment: mockSaveComment,
    }
    const comment = buildComment({
      bodyHTML: 'original comment text',
      viewerDidAuthor: false,
      viewerRelationship: 'CONTRIBUTOR',
    })

    const {user} = render(
      <TestComponent comment={comment} commentingImplementation={commentingImpl} isOutdated={false} />,
    )

    const actionMenu = await screen.findByLabelText('Comment actions')
    await user.click(actionMenu)

    const button = await screen.findByLabelText('Edit')
    await user.click(button)

    const input = screen.getByPlaceholderText('Leave a comment')
    await user.clear(input)
    await user.type(input, '```suggestion\noriginal source line\n```\n')

    const updateButton = await screen.findByRole('button', {name: 'Update'})
    await user.click(updateButton)

    const expectedValidationError = 'Suggested change cannot be the same as the original line'
    expect(screen.getByText(expectedValidationError)).toBeInTheDocument()

    // the comment body should not have been updated
    expect(mockSaveComment).toHaveBeenCalledTimes(0)
  })
})

describe('when comment HTML has suggested changes', () => {
  // Additional tests found in SuggestedChangeView.test.tsx
  test('shows one "Add suggestion to batch" button if there is only 1 suggested change', () => {
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

    render(
      <TestComponent comment={comment} commentingImplementation={mockCommentingImplementation} isOutdated={false} />,
    )

    const addSuggestionToBatchButton = screen.getByRole('button', {name: 'Add suggestion to batch'})
    expect(addSuggestionToBatchButton).toBeInTheDocument()
  })
})

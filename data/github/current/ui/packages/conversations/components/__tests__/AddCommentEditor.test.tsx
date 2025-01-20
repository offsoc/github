import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, waitFor} from '@testing-library/react'

import type {SuggestedChangesConfiguration} from '../../types'
import {AddCommentEditor} from '../AddCommentEditor'

interface TestComponentProps {
  batchingEnabled?: boolean
  batchPending?: boolean
  condensed?: boolean
  filePath: string
  isReplying?: boolean
  lineNumber?: number
  subjectId: string
  suggestedChangesConfig?: SuggestedChangesConfiguration
  onAddComment?: () => void
  quotedText?: string
}

function TestComponent(props: TestComponentProps) {
  return (
    <AddCommentEditor
      {...props}
      batchPending={props.batchPending ?? false}
      batchingEnabled={props.batchingEnabled ?? false}
      condensed={false}
      fileLevelComment={false}
      repositoryId="test-id"
      side="RIGHT"
      commentBoxConfig={{
        useMonospaceFont: false,
        pasteUrlsAsPlainText: false,
      }}
    />
  )
}

afterEach(() => {
  window.localStorage.clear()
})

test('it stores the comment text to localStorage when adding text', async () => {
  const subjectId = 'PR_QUERY'
  const filePath = 'example.go'
  const line = 1
  const cachedCommentKey = `PullRequest:${subjectId}-File:${filePath}-Line:${line}-DiffSide:RIGHT`
  const cachedCommentText = 'This is a new comment'
  const {user} = render(<TestComponent lineNumber={line} filePath={filePath} subjectId={subjectId} />)

  const input = await screen.findByPlaceholderText('Leave a comment')
  await user.type(input, cachedCommentText)

  const cachedComment = window.localStorage.getItem(cachedCommentKey)
  const parsedCachedComment = cachedComment && cachedComment !== '' ? JSON.parse(cachedComment) : null

  expect(parsedCachedComment?.text).toEqual('This is a new comment')
  expect(screen.getByPlaceholderText('Leave a comment')).toHaveValue(cachedCommentText)
})

// eslint-disable-next-line jest/expect-expect
test.skip('it shows dropdown suggesting emojis', async () => {
  const subjectId = 'PR_QUERY'
  const {user} = render(<TestComponent filePath="example.go" lineNumber={1} subjectId={subjectId} />)

  const input = await screen.findByPlaceholderText('Leave a comment')
  await user.type(input, ':')
})

test('cancel button is not visible when cancel callback is not passed', async () => {
  const subjectId = 'PR_QUERY'
  render(<TestComponent filePath="example.go" isReplying={true} lineNumber={1} subjectId={subjectId} />)

  expect(screen.queryByRole('button', {name: 'Cancel'})).not.toBeInTheDocument()
})

test('it prefills with quoted text', async () => {
  const subjectId = 'PR_QUERY'
  const quotedText = '> This is quoted text'
  render(
    <TestComponent
      filePath="example.go"
      isReplying={true}
      lineNumber={1}
      quotedText={quotedText}
      subjectId={subjectId}
    />,
  )

  expect(screen.getByPlaceholderText('Leave a comment')).toHaveValue(quotedText)
})

describe('button text', () => {
  test('when a user is replying to a comment, batching is not enabled, and no batch pending', async () => {
    const subjectId = 'PR_QUERY'
    render(
      <TestComponent
        filePath="example.go"
        batchingEnabled={false}
        batchPending={false}
        isReplying={true}
        lineNumber={1}
        subjectId={subjectId}
      />,
    )

    const replyButton = screen.getByRole('button', {name: 'Reply'})
    expect(replyButton).toBeInTheDocument()
    expect(screen.queryByText('Start a review')).toBeNull()
    expect(screen.queryByText('Add review comment')).toBeNull()
  })

  test('when a user is not replying, batching is enabled, and no batch pending', async () => {
    const subjectId = 'PR_QUERY'
    render(
      <TestComponent
        filePath="example.go"
        batchingEnabled={true}
        batchPending={false}
        isReplying={false}
        lineNumber={1}
        subjectId={subjectId}
      />,
    )

    const replyButton = screen.getByRole('button', {name: 'Add comment'})
    expect(replyButton).toBeInTheDocument()
    const startReviewButton = screen.getByRole('button', {name: 'Start a review'})
    expect(startReviewButton).toBeInTheDocument()
  })

  test('when a user is not replying, batching is enabled and there is a batch pending', () => {
    const subjectId = 'PR_QUERY'
    render(
      <TestComponent
        filePath="example.go"
        batchingEnabled={true}
        batchPending={true}
        lineNumber={1}
        subjectId={subjectId}
      />,
    )

    const addReviewCommentButton = screen.getByRole('button', {name: 'Add review comment'})
    expect(addReviewCommentButton).toBeInTheDocument()
  })

  test('when a user is not replying, batching is not enabled, and there is no batch pending', () => {
    const subjectId = 'PR_QUERY'
    render(<TestComponent filePath="example.go" batchingEnabled={false} lineNumber={1} subjectId={subjectId} />)

    expect(screen.getByRole('button', {name: 'Add comment'})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Add review comment'})).toBeNull()
    expect(screen.queryByRole('button', {name: 'Start a review'})).toBeNull()
  })
})

describe('suggested change validations', () => {
  const expectedValidationError = 'Suggested change cannot be the same as the original line'

  test('render error message when suggested change is the same as diff line content', async () => {
    const subjectId = 'PR_QUERY'
    const suggestedChangesConfig = {
      showSuggestChangesButton: true,
      onInsertSuggestedChange: noop,
      sourceContentFromDiffLines: 'suggested change line',
      isValidSuggestionRange: true,
    }
    const {user} = render(
      <TestComponent
        filePath="example.go"
        lineNumber={1}
        subjectId={subjectId}
        suggestedChangesConfig={suggestedChangesConfig}
      />,
    )

    const input = screen.getByPlaceholderText('Leave a comment')
    await user.type(input, '```suggestion\nsuggested change line\n```')

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()

    const commentButton = screen.getByRole('button', {name: 'Add comment'})
    expect(commentButton).toBeInTheDocument()
    fireEvent.click(commentButton)

    expect(screen.getByText(expectedValidationError)).toBeInTheDocument()
  })

  test('renders an error message if any of the inline suggestions have an error', async () => {
    const subjectId = 'PR_QUERY'
    const suggestedChangesConfig = {
      showSuggestChangesButton: true,
      onInsertSuggestedChange: noop,
      sourceContentFromDiffLines: 'suggested change line',
      isValidSuggestionRange: true,
    }
    const {user} = render(
      <TestComponent
        filePath="example.go"
        lineNumber={1}
        subjectId={subjectId}
        suggestedChangesConfig={suggestedChangesConfig}
      />,
    )

    const input = screen.getByPlaceholderText('Leave a comment')
    const validSuggestion = '```suggestion\nhow about this instead\n```'
    const invalidSuggestion = '```suggestion\nsuggested change line\n```'
    await user.type(input, `What do you think about this?\n${validSuggestion}\n\nOr…\n\n${invalidSuggestion}`)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()

    const commentButton = screen.getByRole('button', {name: 'Add comment'})
    expect(commentButton).toBeInTheDocument()
    fireEvent.click(commentButton)

    expect(screen.getByText(expectedValidationError)).toBeInTheDocument()
  })

  test('catches errors in non-standard suggestion fence blocks', async () => {
    const subjectId = 'PR_QUERY'
    const suggestedChangesConfig = {
      showSuggestChangesButton: true,
      onInsertSuggestedChange: noop,
      sourceContentFromDiffLines: 'suggested change line',
      isValidSuggestionRange: true,
    }
    const {user} = render(
      <TestComponent
        filePath="example.go"
        lineNumber={1}
        subjectId={subjectId}
        suggestedChangesConfig={suggestedChangesConfig}
      />,
    )

    const input = screen.getByPlaceholderText('Leave a comment')
    const invalidSuggestion = '   ~~~~suggestion\nsuggested change line\n~~~~~~'
    await user.type(input, `What do you think about this?\n${invalidSuggestion}\n`)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()

    const commentButton = screen.getByRole('button', {name: 'Add comment'})
    expect(commentButton).toBeInTheDocument()
    fireEvent.click(commentButton)

    expect(screen.getByText(expectedValidationError)).toBeInTheDocument()
  })

  test('catches errors even if suggestion block is indented', async () => {
    const subjectId = 'PR_QUERY'
    const suggestedChangesConfig = {
      showSuggestChangesButton: true,
      onInsertSuggestedChange: noop,
      sourceContentFromDiffLines: 'suggested change line',
      isValidSuggestionRange: true,
    }
    const {user} = render(
      <TestComponent
        filePath="example.go"
        lineNumber={1}
        subjectId={subjectId}
        suggestedChangesConfig={suggestedChangesConfig}
      />,
    )

    const input = screen.getByPlaceholderText('Leave a comment')
    const invalidSuggestion = '  ~~~suggestion\n  suggested change line\n~~~'
    await user.type(input, `What do you think about this?\n${invalidSuggestion}\n`)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()

    const commentButton = screen.getByRole('button', {name: 'Add comment'})
    expect(commentButton).toBeInTheDocument()
    fireEvent.click(commentButton)

    expect(screen.getByText(expectedValidationError)).toBeInTheDocument()
  })

  test('does not invalidate suggestion if it is adjusting indentation', async () => {
    const subjectId = 'PR_QUERY'
    const suggestedChangesConfig = {
      showSuggestChangesButton: true,
      onInsertSuggestedChange: noop,
      sourceContentFromDiffLines: 'suggested change line',
      isValidSuggestionRange: true,
    }
    const {user} = render(
      <TestComponent
        filePath="example.go"
        lineNumber={1}
        subjectId={subjectId}
        suggestedChangesConfig={suggestedChangesConfig}
      />,
    )

    const input = screen.getByPlaceholderText('Leave a comment')
    const validSuggestion = '~~~suggestion\n  suggested change line\n~~~'
    await user.type(input, `This line should be indented\n${validSuggestion}\n`)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()

    const commentButton = screen.getByRole('button', {name: 'Add comment'})
    expect(commentButton).toBeInTheDocument()
    fireEvent.click(commentButton)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()
  })

  test('does not invalidate suggestion if adjusting trailing whitespace', async () => {
    const subjectId = 'PR_QUERY'
    const suggestedChangesConfig = {
      showSuggestChangesButton: true,
      onInsertSuggestedChange: noop,
      sourceContentFromDiffLines: 'suggested change line  ',
      isValidSuggestionRange: true,
    }
    const {user} = render(
      <TestComponent
        filePath="example.go"
        lineNumber={1}
        subjectId={subjectId}
        suggestedChangesConfig={suggestedChangesConfig}
      />,
    )

    const input = screen.getByPlaceholderText('Leave a comment')
    const validSuggestion = '~~~suggestion\nsuggested change line\n~~~'
    await user.type(input, `Looks like there is some trailing whitespace here:\n${validSuggestion}\n`)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()

    const commentButton = screen.getByRole('button', {name: 'Add comment'})
    expect(commentButton).toBeInTheDocument()
    fireEvent.click(commentButton)

    expect(screen.queryByText(expectedValidationError)).not.toBeInTheDocument()
  })
})

describe('when primary action is used on a reply', () => {
  describe('when batching is enabled', () => {
    test('submits reply as a batched review comment', async () => {
      const subjectId = 'PR_QUERY'
      const onAddComment = jest.fn()
      const {user} = render(
        <TestComponent
          filePath="example.go"
          lineNumber={1}
          subjectId={subjectId}
          onAddComment={onAddComment}
          batchingEnabled
          isReplying
        />,
      )

      const input = screen.getByPlaceholderText('Leave a comment')
      const commentReplyText = `Leaving a batched comment review reply`
      const primaryActionKeys = `{Control>}{Enter}{/Control}`
      await user.type(input, commentReplyText)
      await user.type(input, primaryActionKeys)

      await waitFor(() =>
        expect(onAddComment).toHaveBeenCalledWith(
          expect.objectContaining({commentText: commentReplyText, submitBatch: false}),
        ),
      )
    })
  })

  describe('when batching is disabled', () => {
    test('submits reply as a single review comment', async () => {
      const subjectId = 'PR_QUERY'
      const onAddComment = jest.fn()
      const {user} = render(
        <TestComponent
          filePath="example.go"
          lineNumber={1}
          subjectId={subjectId}
          onAddComment={onAddComment}
          batchingEnabled={false}
          isReplying
        />,
      )

      const input = screen.getByPlaceholderText('Leave a comment')
      const commentReplyText = `Leaving a single comment review reply`
      const primaryActionKeys = `{Control>}{Enter}{/Control}`
      await user.type(input, commentReplyText)
      await user.type(input, primaryActionKeys)

      await waitFor(() =>
        expect(onAddComment).toHaveBeenCalledWith(
          expect.objectContaining({commentText: commentReplyText, submitBatch: true}),
        ),
      )
    })
  })
})

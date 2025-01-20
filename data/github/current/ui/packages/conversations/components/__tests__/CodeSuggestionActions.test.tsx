import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {render} from '@github-ui/react-core/test-utils'
import {screen, within} from '@testing-library/react'

import {generateSuggestedChangeLineRangeFromDiffThread} from '../../suggested-changes'
import {buildPullRequestDiffThread, buildReviewThread, mockCommentingImplementation} from '../../test-utils/query-data'
import type {CommentingImplementation, SuggestedChange} from '../../types'
import {CodeSuggestionActions} from '../CodeSuggestionActions'

const path = '__tests__/CodeSuggestionActions.test.tsx'
const mockSuggestedChange = {
  authorLogin: 'monalisa',
  commentId: 'C_12xdwq',
  path,
  suggestion: [
    "describe('default state', () => {",
    '  test(\'renders "Add suggestion to batch" and down-chevron Icon button\', () => {',
    '    render(',
    '      <CodeSuggestionActions commentingImplementation={mockCommentingImplementat />,',
    '    )',
    '',
    "    expect(screen.getByRole('button', {name: 'Add suggestion to batch'})).toBeInTheDocument()",
    "    expect(screen.getByRole('button', {name: 'More suggestion batching options'})).toBeInTheDocument()",
    '  })',
    '})',
  ],
  lineRange: generateSuggestedChangeLineRangeFromDiffThread(
    buildReviewThread({
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '1234567',
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
        startLine: 4,
        endLine: 4,
      }),
    }),
  )!,
  threadId: 'PRRT_1234567',
  originalLinesContent: 'first original line\nsecond original line\nthird original line',
}

describe('default state', () => {
  test('renders "Add suggestion to batch" and down-chevron Icon button', () => {
    render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={mockCommentingImplementation}
      />,
    )

    expect(screen.getByRole('button', {name: 'Add suggestion to batch'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'More suggestion batching options'})).toBeInTheDocument()
  })
})

describe('action menu', () => {
  test('has two selections and "Add suggestion to batch" is selected by default', async () => {
    const {user} = render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={mockCommentingImplementation}
      />,
    )

    const openActionMenuButton = screen.getByRole('button', {name: 'More suggestion batching options'})

    await user.click(openActionMenuButton)

    const actionMenu = screen.getByRole('menu')
    const addSuggestionToBatchMenuItem = within(actionMenu).getByRole('menuitemradio', {
      name: 'Add suggestion to batch',
    })
    const applySuggestionMenuItem = within(actionMenu).getByRole('menuitemradio', {name: 'Apply suggestion'})

    expect(addSuggestionToBatchMenuItem).toBeChecked()
    expect(applySuggestionMenuItem).not.toBeChecked()
    expect(within(actionMenu).getAllByRole('menuitemradio')).toHaveLength(2)
  })
})

describe('selecting a different application method', () => {
  test('updates text of first button in button group and closes action menu', async () => {
    const {user} = render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={mockCommentingImplementation}
      />,
    )

    const currentApplicationMethodButton = screen.getByRole('button', {name: 'Add suggestion to batch'})
    const openActionMenuButton = screen.getByRole('button', {name: 'More suggestion batching options'})

    await user.click(openActionMenuButton)

    const actionMenu = screen.getByRole('menu')
    const applySuggestionMenuItem = within(actionMenu).getByRole('menuitemradio', {name: 'Apply suggestion'})

    expect(actionMenu).toBeVisible()

    await user.click(applySuggestionMenuItem)

    expect(currentApplicationMethodButton).toHaveTextContent('Apply suggestion')
    expect(actionMenu).not.toBeVisible()
  })
})

describe('"Pending in batch" label', () => {
  test('renders when suggested change is pending', async () => {
    const mockSuggestedChangesBatch: SuggestedChange[] = []
    const mockCommentingImplementationWithPendingSuggestedChanges = {
      ...mockCommentingImplementation,
      addSuggestedChangeToPendingBatch: (sg: SuggestedChange) => mockSuggestedChangesBatch.push(sg),
      pendingSuggestedChangesBatch: mockSuggestedChangesBatch,
    }

    const {rerender, user} = render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
      />,
    )

    const addSuggestionToBatchButton = screen.getByRole('button', {name: 'Add suggestion to batch'})
    expect(screen.queryByText('Pending in batch')).not.toBeInTheDocument()
    await user.click(addSuggestionToBatchButton)
    expectAnalyticsEvents({
      type: 'comments.add_suggested_change_to_batch',
      target: 'ADD_SUGGESTED_CHANGE_TO_BATCH_BUTTON',
    })
    // by rerendering explicitly, it saves us from needing to mock out the context provider that's in a separate package
    rerender(
      <CodeSuggestionActions
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
        suggestedChange={mockSuggestedChange}
      />,
    )
    expect(screen.getByText('Pending in batch')).toBeInTheDocument()
  })

  test('does not render when suggested change is not pending', () => {
    const mockCommentingImplementationWithPendingSuggestedChanges = {
      ...mockCommentingImplementation,
      pendingSuggestedChangesBatch: [
        {
          authorLogin: 'monalisa',
          commentId: 'C_11111',
          path: 'README.md',
          suggestion: ['# description'],
          lineRange: generateSuggestedChangeLineRangeFromDiffThread(
            buildReviewThread({
              subject: buildPullRequestDiffThread({
                abbreviatedOid: '1234567',
                startDiffSide: 'RIGHT',
                endDiffSide: 'RIGHT',
                startLine: 4,
                endLine: 4,
              }),
            }),
          )!,
          threadId: 'PRRT_1234567',
          originalLinesContent: 'first original line',
        },
      ],
    }
    render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
      />,
    )
    expect(screen.queryByText('Pending in batch')).not.toBeInTheDocument()
  })
})

describe('when there are pending batched changes and the suggested change is not in batch', () => {
  test('does not render action menu', () => {
    const commentingImplementation = {
      ...mockCommentingImplementation,
      pendingSuggestedChangesBatch: [
        {
          authorLogin: 'monalisa',
          commentId: 'C_11111',
          path: 'README.md',
          suggestion: ['# description'],
          lineRange: generateSuggestedChangeLineRangeFromDiffThread(
            buildReviewThread({
              subject: buildPullRequestDiffThread({
                abbreviatedOid: '1234567',
                startDiffSide: 'RIGHT',
                endDiffSide: 'RIGHT',
                startLine: 4,
                endLine: 4,
              }),
            }),
          )!,
          threadId: 'PRRT_1234567',
          originalLinesContent: 'first original line',
        },
      ],
    }
    render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={commentingImplementation}
      />,
    )
    expect(screen.queryByRole('button', {name: 'More suggestion batching options'})).not.toBeInTheDocument()
  })

  test('does not render "Apply suggestion" button', () => {
    const commentingImplementation = {
      ...mockCommentingImplementation,
      pendingSuggestedChangesBatch: [
        {
          authorLogin: 'monalisa',
          commentId: 'C_11111',
          path: 'README.md',
          suggestion: ['# description'],
          lineRange: generateSuggestedChangeLineRangeFromDiffThread(
            buildReviewThread({
              subject: buildPullRequestDiffThread({
                abbreviatedOid: '1234567',
                startDiffSide: 'RIGHT',
                endDiffSide: 'RIGHT',
                startLine: 4,
                endLine: 4,
              }),
            }),
          )!,
          threadId: 'PRRT_1234567',
          originalLinesContent: 'first original line',
        },
      ],
    }
    render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={commentingImplementation}
      />,
    )
    expect(screen.queryByRole('button', {name: 'Apply suggestion'})).not.toBeInTheDocument()
  })

  test('renders "Add suggestion to batch" button', async () => {
    const commentingImplementation = {
      ...mockCommentingImplementation,
      pendingSuggestedChangesBatch: [
        {
          authorLogin: 'monalisa',
          commentId: 'C_11112',
          path: 'README.md',
          suggestion: ['# description'],
          lineRange: generateSuggestedChangeLineRangeFromDiffThread(
            buildReviewThread({
              subject: buildPullRequestDiffThread({
                abbreviatedOid: '1234567',
                startDiffSide: 'RIGHT',
                endDiffSide: 'RIGHT',
                startLine: 5,
                endLine: 5,
              }),
            }),
          )!,
          threadId: 'PRRT_12345678',
          originalLinesContent: 'first original line',
        },
      ],
    }
    const {user} = render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={commentingImplementation}
      />,
    )
    expect(screen.queryByRole('button', {name: 'Apply suggestion'})).not.toBeInTheDocument()

    const addSuggestionToBatch = screen.getByText('Add suggestion to batch')
    expect(addSuggestionToBatch).toBeInTheDocument()

    await user.click(addSuggestionToBatch)
    expectAnalyticsEvents({
      type: 'comments.add_suggested_change_to_batch',
      target: 'ADD_SUGGESTED_CHANGE_TO_BATCH_BUTTON',
    })
  })
})

describe('when the suggested change cannot be applied', () => {
  test('renders the pending state if the suggested change is pending and therefore unable to be applied', () => {
    const mockSuggestedChangesBatch: SuggestedChange[] = [mockSuggestedChange]
    const mockCommentingImplementationWithPendingSuggestedChanges = {
      ...mockCommentingImplementation,
      addSuggestedChangeToPendingBatch: (sg: SuggestedChange) => mockSuggestedChangesBatch.push(sg),
      pendingSuggestedChangesBatch: mockSuggestedChangesBatch,
    }

    render(
      <CodeSuggestionActions
        suggestedChange={mockSuggestedChange}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
      />,
    )

    expect(screen.getByText('Pending in batch')).toBeInTheDocument()
  })

  test('renders the validation error message if the suggested change is not pending and unable to be applied', () => {
    const mockSuggestedChangesBatch: SuggestedChange[] = [mockSuggestedChange]
    const mockCommentingImplementationWithPendingSuggestedChanges = {
      ...mockCommentingImplementation,
      addSuggestedChangeToPendingBatch: (sg: SuggestedChange) => mockSuggestedChangesBatch.push(sg),
      pendingSuggestedChangesBatch: mockSuggestedChangesBatch,
    }
    const suggestedChangeNotInBatch = {...mockSuggestedChange, suggestion: ['new suggestion']}

    render(
      <CodeSuggestionActions
        suggestedChange={suggestedChangeNotInBatch}
        commentingImplementation={mockCommentingImplementationWithPendingSuggestedChanges}
      />,
    )

    expect(screen.queryByText('Pending in batch')).toBeNull()
    expect(screen.queryByText('Add suggestion to batch')).toBeNull()
    expect(screen.getByText('Unable to commit due to other pending changes affecting this line.')).toBeInTheDocument()
  })
})

test('applies single change', async () => {
  const mockSubmitSuggestedChange = jest.fn()
  const commentingImplementation: CommentingImplementation = {
    ...mockCommentingImplementation,
    submitSuggestedChanges: mockSubmitSuggestedChange,
  }

  const {user} = render(
    <CodeSuggestionActions suggestedChange={mockSuggestedChange} commentingImplementation={commentingImplementation} />,
  )
  const moreOptionsButton = await screen.findByLabelText('More suggestion batching options')
  expect(moreOptionsButton).toBeInTheDocument()
  await user.click(moreOptionsButton)

  // select the option then click the button
  await user.click(await screen.findByText('Apply suggestion'))
  await user.click(await screen.findByText('Apply suggestion'))

  await user.click(await screen.findByText('Commit changes'))

  expect(mockSubmitSuggestedChange).toHaveBeenCalledTimes(1)

  // get the suggested change arg off the first call
  const submittedSuggestedChangeList = mockSubmitSuggestedChange.mock.calls[0][0]['suggestedChanges']
  expect(submittedSuggestedChangeList).toEqual([mockSuggestedChange])
})

test('applies multiple changes', async () => {
  const mockSubmitSuggestedChange = jest.fn()
  const commentingImplementation: CommentingImplementation = {
    ...mockCommentingImplementation,
    pendingSuggestedChangesBatch: [mockSuggestedChange, mockSuggestedChange],
    submitSuggestedChanges: mockSubmitSuggestedChange,
  }

  const {user} = render(
    <CodeSuggestionActions suggestedChange={mockSuggestedChange} commentingImplementation={commentingImplementation} />,
  )

  await user.click(await screen.findByText('Apply suggestions'))
  await user.click(await screen.findByText('Commit changes'))

  expect(mockSubmitSuggestedChange).toHaveBeenCalledTimes(1)

  // get the suggested change arg off the first call
  const submittedSuggestedChangeList = mockSubmitSuggestedChange.mock.calls[0][0]['suggestedChanges']
  expect(submittedSuggestedChangeList).toEqual([mockSuggestedChange, mockSuggestedChange])
})

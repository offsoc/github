import type {SuggestedChange} from '@github-ui/conversations'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {createMockEnvironment} from 'relay-test-utils'

import {PendingSuggestedChangesBatch} from '../../../contexts/PendingSuggestedChangesBatchContext'
import {PullRequestContextProvider} from '../../../contexts/PullRequestContext'
import PullRequestsAppWrapper from '../../../test-utils/PullRequestsAppWrapper'
import {ApplySuggestionsButton} from '../ApplySuggestionsButton'

function TestComponent({pendingSuggestedChangesBatch}: {pendingSuggestedChangesBatch: SuggestedChange[]}) {
  return (
    <PullRequestsAppWrapper environment={createMockEnvironment()} pullRequestId="mock">
      <PullRequestContextProvider
        headRefOid="mock"
        isInMergeQueue={false}
        pullRequestId="mock"
        repositoryId="mock"
        state="OPEN"
      >
        <PendingSuggestedChangesBatch.Provider
          value={{
            addSuggestedChangeToBatch: noop,
            clearSuggestedChangesBatch: noop,
            pendingSuggestedChangesBatch,
            removeSuggestedChangeFromBatch: noop,
          }}
        >
          <ApplySuggestionsButton />
        </PendingSuggestedChangesBatch.Provider>
      </PullRequestContextProvider>
    </PullRequestsAppWrapper>
  )
}

test('button does not render when there are no suggestions in the batch', () => {
  render(<TestComponent pendingSuggestedChangesBatch={[]} />)

  expect(screen.queryByText('Apply suggestion')).not.toBeInTheDocument()
})

test('renders button with count for single suggestion', () => {
  render(
    <TestComponent
      pendingSuggestedChangesBatch={[
        {
          authorLogin: 'monalisa',
          commentId: 'mock',
          path: 'path/to/file.rb',
          suggestion: ['suggestion'],
          threadId: 'thread1',
          lineRange: {startLineNumber: 1, endLineNumber: 1, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
        },
      ]}
    />,
  )

  expect(screen.getByText('Apply suggestion')).toBeInTheDocument()
  expect(screen.getByText('1')).toBeInTheDocument()
})

test('renders button with count for multiple suggestions', () => {
  render(
    <TestComponent
      pendingSuggestedChangesBatch={[
        {
          authorLogin: 'mona',
          commentId: 'mock',
          path: 'path/to/file.rb',
          suggestion: ['suggestion'],
          threadId: 'thread1',
          lineRange: {startLineNumber: 1, endLineNumber: 1, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
        },
        {
          authorLogin: 'lisa',
          commentId: 'mock',
          path: 'path/to/file.rb',
          suggestion: ['suggestion'],
          threadId: 'thread2',
          lineRange: {startLineNumber: 2, endLineNumber: 2, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
        },
      ]}
    />,
  )

  expect(screen.getByText('Apply suggestions')).toBeInTheDocument()
  expect(screen.getByText('2')).toBeInTheDocument()
})

describe('apply suggestions dialog', () => {
  test('shows dialog on click', async () => {
    const {user} = render(
      <TestComponent
        pendingSuggestedChangesBatch={[
          {
            authorLogin: 'mona',
            commentId: 'mock',
            path: 'path/to/file.rb',
            suggestion: ['suggestion'],
            threadId: 'thread1',
            lineRange: {startLineNumber: 1, endLineNumber: 1, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
          },
          {
            authorLogin: 'lisa',
            commentId: 'mock',
            path: 'path/to/file.rb',
            suggestion: ['suggestion'],
            threadId: 'thread2',
            lineRange: {startLineNumber: 2, endLineNumber: 2, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
          },
        ]}
      />,
    )

    await user.click(screen.getByText('Apply suggestions'))
    expect(screen.getByText('Commit message')).toBeInTheDocument()
    expect(screen.getByText('Extended description (optional)')).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Commit changes'})).toBeInTheDocument()
    expect(screen.getByDisplayValue('Apply suggestions from code review')).toBeInTheDocument()
  })

  test('returns focus to button on close', async () => {
    const {user} = render(
      <TestComponent
        pendingSuggestedChangesBatch={[
          {
            authorLogin: 'mona',
            commentId: 'mock',
            path: 'path/to/file.rb',
            suggestion: ['suggestion'],
            threadId: 'thread1',
            lineRange: {startLineNumber: 1, endLineNumber: 1, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
          },
          {
            authorLogin: 'lisa',
            commentId: 'mock',
            path: 'path/to/file.rb',
            suggestion: ['suggestion'],
            threadId: 'thread2',
            lineRange: {startLineNumber: 2, endLineNumber: 2, startOrientation: 'RIGHT', endOrientation: 'RIGHT'},
          },
        ]}
      />,
    )

    await user.click(screen.getByText('Apply suggestions'))
    expect(screen.getByText('Commit message')).toBeInTheDocument()

    await user.click(screen.getByRole('button', {name: 'Cancel'}))
    expect(screen.getByRole('button', {name: 'Apply suggestions (2)'})).toHaveFocus()
  })
})

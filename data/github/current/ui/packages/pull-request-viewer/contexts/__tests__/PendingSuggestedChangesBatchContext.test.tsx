import type {SuggestedChange} from '@github-ui/conversations'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {
  buildStorageKey,
  PendingSuggestedChangesBatchContextProvider,
  usePendingSuggestedChangesBatchContext,
} from '../PendingSuggestedChangesBatchContext'

function renderWithProvider(
  children: JSX.Element,
  providerProps: {headRefOid: string; owner: string; number: number; repo: string},
) {
  return render(
    <PendingSuggestedChangesBatchContextProvider {...providerProps}>
      {children}
    </PendingSuggestedChangesBatchContextProvider>,
  )
}

afterEach(() => {
  window.localStorage.clear()
})

test('suggested changes batch is read from local storage', () => {
  // set local state value for pendingSuggestedChangesBatch
  const storageKey = buildStorageKey('mock', 'mock', '1', 'mock')
  const suggestedChangesBatch: SuggestedChange[] = [
    {
      authorLogin: 'monalisa',
      commentId: 'commentId1',
      path: 'path/to/file.rb',
      suggestion: ['suggestion'],
      threadId: 'threadId1',
      lineRange: {
        endLineNumber: 1,
        endOrientation: 'RIGHT',
        startLineNumber: 1,
        startOrientation: 'RIGHT',
      },
    },
    {
      authorLogin: 'monalisa',
      commentId: 'commentId2',
      path: 'path/to/file.rb',
      suggestion: ['suggestion'],
      threadId: 'threadId2',
      lineRange: {
        endLineNumber: 1,
        endOrientation: 'RIGHT',
        startLineNumber: 1,
        startOrientation: 'RIGHT',
      },
    },
  ]
  window.localStorage.setItem(storageKey, JSON.stringify(suggestedChangesBatch))

  const Consumer = () => {
    const {pendingSuggestedChangesBatch} = usePendingSuggestedChangesBatchContext()
    return (
      <div>
        <span>{pendingSuggestedChangesBatch.length}</span>
        <span>{pendingSuggestedChangesBatch[0]?.commentId}</span>
        <span>{pendingSuggestedChangesBatch[0]?.path}</span>
      </div>
    )
  }

  renderWithProvider(<Consumer />, {headRefOid: 'mock', number: 1, owner: 'mock', repo: 'mock'})

  expect(screen.getByText('2')).toBeInTheDocument()
  expect(screen.getByText('commentId1')).toBeInTheDocument()
  expect(screen.getByText('path/to/file.rb')).toBeInTheDocument()
})

test('suggested changes batch in local storage is invalidated if head ref changes', () => {
  // set local state value for pendingSuggestedChangesBatch
  const storageKey = buildStorageKey('mock', 'mock', '1', 'headRefOid1')
  window.localStorage.setItem(
    storageKey,
    JSON.stringify([
      {
        commentId: 'commentId1',
        path: 'path/to/file.rb',
        suggestion: ['suggestion'],
        threadId: 'threadId1',
        lineRange: {
          endLineNumber: 1,
          endOrientation: 'RIGHT',
          startLineNumber: 1,
          startOrientation: 'RIGHT',
        },
      },
      {
        commentId: 'commentId2',
        path: 'path/to/file.rb',
        suggestion: ['suggestion'],
        threadId: 'threadId2',
        lineRange: {
          endLineNumber: 1,
          endOrientation: 'RIGHT',
          startLineNumber: 1,
          startOrientation: 'RIGHT',
        },
      },
    ]),
  )

  const Consumer = () => {
    const {pendingSuggestedChangesBatch} = usePendingSuggestedChangesBatchContext()
    return (
      <div>
        <span>{pendingSuggestedChangesBatch.length}</span>
        <span>{pendingSuggestedChangesBatch[0]?.commentId}</span>
        <span>{pendingSuggestedChangesBatch[0]?.path}</span>
      </div>
    )
  }

  renderWithProvider(<Consumer />, {headRefOid: 'headRefOid2', number: 1, owner: 'mock', repo: 'mock'})

  expect(screen.queryByText('2')).not.toBeInTheDocument()
  expect(screen.queryByText('commentId1')).not.toBeInTheDocument()
  expect(screen.queryByText('path/to/file.rb')).not.toBeInTheDocument()
})

test('malformed suggested changes in local storage are ignored', () => {
  // set local state value for pendingSuggestedChangesBatch
  const storageKey = buildStorageKey('mock', 'mock', '1', 'mock')
  const suggestedChange: SuggestedChange = {
    authorLogin: 'monalisa',
    commentId: 'commentId1',
    path: 'path/to/file.rb',
    suggestion: ['suggestion'],
    threadId: 'threadId1',
    lineRange: {
      endLineNumber: 1,
      endOrientation: 'RIGHT',
      startLineNumber: 1,
      startOrientation: 'RIGHT',
    },
  }

  window.localStorage.setItem(storageKey, JSON.stringify([suggestedChange, 'malformed data']))

  const Consumer = () => {
    const {pendingSuggestedChangesBatch} = usePendingSuggestedChangesBatchContext()
    return (
      <div>
        <span>{pendingSuggestedChangesBatch.length}</span>
        <span>{pendingSuggestedChangesBatch[0]?.commentId}</span>
        <span>{pendingSuggestedChangesBatch[0]?.path}</span>
      </div>
    )
  }

  renderWithProvider(<Consumer />, {headRefOid: 'mock', number: 1, owner: 'mock', repo: 'mock'})

  expect(screen.getByText('1')).toBeInTheDocument()
  expect(screen.getByText('commentId1')).toBeInTheDocument()
  expect(screen.getByText('path/to/file.rb')).toBeInTheDocument()
})

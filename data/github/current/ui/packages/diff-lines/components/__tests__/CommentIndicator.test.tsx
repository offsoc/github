import {render, screen} from '@testing-library/react'

import CommentIndicator from '../CommentIndicator'
import {buildComment, buildDiffLine, buildThread, mockMarkerNavigationImplementation} from '../../test-utils/query-data'
import type {ClientDiffLine} from '../../types'
import {noop} from '@github-ui/noop'
import type {DiffAnchor} from '@github-ui/diffs/types'
import {DiffLineContextProvider} from '../../contexts/DiffLineContext'
import {DiffContextProvider} from '../../contexts/DiffContext'
import {mockCommentingImplementation} from '@github-ui/conversations/test-utils'

const comment1 = buildComment({
  author: {login: 'author1', avatarUrl: 'http://example.com/author1.png', url: '/monalisa'},
})
const comment2 = buildComment({
  author: {login: 'author1', avatarUrl: 'http://example.com/author1.png', url: '/monalisa'},
})
const comment3 = buildComment({
  author: {login: 'author2', avatarUrl: 'http://example.com/author1.png', url: '/monalisa'},
})
const comment4 = buildComment({
  author: {login: 'author3', avatarUrl: 'http://example.com/author1.png', url: '/monalisa'},
})
const comment5 = buildComment({
  author: {login: 'author4', avatarUrl: 'http://example.com/author1.png', url: '/monalisa'},
})
const comment6 = buildComment({
  author: {login: 'author5', avatarUrl: 'http://example.com/author1.png', url: '/monalisa'},
})

function TestComponent({line}: {line: ClientDiffLine}) {
  const diffLineContextData = {
    fileLineCount: 20,
    diffEntryId: 'stub',
    diffLine: line,
    isSplit: false,
    fileAnchor: 'diff-mockfile' as DiffAnchor,
    rowId: 'mockRowId',
    filePath: 'mockfile',
  }
  return (
    <DiffContextProvider
      addInjectedContextLines={noop}
      commentBatchPending={false}
      commentingEnabled={true}
      commentingImplementation={mockCommentingImplementation}
      repositoryId="test-id"
      subjectId="subjectId"
      subject={{}}
      markerNavigationImplementation={mockMarkerNavigationImplementation}
      viewerData={{
        avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        diffViewPreference: 'split',
        isSiteAdmin: false,
        login: 'mona',
        tabSizePreference: 1,
        viewerCanComment: true,
        viewerCanApplySuggestion: true,
      }}
    >
      <DiffLineContextProvider {...diffLineContextData}>
        <CommentIndicator />
      </DiffLineContextProvider>
    </DiffContextProvider>
  )
}

describe('CommentIndicator', () => {
  test('when the line has no threads, it renders nothing', () => {
    const line = buildDiffLine({threads: []})
    const {container} = render(<TestComponent line={line} />)

    expect(container.innerHTML).toBe('')
  })

  test('when the line has one thread with more than 3 comment authors, it renders at most 3 unique avatars', () => {
    const thread = buildThread({comments: [comment1, comment2, comment3, comment4]})
    const line = buildDiffLine({threads: [thread], totalCommentsCount: 5})
    render(<TestComponent line={line} />)

    expect(screen.getByAltText('author1')).toBeInTheDocument()
    expect(screen.getByAltText('author2')).toBeInTheDocument()
    expect(screen.getByAltText('author3')).toBeInTheDocument()
    expect(screen.queryByAltText('author4')).not.toBeInTheDocument()
    expect(screen.queryByAltText('author5')).not.toBeInTheDocument()
  })

  test('when the line has several threads, it renders at most 3 avatars', () => {
    const thread1 = buildThread({comments: [comment1, comment2]})
    const thread2 = buildThread({comments: [comment3, comment4, comment5, comment6]})
    const line = buildDiffLine({
      threads: [thread1, thread2],
      totalCommentsCount: 6,
    })
    render(<TestComponent line={line} />)

    expect(screen.getByAltText('author1')).toBeInTheDocument()
    expect(screen.getByAltText('author2')).toBeInTheDocument()
    expect(screen.getByAltText('author3')).toBeInTheDocument()
    expect(screen.queryByAltText('author4')).not.toBeInTheDocument()
    expect(screen.queryByAltText('author5')).not.toBeInTheDocument()
  })

  test('it renders the comment count', () => {
    const thread = buildThread({comments: [comment1, comment2]})
    const line = buildDiffLine({
      threads: [thread],
      totalCommentsCount: 9,
    })

    render(<TestComponent line={line} />)

    expect(screen.getByText('9')).toBeInTheDocument()
  })

  test('when the comment count is > 9, it renders 9+', () => {
    const thread = buildThread({
      comments: [comment1, comment2],
    })
    const line = buildDiffLine({
      threads: [thread],
      totalCommentsCount: 51,
    })
    render(<TestComponent line={line} />)

    expect(screen.getByText('9+')).toBeInTheDocument()
  })
})

import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {renderHook, screen} from '@testing-library/react'
import {useRef} from 'react'

import {
  buildAnnotation,
  buildComment,
  buildCommentAuthor,
  buildReviewThread,
  threadSummary,
} from '../../test-utils/query-data'
import {DiffAnnotationLevels} from '../../types'
import {MarkersListActionMenu} from '../MarkersListActionMenu'

describe('MarkerListActionMenu', () => {
  test('renders threads', () => {
    const comment = buildComment({author: buildCommentAuthor({login: 'monalisa2'})})
    const thread = buildReviewThread({comments: [comment]})
    const threadSummaries = threadSummary([thread])
    const {result} = renderHook(() => {
      return useRef(null)
    })

    render(
      <MarkersListActionMenu
        anchorRef={result.current}
        annotations={[]}
        handleOpenChange={noop}
        threads={threadSummaries}
        onShowAnnotation={noop}
        onShowCommentThread={noop}
      />,
    )

    expect(screen.getByText('Thread by monalisa2')).toBeInTheDocument()
    expect(screen.getByText('1 comment')).toBeInTheDocument()
  })

  test('renders annotations', () => {
    const annotation = buildAnnotation({
      annotationLevel: DiffAnnotationLevels.Notice,
      title: 'the title of my annotation',
      checkRun: {name: 'eslint', detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1'},
      checkSuite: {name: 'github-lint'},
    })
    const {result} = renderHook(() => {
      return useRef(null)
    })

    render(
      <MarkersListActionMenu
        anchorRef={result.current}
        annotations={[annotation]}
        handleOpenChange={noop}
        threads={[]}
        onShowAnnotation={noop}
        onShowCommentThread={noop}
      />,
    )

    expect(screen.getByText('github-lint /')).toBeInTheDocument()
    expect(screen.getByText('eslint')).toBeInTheDocument()
    expect(screen.getByText('the title of my annotation')).toBeInTheDocument()
  })
})

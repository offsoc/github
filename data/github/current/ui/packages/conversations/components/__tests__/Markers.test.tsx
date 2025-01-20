import {AnalyticsProvider} from '@github-ui/analytics-provider'
import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {Button} from '@primer/react'
import {screen} from '@testing-library/react'
import {useRef, useState} from 'react'

import {
  buildAnnotation,
  buildComment,
  buildCommentAuthor,
  buildPullRequestDiffThread,
  buildReviewThread,
  mockCommentingImplementation,
  mockMarkerNavigationImplementation,
  mockViewerData,
  threadSummary,
} from '../../test-utils/query-data'
import type {
  CommentingImplementation,
  DiffAnnotation,
  MarkerNavigationImplementation,
  Thread,
  ThreadSummary,
} from '../../types'
import {Markers} from '../Markers'

jest.setTimeout(4_500)

const suggestedChangeBody = '```suggestion\nsuggested change for this lineasdfasefasef\n```'

const suggestedChangeHtml = `
  <div class="my-2 border rounded-2 js-suggested-changes-blob diff-view js-check-bidi" id="">
    <div class="f6 p-2 lh-condensed border-bottom d-flex">
      <div class="flex-auto flex-items-center color-fg-muted">
        Suggested change
      </div>
    </div>
    <div itemprop="text" class="blob-wrapper data file" style="margin: 0; border: none; overflow-y: visible; overflow-x: auto;">
      <table class="d-table tab-size mb-0 width-full" data-paste-markdown-skip="">
        <tbody>
          <tr class="border-0">
            <td class="blob-num blob-num-deletion text-right border-0 px-2 py-1 lh-default" data-line-number="1"></td>
            <td class="border-0 px-2 py-1 blob-code-inner blob-code-deletion js-blob-code-deletion blob-code-marker-deletion">
              suggested change for this <span class="x x-first x-last">line</span>
            </td>
          </tr>
          <tr class="border-0">
            <td class="blob-num blob-num-addition text-right border-0 px-2 py-1 lh-default" data-line-number="1"></td>
            <td class="border-0 px-2 py-1 blob-code-inner blob-code-addition js-blob-code-addition blob-code-marker-addition">
              suggested change for this <span class="x x-first x-last">lineasdfasefasef</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="js-apply-changes"></div>
  </div>
`

// Mock child components that fetch data on render, since we're not testing that functionality here
jest.mock('@github-ui/markdown-edit-history-viewer/MarkdownEditHistoryViewer', () => ({
  MarkdownEditHistoryViewer: () => null,
}))

jest.mock('@github-ui/reaction-viewer/ReactionViewer', () => ({
  ReactionViewer: () => null,
}))

interface TestComponentProps {
  annotations?: DiffAnnotation[]
  commentingImplementation?: CommentingImplementation
  isMarkerListOpen?: boolean
  markerNavigationImplementation?: MarkerNavigationImplementation
  filePath?: string
  thread?: Thread
  threads?: ThreadSummary[]
  skipSuggestedChangesConfig?: boolean
}

function TestComponent({
  annotations,
  isMarkerListOpen = false,
  thread,
  threads = [],
  commentingImplementation,
  markerNavigationImplementation,
  filePath = 'README.md',
  skipSuggestedChangesConfig = false,
}: TestComponentProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(thread?.id)
  const onClose = () => setSelectedThreadId(undefined)
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <AnalyticsProvider appName="test-app" category="test-category" metadata={{}}>
      <Button ref={ref}>Anchor</Button>
      <Markers
        annotations={annotations ?? []}
        batchingEnabled={false}
        batchPending={false}
        commentingImplementation={commentingImplementation ?? mockCommentingImplementation}
        conversationAnchorRef={ref}
        conversationListAnchorRef={ref}
        conversationListThreads={threads}
        fileAnchor={filePath}
        filePath={filePath}
        isMarkerListOpen={isMarkerListOpen}
        repositoryId="repository-test-id"
        returnFocusRef={ref}
        selectedThreadId={selectedThreadId}
        subjectId="pullRequest-test-id"
        subject={{isInMergeQueue: false, state: 'OPEN'}}
        suggestedChangesConfig={
          skipSuggestedChangesConfig
            ? undefined
            : {
                selectedDiffRowRange: undefined,
                shouldStartNewConversationWithSuggestedChange: false,
                configureSuggestedChangesFromLineRange: () => {
                  return {
                    showSuggestChangesButton: true,
                    sourceContentFromDiffLines: 'something',
                    onInsertSuggestedChange: noop,
                    shouldInsertSuggestedChange: false,
                    isValidSuggestionRange: true,
                  }
                },
              }
        }
        markerNavigationImplementation={markerNavigationImplementation ?? mockMarkerNavigationImplementation}
        viewerData={mockViewerData}
        onAnnotationSelected={noop}
        onThreadSelected={noop}
        onCloseConversationList={noop}
        onCloseConversationDialog={onClose}
      />
    </AnalyticsProvider>
  )
}

test('renders the list dialog when there are annotations and threads', async () => {
  const annotation = buildAnnotation({
    checkRun: {
      name: 'lint-all-the-things',
      detailsUrl: 'http://github.localhost/monalisa/smile/actions/runs/1/job/1',
    },
    checkSuite: {
      name: 'github-lint',
    },
  })
  const reviewThread = buildReviewThread({
    comments: [
      buildComment({
        body: 'test comment',
        bodyHTML: 'test comment',
        reference: {
          number: 1,
          author: buildCommentAuthor({login: 'commenter'}),
        },
      }),
    ],
  })
  const threadSummaries = threadSummary([reviewThread])
  const commentingImplementation = {...mockCommentingImplementation}
  render(
    <TestComponent
      annotations={[annotation]}
      commentingImplementation={commentingImplementation}
      isMarkerListOpen={true}
      threads={threadSummaries}
    />,
  )

  expect(await screen.findByText('github-lint /')).toBeInTheDocument()
  expect(await screen.findByText('lint-all-the-things')).toBeInTheDocument()
  expect(await screen.findByText('annotation-title')).toBeInTheDocument()
  expect(await screen.findByText('Thread by monalisa')).toBeInTheDocument()
})

test('renders the thread dialog', async () => {
  const reviewThread = buildReviewThread({
    comments: [
      buildComment({
        body: 'test comment',
        bodyHTML: 'test comment',
        reference: {
          number: 1,
          author: buildCommentAuthor({login: 'commenter'}),
        },
      }),
    ],
  })
  const fetchThreadMock = () => Promise.resolve(reviewThread)
  const commentingImplementation = {...mockCommentingImplementation, fetchThread: fetchThreadMock}
  render(<TestComponent commentingImplementation={commentingImplementation} thread={reviewThread} />)

  expect(await screen.findByText('test comment')).toBeInTheDocument()
})

describe('review thread dialog with suggested change comment', () => {
  test('renders suggested changed comment', async () => {
    const reviewThread = buildReviewThread({
      subjectType: 'LINE',
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '1234567',
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
        startLine: 4,
        endLine: 4,
      }),
      comments: [
        buildComment({
          body: suggestedChangeBody,
          bodyHTML: suggestedChangeHtml,
          reference: {
            number: 1,
            author: buildCommentAuthor({login: 'commenter'}),
          },
        }),
      ],
      isResolved: false,
    })
    const fetchThreadMock = () => Promise.resolve(reviewThread)
    const commentingImplementation = {...mockCommentingImplementation, fetchThread: fetchThreadMock}
    render(<TestComponent commentingImplementation={commentingImplementation} thread={reviewThread} />)

    expect(await screen.findByText('Suggested change')).toBeInTheDocument()
    expect(await screen.findByText('Add suggestion to batch')).toBeInTheDocument()
  })

  test('opens commit suggested change dialog and is interactable', async () => {
    const reviewThread = buildReviewThread({
      subjectType: 'LINE',
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '1234567',
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
        startLine: 4,
        endLine: 4,
      }),
      comments: [
        buildComment({
          body: suggestedChangeBody,
          bodyHTML: suggestedChangeHtml,
          reference: {
            number: 1,
            author: buildCommentAuthor({login: 'commenter'}),
          },
        }),
      ],
      isResolved: false,
    })
    const fetchThreadMock = () => Promise.resolve(reviewThread)
    const commentingImplementation = {...mockCommentingImplementation, fetchThread: fetchThreadMock}
    const {user} = render(<TestComponent commentingImplementation={commentingImplementation} thread={reviewThread} />)

    expect(await screen.findByText('Suggested change')).toBeInTheDocument()
    const moreOptionsButton = await screen.findByLabelText('More suggestion batching options')
    expect(moreOptionsButton).toBeInTheDocument()
    await user.click(moreOptionsButton)

    // select the option then click the button
    await user.click(await screen.findByText('Apply suggestion'))
    await user.click(await screen.findByText('Apply suggestion'))

    expect(await screen.findByRole('heading', {name: 'Apply suggestion'})).toBeInTheDocument()

    // click something in the dialog and check that it's still open
    await user.click(await screen.findByText('Commit message'))
    expect(await screen.findByRole('heading', {name: 'Apply suggestion'})).toBeInTheDocument()

    // close the dialog and thread overlay
    await user.click(await screen.findByLabelText('Close'))
    expect(screen.queryByRole('heading', {name: 'Apply suggestion'})).not.toBeInTheDocument()
    await user.click(await screen.findByLabelText('Close thread'))
    expect(screen.queryByText('Suggested change')).not.toBeInTheDocument()
  })

  test('returns focus to correct button', async () => {
    const reviewThread = buildReviewThread({
      subjectType: 'LINE',
      subject: buildPullRequestDiffThread({
        abbreviatedOid: '1234567',
        startDiffSide: 'RIGHT',
        endDiffSide: 'RIGHT',
        startLine: 4,
        endLine: 4,
      }),
      comments: [
        buildComment({
          body: suggestedChangeBody,
          bodyHTML: suggestedChangeHtml,
          reference: {
            number: 1,
            author: buildCommentAuthor({login: 'commenter'}),
          },
        }),
      ],
      isResolved: false,
    })
    const fetchThreadMock = () => Promise.resolve(reviewThread)
    const commentingImplementation = {...mockCommentingImplementation, fetchThread: fetchThreadMock}
    const {user} = render(<TestComponent commentingImplementation={commentingImplementation} thread={reviewThread} />)

    expect(await screen.findByText('Suggested change')).toBeInTheDocument()
    const moreOptionsButton = await screen.findByLabelText('More suggestion batching options')
    expect(moreOptionsButton).toBeInTheDocument()
    await user.click(moreOptionsButton)

    // select the option then click the button
    await user.click(await screen.findByText('Apply suggestion'))
    await user.click(await screen.findByText('Apply suggestion'))

    expect(await screen.findByRole('heading', {name: 'Apply suggestion'})).toBeInTheDocument()

    // close the dialog overlay
    await user.click(await screen.findByLabelText('Close'))
    expect(screen.queryByRole('heading', {name: 'Apply suggestion'})).not.toBeInTheDocument()

    expect(screen.getByRole('button', {name: 'Apply suggestion'})).toHaveFocus()
  })
})

describe('Renders fine without suggested changes config', () => {
  test('it renders', async () => {
    const reviewThread = buildReviewThread({
      comments: [
        buildComment({
          body: 'test comment',
          bodyHTML: 'test comment',
        }),
      ],
    })
    const fetchThreadMock = () => Promise.resolve(reviewThread)
    const commentingImplementation = {...mockCommentingImplementation, fetchThread: fetchThreadMock}
    render(
      <TestComponent
        commentingImplementation={commentingImplementation}
        thread={reviewThread}
        skipSuggestedChangesConfig={true}
      />,
    )

    expect(await screen.findByText('test comment')).toBeInTheDocument()
  })
})

import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {ComponentWithPreloadedQueryRef} from '@github-ui/relay-test-utils/RelayComponents'
import {fireEvent, screen, within, act} from '@testing-library/react'
import {Suspense} from 'react'
import {type PreloadedQuery, RelayEnvironmentProvider} from 'react-relay'
import type {OperationDescriptor} from 'relay-runtime'
import type {createMockEnvironment, MockEnvironment} from 'relay-test-utils'

import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import {VALUES} from '../../constants/values'
import {IssueViewerContextProvider} from '../../contexts/IssueViewerContext'
import {
  makeTimeline,
  makeBackTimeline,
  makeTimelinePinnedEvent,
  makeTimelineComment,
  toEdges,
} from '../../test-utils/payloads/Timeline'

import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {generateMockPayloadWithDefaults} from '../../test-utils/DefaultWrappers'
import {IssueTimelineGraphqlQuery, IssueTimelineTest} from './IssueTimelineTestShared'
import type {IssueTimelineTestSharedQuery} from './__generated__/IssueTimelineTestSharedQuery.graphql'

jest.setTimeout(10000)

const owner = 'owner'
const repo = 'repo'
const number = 10
const defaultNumberOfCommentsToLoad = 150
const defaultNumberOfSSRComments = 15

const urlParams = {
  owner,
  repo,
  number,
}

type TestHighlightComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  highlightedEventText: string
}

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  const navigateFn = jest.fn()
  return {
    ...originalModule,
    useNavigate: () => navigateFn,
    _routerNavigateFn: navigateFn,
    useParams: () => urlParams,
  }
})

type AddMostRecentResolverProps = {
  environment: MockEnvironment
  totalComments: number
  hasNextPage?: boolean
  startIndex?: number
  direction?: 'front' | 'back'
  numComments?: number
}

const ADD_MOST_RECENT_RESOLVER_DEFAULT_ARGS = {
  hasNextPage: false,
  startIndex: 0,
  direction: 'front',
  numComments: defaultNumberOfSSRComments,
}

async function addMostRecentResolver(props: AddMostRecentResolverProps) {
  const {environment, totalComments, hasNextPage, startIndex, direction, numComments} = {
    ...ADD_MOST_RECENT_RESOLVER_DEFAULT_ARGS,
    ...props,
  }
  return environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
    const numNewComments = ((direction === 'front' ? numComments : operation.fragment.variables.last) as number) ?? 1

    const response = generateMockPayloadWithDefaults(operation, {
      Issue() {
        const timeline =
          direction === 'front'
            ? makeTimeline({numComments: numNewComments, hasNextPage, totalComments, startIndex})
            : makeBackTimeline({numComments: numNewComments, totalComments, startIndex})
        return {
          locked: false,
          author: {
            login: 'author',
            id: 'author-id-123',
          },
          ...timeline,
        }
      },
    })
    return response
  })
}

async function addResolversForHighlightedItem(
  environment: MockEnvironment,
  position: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any,
  totalComments: number,
  numCommentsBeforeHiglighted: number = VALUES.loadAroundHighlightedPageSize,
  numCommentsAfterHiglighted: number = VALUES.loadAroundHighlightedPageSize,
  issueId: string = 'mockIssueId1',
  endCursor: string = 'cursor',
) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return generateMockPayloadWithDefaults(operation, {
        Issue: () => ({
          id: issueId,
          author: {
            login: 'author',
            id: 'author-id-123',
          },
          timelineItems: {
            edges: toEdges([item]),
            pageInfo: {
              hasNextPage: true,
              endCursor,
            },
          },
          timelineCounts: {
            afterFocusCount: totalComments - position - 1,
            beforeFocusCount: position,
          },
        }),
      })
    })
  })

  if (numCommentsAfterHiglighted > 0) {
    await act(async () => {
      return environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
        const numComments = numCommentsAfterHiglighted
        const response = generateMockPayloadWithDefaults(operation, {
          Issue() {
            const timeline = makeBackTimeline({
              numComments,
              totalComments,
              startIndex: position + 1,
              startCursor: 'highlighted-event-cursor',
            })
            return {
              author: {
                login: 'author',
                id: 'author-id-123',
              },
              locked: false,
              ...timeline,
            }
          },
        })
        return response
      })
    })
  }

  if (numCommentsBeforeHiglighted > 0) {
    await act(async () => {
      return environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
        const numComments = numCommentsBeforeHiglighted
        const response = generateMockPayloadWithDefaults(operation, {
          Issue() {
            const timeline = makeBackTimeline({
              numComments,
              totalComments,
              startIndex: position - numCommentsBeforeHiglighted,
              startCursor: 'highlighted-event-cursor',
            })
            return {
              author: {
                login: 'author',
                id: 'author-id-123',
              },
              locked: false,
              ...timeline,
            }
          },
        })
        return response
      })
    })
  }
}

async function addResolverForEmptyHighlightedItem(
  environment: MockEnvironment,
  issueId: string = 'mockIssueId1',
  endCursor: string = 'cursor',
) {
  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation => {
      return generateMockPayloadWithDefaults(operation, {
        Issue: () => ({
          id: issueId,
          author: {
            login: 'author',
            id: 'author-id-123',
          },
          timelineItems: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor,
            },
          },
          timelineCounts: {
            afterFocusCount: 0,
            beforeFocusCount: 0,
          },
        }),
      })
    })
  })
}

describe('when highlighting timeline events', () => {
  beforeAll(() => {
    window.scrollBy = jest.fn()
  })
  afterAll(() => {
    jest.clearAllMocks()
  })

  function WrappedIssueCommentsWithHighlightingList({
    queryRef,
    highlightedEventText,
  }: {
    queryRef: PreloadedQuery<IssueTimelineTestSharedQuery>
    highlightedEventText?: string
  }) {
    return (
      <IssueTimelineTest
        queryRef={queryRef}
        onLinkClick={noop}
        navigate={noop}
        onCommentReply={noop}
        highlightedEventText={highlightedEventText}
        viewer="monalisa"
      />
    )
  }

  function TestHighlightComponent({environment, highlightedEventText}: TestHighlightComponentProps) {
    return (
      <RelayEnvironmentProvider environment={environment}>
        <IssueViewerContextProvider>
          <Suspense fallback="...Loading">
            <ComponentWithPreloadedQueryRef
              component={WrappedIssueCommentsWithHighlightingList}
              componentProps={{highlightedEventText}}
              query={IssueTimelineGraphqlQuery}
              queryVariables={{
                owner,
                repo,
                number,
              }}
            />
          </Suspense>
        </IssueViewerContextProvider>
      </RelayEnvironmentProvider>
    )
  }

  async function setupHighlightCommentEnvironment(
    totalComments: number,
    highlightedEventText: string,
    hasNextPage = false,
  ) {
    const {environment} = createRelayMockEnvironment()

    const {container} = render(
      <TestHighlightComponent environment={environment} highlightedEventText={highlightedEventText} />,
    )

    await act(() => addMostRecentResolver({environment, totalComments, hasNextPage}))

    return {container, environment}
  }

  test('highlighted item is not found', async () => {
    const totalComments = 200
    const {environment} = await setupHighlightCommentEnvironment(totalComments, `issuecomment-wrong`, true)

    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // shows the highlighted timeline section
    expect(screen.getByTestId(TEST_IDS.highlightedTimeline)).not.toBeNull()

    // shows the skeleton
    within(screen.getByTestId(TEST_IDS.highlightedTimeline)).getByTestId(TEST_IDS.commentSkeleton)
    await addResolverForEmptyHighlightedItem(environment, 'mockIssueId1', 'cursor')

    // There shouldn't be a highlighted timeline
    expect(screen.queryByTestId(TEST_IDS.highlightedTimeline)).not.toBeInTheDocument()

    // There should just be the default front timeline
    const timeline = screen.getByTestId(TEST_IDS.issueTimeline('front'))
    expect(timeline).not.toBeNull()

    // There should be the default number of comments shown
    const comments = within(timeline).getAllByTestId(TEST_IDS.markdownBody)
    expect(comments.length).toBe(15)

    // The load more button (in the front timeline) should be shown
    const loadMoreButton = screen.queryByTestId('issue-timeline-load-more-front')
    expect(loadMoreButton).toHaveTextContent('Load 150 more')
    expect(loadMoreButton).toHaveAccessibleDescription('185 remaining items')
  })

  test('loads highlighted comment if pagesize + 1', async () => {
    const totalComments = defaultNumberOfSSRComments + 1
    const highlightedCommentPosition = totalComments - 1
    const {environment} = await setupHighlightCommentEnvironment(
      totalComments,
      `issuecomment-${highlightedCommentPosition}`,
      true,
    )

    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // shows the highlighted timeline section
    expect(screen.getByTestId(TEST_IDS.highlightedTimeline)).not.toBeNull()

    // shows the skeleton
    within(screen.getByTestId(TEST_IDS.highlightedTimeline)).getByTestId(TEST_IDS.commentSkeleton)

    await addResolversForHighlightedItem(
      environment,
      highlightedCommentPosition,
      makeTimelineComment(highlightedCommentPosition),
      totalComments,
      0,
      0,
    )

    // does not show the load skeleton and shows the comment
    const timeline = screen.getByTestId(TEST_IDS.highlightedTimeline)
    expect(within(timeline).queryByTestId(TEST_IDS.commentSkeleton)).toBeNull()
    expect(screen.getByTestId(TEST_IDS.commentViewerOuterBox('comment 15'))).not.toBeNull()
  })

  test('loads highlighted event if pagesize + 1', async () => {
    const totalComments = 200
    const higlightedeventPosition = totalComments - 2
    const {environment} = await setupHighlightCommentEnvironment(
      totalComments,
      `event-${higlightedeventPosition}`,
      false,
    )

    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // shows the highlighted timeline section
    expect(screen.getByTestId(TEST_IDS.highlightedTimeline)).not.toBeNull()

    // shows the skeleton
    within(screen.getByTestId(TEST_IDS.highlightedTimeline)).getByTestId(TEST_IDS.commentSkeleton)
    await addResolversForHighlightedItem(
      environment,
      higlightedeventPosition,
      makeTimelinePinnedEvent(higlightedeventPosition),
      totalComments,
      1,
      1,
    )

    // does not show the load skeleton and shows the comment
    const timeline = screen.getByTestId(TEST_IDS.highlightedTimeline)
    expect(within(timeline).queryByTestId(TEST_IDS.commentSkeleton)).toBeNull()

    const highlightedTimeline = screen.getByTestId(TEST_IDS.issueTimeline('highlighted'))

    // eslint-disable-next-line testing-library/no-node-access
    const items = highlightedTimeline.children
    // Items should be
    // 0. timeline row border
    // 1. comment
    // 2. section
    //   1.1 timeline row border
    //   1.2 pinned event
    // 3. timeline row border
    // 4. comment

    expect(items.length).toBe(5)
    expect(items[1]).toHaveTextContent(`comment body ${higlightedeventPosition - 1}`)
    // eslint-disable-next-line testing-library/no-node-access
    expect(items[2]!.children[1]).toHaveTextContent(LABELS.timeline.pinned)
    expect(items[2]?.tagName).toBe('SECTION')
    expect(items[4]).toHaveTextContent(`comment body ${higlightedeventPosition + 1}`)
  })

  test('Loads from highlighted comments to the top', async () => {
    const highlightedCommentPosition = 205
    const totalComments = 400
    const {environment} = await setupHighlightCommentEnvironment(
      totalComments,
      `issuecomment-${highlightedCommentPosition}`,
      true,
    )

    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // shows the highlighted timeline section
    expect(screen.getByTestId(TEST_IDS.highlightedTimeline)).not.toBeNull()

    // shows the skeleton
    within(screen.getByTestId(TEST_IDS.highlightedTimeline)).getByTestId(TEST_IDS.commentSkeleton)

    await addResolversForHighlightedItem(
      environment,
      highlightedCommentPosition,
      makeTimelineComment(highlightedCommentPosition),
      totalComments,
    )

    // does not show the load skeleton and shows the comment
    const timeline = screen.getByTestId(TEST_IDS.highlightedTimeline)
    expect(within(timeline).queryByTestId(TEST_IDS.commentSkeleton)).toBeNull()
    expect(screen.getByTestId(TEST_IDS.commentViewerOuterBox(`comment ${highlightedCommentPosition}`))).not.toBeNull()

    // There should be a Load more before and after the highlighted comment only
    let loadMoreOptionsButtonBefore = screen.queryByTestId('issue-timeline-load-more-options-highlighted-before')
    expect(loadMoreOptionsButtonBefore).not.toBeNull()
    let loadMoreOptionsButtonAfter = screen.queryByTestId('issue-timeline-load-more-options-highlighted-after')
    expect(loadMoreOptionsButtonAfter).not.toBeNull()
    let loadMoreOptionsButtonFront = screen.queryByTestId('issue-timeline-load-more-options-front')
    expect(loadMoreOptionsButtonFront).toBeNull()

    const loadMoreBeforeCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-before')
    const hiddenCommentsBefore: number = +(loadMoreBeforeCount?.textContent as string)

    expect(hiddenCommentsBefore).toBe(highlightedCommentPosition - defaultNumberOfSSRComments)

    let loadMoreAfterCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-after')
    let hiddenCommentsAfter: number = +(loadMoreAfterCount?.textContent as string)
    expect(hiddenCommentsAfter).toBe(
      totalComments -
        highlightedCommentPosition -
        VALUES.loadAroundHighlightedPageSize -
        VALUES.timelineBackPageSize -
        1,
    )

    let loadMoreButton = screen.queryByTestId('issue-timeline-load-more-highlighted-before')
    expect(loadMoreButton).not.toBeNull()
    fireEvent.click(loadMoreButton as HTMLElement)
    act(() => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: true,
        startIndex: defaultNumberOfSSRComments,
        numComments: defaultNumberOfCommentsToLoad,
      })
    })

    loadMoreButton = screen.queryByTestId('issue-timeline-load-more-highlighted-before')
    expect(loadMoreButton?.textContent).toBe('Load all')
    expect(loadMoreButton).toHaveAccessibleDescription('40 remaining items')

    loadMoreAfterCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-after')
    hiddenCommentsAfter = +(loadMoreAfterCount?.textContent as string)
    expect(hiddenCommentsAfter).toBe(
      totalComments -
        highlightedCommentPosition -
        VALUES.loadAroundHighlightedPageSize -
        VALUES.timelineBackPageSize -
        1,
    )

    fireEvent.click(loadMoreButton as HTMLElement)
    act(() => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: true,
        startIndex: defaultNumberOfSSRComments + defaultNumberOfCommentsToLoad,
      })
    })

    // There should be a Load more after the highlighted comment only
    loadMoreOptionsButtonBefore = screen.queryByTestId('issue-timeline-load-more-options-highlighted-before')
    expect(loadMoreOptionsButtonBefore).toBeNull()
    loadMoreOptionsButtonAfter = screen.queryByTestId('issue-timeline-load-more-options-highlighted-after')
    expect(loadMoreOptionsButtonAfter).not.toBeNull()
    loadMoreOptionsButtonFront = screen.queryByTestId('issue-timeline-load-more-options-front')
    expect(loadMoreOptionsButtonFront).toBeNull()

    loadMoreAfterCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-after')
    hiddenCommentsAfter = +(loadMoreAfterCount?.textContent as string)
    expect(hiddenCommentsAfter).toBe(
      totalComments -
        highlightedCommentPosition -
        VALUES.loadAroundHighlightedPageSize -
        VALUES.timelineBackPageSize -
        1,
    )
  })

  test('can load from the bottom until the highlighted comment', async () => {
    const highlightedCommentPosition = 200
    const totalComments = 550
    const {environment} = await setupHighlightCommentEnvironment(
      totalComments,
      `issuecomment-${highlightedCommentPosition}`,
      true,
    )

    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // shows the highlighted timeline section
    expect(screen.getByTestId(TEST_IDS.highlightedTimeline)).not.toBeNull()

    // shows the skeleton
    within(screen.getByTestId(TEST_IDS.highlightedTimeline)).getByTestId(TEST_IDS.commentSkeleton)

    // lazy loads the comment
    // Mock the useLazyLoadQuery from the LazyLabelPicker
    await addResolversForHighlightedItem(
      environment,
      highlightedCommentPosition,
      makeTimelineComment(highlightedCommentPosition),
      totalComments,
    )

    // does not show the load skeleton and shows the comment
    const timeline = screen.getByTestId(TEST_IDS.highlightedTimeline)
    expect(within(timeline).queryByTestId(TEST_IDS.commentSkeleton)).toBeNull()
    expect(screen.getByTestId(TEST_IDS.commentViewerOuterBox(`comment ${highlightedCommentPosition}`))).not.toBeNull()

    // There should be a Load more before and after the highlighted comment only
    const loadMoreOptionsButtonBefore = screen.queryByTestId('issue-timeline-load-more-options-highlighted-before')

    expect(loadMoreOptionsButtonBefore).not.toBeNull()
    const loadMoreOptionsButtonAfter = screen.queryByTestId('issue-timeline-load-more-options-highlighted-after')
    expect(loadMoreOptionsButtonAfter).not.toBeNull()
    const loadMoreOptionsButtonFront = screen.queryByTestId('issue-timeline-load-more-options-front')
    expect(loadMoreOptionsButtonFront).toBeNull()

    let loadMoreBeforeCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-before')
    let hiddenCommentsBefore: number = +(loadMoreBeforeCount?.textContent as string)
    expect(hiddenCommentsBefore).toBe(highlightedCommentPosition - defaultNumberOfSSRComments)

    let loadMoreAfterCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-after')
    let hiddenCommentsAfter: number = +(loadMoreAfterCount?.textContent as string)
    expect(hiddenCommentsAfter).toBe(
      totalComments -
        highlightedCommentPosition -
        VALUES.loadAroundHighlightedPageSize -
        VALUES.timelineBackPageSize -
        1,
    )

    fireEvent.click(loadMoreOptionsButtonAfter as HTMLElement)
    const loadAfterButton = await screen.findByText('Load newer activity')
    expect(loadAfterButton).not.toBeNull()
    fireEvent.click(loadAfterButton)

    act(() => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: true,
        startIndex: totalComments - defaultNumberOfCommentsToLoad + VALUES.loadAroundHighlightedPageSize,
        direction: 'back',
      })
    })

    loadMoreBeforeCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-before')
    hiddenCommentsBefore = +(loadMoreBeforeCount?.textContent as string)

    expect(hiddenCommentsBefore).toBe(highlightedCommentPosition - defaultNumberOfSSRComments)

    loadMoreAfterCount = screen.queryByTestId('issue-timeline-load-more-count-highlighted-after')
    hiddenCommentsAfter = +(loadMoreAfterCount?.textContent as string)
    expect(hiddenCommentsAfter).toBe(
      totalComments -
        highlightedCommentPosition -
        defaultNumberOfCommentsToLoad -
        VALUES.loadAroundHighlightedPageSize -
        VALUES.timelineBackPageSize -
        1,
    )

    const commentsContainerFront = screen.getByTestId(TEST_IDS.issueTimeline('front'))
    const commentsFront = within(commentsContainerFront).getAllByTestId(TEST_IDS.markdownBody)

    const commentsContainerBack = screen.getByTestId(TEST_IDS.issueTimeline('back'))
    const commentsback = within(commentsContainerBack).getAllByTestId(TEST_IDS.markdownBody)

    const commentsContainerHighlighted = screen.getByTestId(TEST_IDS.issueTimeline('highlighted'))
    const commentsHighlighted = within(commentsContainerHighlighted).getAllByTestId(TEST_IDS.markdownBody)

    // Check that each timeline has the correct number of comments
    expect(commentsFront.length).toBe(defaultNumberOfSSRComments)
    expect(commentsback.length).toBe(defaultNumberOfCommentsToLoad + VALUES.timelineBackPageSize)
    expect(commentsHighlighted.length).toBe(1 - VALUES.timelineBackPageSize + VALUES.loadAroundHighlightedPageSize * 2)

    // Check that the comments are rendered in the correct order
    for (let i = 0; i < commentsFront.length; i++) {
      expect(commentsFront[i]).toHaveTextContent(`comment body ${i}`)
    }
    for (let i = 0; i < commentsback.length - VALUES.timelineBackPageSize; i++) {
      expect(commentsback[i]).toHaveTextContent(
        `comment body ${totalComments - defaultNumberOfCommentsToLoad + i + VALUES.loadAroundHighlightedPageSize}`,
      )
    }
    for (let i = 0; i < commentsHighlighted.length; i++) {
      expect(commentsHighlighted[i]).toHaveTextContent(
        `comment body ${
          highlightedCommentPosition + VALUES.timelineBackPageSize - VALUES.loadAroundHighlightedPageSize + i
        }`,
      )
    }
  })
})

import {render} from '@github-ui/react-core/test-utils'
import {ComponentWithPreloadedQueryRef} from '@github-ui/relay-test-utils/RelayComponents'
import {createRelayMockEnvironment} from '@github-ui/relay-test-utils/RelayMockEnvironment'
import {fireEvent, screen, within, act} from '@testing-library/react'
import {Suspense} from 'react'
import {type PreloadedQuery, RelayEnvironmentProvider} from 'react-relay'
import type {OperationDescriptor} from 'relay-runtime'
import type {createMockEnvironment, MockEnvironment} from 'relay-test-utils'

import {BUTTON_LABELS} from '../../constants/buttons'
import {TEST_IDS} from '../../constants/test-ids'
import {VALUES} from '../../constants/values'

import {IssueViewerContextProvider} from '../../contexts/IssueViewerContext'
import {makeTimeline, makeBackTimeline} from '../../test-utils/payloads/Timeline'
import {generateMockPayloadWithDefaults} from '../../test-utils/DefaultWrappers'
import {IssueTimelineGraphqlQuery, IssueTimelineTest} from './IssueTimelineTestShared'
import type {IssueTimelineTestSharedQuery} from './__generated__/IssueTimelineTestSharedQuery.graphql'
import {noop} from '@github-ui/noop'

const owner = 'owner'
const repo = 'repo'
const number = 10
const initialTimelinePageSize = 15
const defaultNumberOfCommentsToLoad = 150
const defaultNumberOfCommentsFromTheBack = VALUES.timelineBackPageSize

const urlParams = {
  owner,
  repo,
  number,
}

type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
}

jest.setTimeout(10000)
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

jest.mock('@primer/behaviors/utils', () => {
  return {
    ...jest.requireActual('@primer/behaviors/utils'),
    getFocusableChild: jest.fn().mockImplementation(container => {
      return within(container).getByTestId('avatar-link')
    }),
  }
})

function WrappedIssueCommentsList({queryRef, ...props}: {queryRef: PreloadedQuery<IssueTimelineTestSharedQuery>}) {
  return <IssueTimelineTest queryRef={queryRef} viewer="monalisa" navigate={noop} {...props} />
}

function TestComponent({environment, ...props}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <IssueViewerContextProvider>
        <Suspense fallback="...Loading">
          <ComponentWithPreloadedQueryRef
            component={WrappedIssueCommentsList}
            componentProps={props}
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

type SetupEnvironmentProps = {
  totalComments: number
  hasNextPage: boolean
  componentProps?: object
}

async function setupEnvironment({totalComments, hasNextPage, componentProps}: SetupEnvironmentProps) {
  const {environment} = createRelayMockEnvironment()
  const {container} = render(<TestComponent environment={environment} {...componentProps} />)
  await act(async () => {
    addMostRecentResolver({environment, totalComments, hasNextPage, numComments: initialTimelinePageSize})
  })

  return {container, environment}
}

type AddMostRecentResolverProps = {
  environment: MockEnvironment
  totalComments: number
  numComments: number
  hasNextPage?: boolean
  startIndex?: number
  direction?: 'front' | 'back'
}

const ADD_MOST_RECENT_RESOLVER_DEFAULT_ARGS = {
  hasNextPage: false,
  startIndex: 0,
  direction: 'front',
  numComments: 25,
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

describe('Timeline tests', () => {
  test('renders load all button for timelines with less then 150 remaining items if timeline has next page and loads from after the last timeline item', async () => {
    const totalComments = initialTimelinePageSize + initialTimelinePageSize + defaultNumberOfCommentsFromTheBack
    const {environment} = await setupEnvironment({totalComments, hasNextPage: true})
    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    let loadMoreButton = screen.queryByTestId('issue-timeline-load-more-front')
    expect(loadMoreButton).toBeInTheDocument()
    expect(loadMoreButton).toHaveTextContent('Load all')
    expect(loadMoreButton).toHaveAccessibleDescription('30 remaining items')

    const frontCommentsContainer = screen.getByTestId(TEST_IDS.issueTimeline('front'))
    const backCommentsContainer = screen.getByTestId(TEST_IDS.issueTimeline('back'))
    let frontComments = within(frontCommentsContainer).getAllByTestId(TEST_IDS.markdownBody)
    expect(frontComments.length).toBe(initialTimelinePageSize)

    // resolve the call from back request
    await act(async () => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: false,
        startIndex: totalComments - defaultNumberOfCommentsFromTheBack,
        numComments: defaultNumberOfCommentsFromTheBack,
        direction: 'back',
      })
    })

    const backComments = within(backCommentsContainer).getAllByTestId(TEST_IDS.markdownBody)
    // Check that the timeline grew by moreComments comments
    expect(backComments.length).toBe(defaultNumberOfCommentsFromTheBack)

    fireEvent.click(loadMoreButton as HTMLElement)

    // resolve the call from back request
    await act(async () => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: false,
        startIndex: initialTimelinePageSize,
        numComments: initialTimelinePageSize,
        direction: 'front',
      })
    })

    frontComments = within(frontCommentsContainer).getAllByTestId(TEST_IDS.markdownBody)

    // Check that the timeline grew by moreComments comments
    expect(frontComments.length).toBe(initialTimelinePageSize + initialTimelinePageSize)

    // // Check that the comments are rendered in the correct order
    for (let i = 0; i < Math.min(initialTimelinePageSize + initialTimelinePageSize, totalComments); i++) {
      expect(frontComments[i]).toHaveTextContent(`comment body ${i}`)
    }

    // Expect focus to be set on the first item of newly loaded items in the existing front section
    expect(within(frontCommentsContainer).getAllByTestId('avatar-link').at(initialTimelinePageSize)).toHaveFocus()

    // // Loaded all comments so there shouldn't be a load more button
    loadMoreButton = screen.queryByTestId('issue-timeline-load-more-front')
    expect(loadMoreButton).not.toBeInTheDocument()
  })

  test('renders load more button for timelines with more then 150 remaining items if timeline has next page and loads from after the last timeline item', async () => {
    const totalComments =
      initialTimelinePageSize +
      defaultNumberOfCommentsToLoad +
      defaultNumberOfCommentsToLoad +
      defaultNumberOfCommentsFromTheBack
    const {environment} = await setupEnvironment({totalComments, hasNextPage: true})
    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    let hiddenCount = screen.queryByTestId('issue-timeline-load-more-count-front')
    const loadMoreButton = screen.queryByTestId('issue-timeline-load-more-front')
    expect(loadMoreButton).toHaveTextContent('Load 150 more')
    expect(loadMoreButton).toHaveAccessibleDescription('315 remaining items')

    const frontCommentsContainer = screen.getByTestId(TEST_IDS.issueTimeline('front'))
    const backCommentsContainer = screen.getByTestId(TEST_IDS.issueTimeline('back'))
    let frontComments = within(frontCommentsContainer).getAllByTestId(TEST_IDS.markdownBody)
    expect(frontComments.length).toBe(initialTimelinePageSize)

    let hiddenComments: number = +(hiddenCount?.textContent as string)
    expect(hiddenComments).toBe(totalComments - initialTimelinePageSize)

    // resolve the call from back request
    await act(async () => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: false,
        numComments: defaultNumberOfCommentsFromTheBack,
        startIndex: totalComments - defaultNumberOfCommentsFromTheBack,
        direction: 'back',
      })
    })

    // check that the number has been reduced
    hiddenCount = screen.queryByTestId('issue-timeline-load-more-count-front')
    hiddenComments = +(hiddenCount?.textContent as string)
    expect(hiddenComments).toBe(totalComments - initialTimelinePageSize - defaultNumberOfCommentsFromTheBack)

    const backComments = within(backCommentsContainer).getAllByTestId(TEST_IDS.markdownBody)
    // Check that the timeline grew by moreComments comments
    expect(backComments.length).toBe(defaultNumberOfCommentsFromTheBack)

    fireEvent.click(loadMoreButton as HTMLElement)

    // resolve the call from back request
    await act(async () => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: false,
        startIndex: initialTimelinePageSize,
        numComments: defaultNumberOfCommentsToLoad,
        direction: 'front',
      })
    })

    frontComments = within(frontCommentsContainer).getAllByTestId(TEST_IDS.markdownBody)

    // Check that the timeline grew by moreComments comments
    expect(frontComments.length).toBe(initialTimelinePageSize + defaultNumberOfCommentsToLoad)

    // // Check that the comments are rendered in the correct order
    for (let i = 0; i < Math.min(initialTimelinePageSize + defaultNumberOfCommentsToLoad, totalComments); i++) {
      expect(frontComments[i]).toHaveTextContent(`comment body ${i}`)
    }
  })

  test('renders load more button if timeline has next page and loads from the end', async () => {
    const totalComments =
      initialTimelinePageSize +
      defaultNumberOfCommentsToLoad +
      defaultNumberOfCommentsToLoad +
      defaultNumberOfCommentsFromTheBack +
      1
    const {environment} = await setupEnvironment({totalComments, hasNextPage: true})
    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))
    const loadMoreOptionsButton = screen.queryByTestId('issue-timeline-load-more-options-front')

    const hiddenCount = screen.queryByTestId('issue-timeline-load-more-count-front')
    let hiddenComments = +(hiddenCount?.textContent as string)
    expect(hiddenComments).toBe(totalComments - initialTimelinePageSize)

    expect(loadMoreOptionsButton).toBeInTheDocument()

    const commentsContainer = screen.getByTestId(TEST_IDS.issueTimeline('front'))
    let comments = within(commentsContainer).getAllByTestId(TEST_IDS.markdownBody)
    expect(comments.length).toBe(initialTimelinePageSize)

    fireEvent.click(loadMoreOptionsButton as HTMLElement)

    const loadAfterButton = await screen.findByText('Load newer activity')

    expect(loadAfterButton).toBeInTheDocument()

    // There shouldn't be any back timeline comments at this point
    const backCommentsContainer = screen.getByTestId(TEST_IDS.issueTimeline('back'))
    let commentsBack = within(backCommentsContainer).queryAllByTestId(TEST_IDS.markdownBody)
    expect(commentsBack.length).toBe(0)

    act(() => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: false,
        numComments: defaultNumberOfCommentsFromTheBack,
        startIndex: totalComments - defaultNumberOfCommentsFromTheBack,
        direction: 'back',
      })
    })

    // moreComments comments should have been added to the back timeline
    commentsBack = await within(backCommentsContainer).findAllByTestId(TEST_IDS.markdownBody)
    expect(commentsBack.length).toBe(defaultNumberOfCommentsFromTheBack)

    fireEvent.click(loadAfterButton)

    await act(async () => {
      addMostRecentResolver({
        environment,
        totalComments,
        hasNextPage: false,
        numComments: defaultNumberOfCommentsToLoad,
        startIndex: totalComments - defaultNumberOfCommentsToLoad - defaultNumberOfCommentsFromTheBack,
        direction: 'back',
      })
    })

    const loadMoreButton = screen.queryByTestId('issue-timeline-load-more-front')
    expect(loadMoreButton).toBeInTheDocument()
    expect(loadMoreButton).toHaveTextContent('Load 150 more')
    expect(loadMoreButton).toHaveAccessibleDescription('151 remaining items')

    commentsBack = await within(backCommentsContainer).findAllByTestId(TEST_IDS.markdownBody)
    expect(commentsBack.length).toBe(defaultNumberOfCommentsFromTheBack + defaultNumberOfCommentsToLoad)

    // The number of comments in the front timeline shouldn't have changed
    comments = within(commentsContainer).getAllByTestId(TEST_IDS.markdownBody)
    expect(comments.length).toBe(initialTimelinePageSize)

    hiddenComments = +(hiddenCount?.textContent as string)
    expect(hiddenComments).toBe(
      totalComments - initialTimelinePageSize - defaultNumberOfCommentsToLoad - defaultNumberOfCommentsFromTheBack,
    )
  })

  test('Does not render load more button if timeline doesnt have next page', async () => {
    await setupEnvironment({totalComments: 3, hasNextPage: false})
    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // refute load more button
    expect(screen.queryByTestId('issue-timeline-load-more-front')).not.toBeInTheDocument()
  })

  test('render 2 comments, make changes and save', async () => {
    const {environment} = await setupEnvironment({totalComments: 3, hasNextPage: false})

    // Load timeline
    await screen.findByTestId(TEST_IDS.issueTimeline('front'))

    // Get edit menu for a specific comment
    const comment = screen.getByTestId(TEST_IDS.commentViewerOuterBox('comment 2'))
    const commentEditMenu = within(comment).getByTestId(TEST_IDS.commentHeaderHamburger)

    // Comment edit menu should be closed
    expect(screen.queryByTestId(TEST_IDS.commentHeaderHamburgerOpen)).not.toBeInTheDocument()
    // Click on open comment edit menu
    fireEvent.click(commentEditMenu)
    // Comment edit menu should be open
    const commentEditMenuOpened = screen.getByTestId(TEST_IDS.commentHeaderHamburgerOpen)
    expect(commentEditMenuOpened).toBeInTheDocument()
    // Comment editor should be closed
    expect(screen.queryByTestId(TEST_IDS.commentBox('comment-editor'))).not.toBeInTheDocument()
    // Click on edit comment button
    const editButton = within(commentEditMenuOpened).getByText('Edit')
    fireEvent.click(editButton)
    // Comment editor should be open
    const commentBox = screen.getByTestId(TEST_IDS.commentBox('comment-editor'))
    expect(commentBox).toBeInTheDocument()

    // Change the comment body
    const textArea = within(commentBox).getByRole('textbox')
    fireEvent.change(textArea, {target: {value: 'new comment body'}})
    // Save the changes
    const updateCommentButton = within(commentBox).getByText(BUTTON_LABELS.updateComment)
    fireEvent.click(updateCommentButton)

    // Check that the correct mutation was called
    const operation = environment.mock.getMostRecentOperation()
    expect(operation.fragment.node.name).toBe('updateIssueCommentBodyMutation')
  })
})

test('onReply is triggered when reply button is clicked', async () => {
  const onCommentReplyMock = jest.fn()
  await setupEnvironment({totalComments: 3, hasNextPage: false, componentProps: {onCommentReply: onCommentReplyMock}})

  const commentActions = await screen.findAllByLabelText('Comment actions')
  expect(commentActions).not.toHaveLength(0)

  const commentAction = commentActions[0]!
  fireEvent.click(commentAction)

  const quoteReplyAction = screen.getByText('Quote reply')
  expect(quoteReplyAction).toBeInTheDocument()
  fireEvent.click(quoteReplyAction)

  expect(onCommentReplyMock).toHaveBeenCalledTimes(1)
})

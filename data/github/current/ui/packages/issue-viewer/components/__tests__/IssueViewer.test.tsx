import {act, fireEvent, screen, waitFor, within} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'

import {TEST_IDS} from '../../constants/test-ids'
import {makeIssueBaseFields} from '../../test-utils/Mocks'
import {setupMockEnvironment} from '../../test-utils/components/IssueViewerTestComponent'
import {EmuContributionBlockedBannerGraphQLQuery} from '../EmuContributionBlockedBanner'
import type {MockResolverContext} from 'relay-test-utils/lib/RelayMockPayloadGenerator'

jest.mock('@github-ui/use-safe-storage/session-storage', () => ({
  useSessionStorage: () => ['', jest.fn()],
}))

jest.setTimeout(15_000)
jest.mock('@github-ui/react-core/use-app-payload')

beforeAll(async () => {
  // preload the ReactionViewer component because it is lazily rendered inside IssueBody & comments
  await import('@github-ui/reaction-viewer/ReactionViewer')
})

test('render issue viewer, highlight a part of a comment and quote it', async () => {
  const mockedUseAppPayload = jest.mocked(useAppPayload)
  mockedUseAppPayload.mockReturnValue({
    current_user_settings: {
      use_single_key_shortcut: true,
    },
  })
  const mockEnvironment = await setupMockEnvironment({
    mockOverwrites: {
      Issue() {
        return {
          viewerCanComment: true,
        }
      },
    },
  })
  const commentNum = 1
  const selectionStart = 3
  const selectionEnd = 7

  const container = mockEnvironment.container

  if (!container) {
    throw new Error('Container is null')
  }

  const comments = screen.getAllByTestId<HTMLTextAreaElement>(/markdown-body/)
  // eslint-disable-next-line testing-library/no-node-access
  const comment = comments[commentNum]?.querySelector<HTMLTextAreaElement>('.markdown-body')

  selectRangeInComment(comment, selectionStart, selectionEnd)

  fireEvent.keyDown(container, {key: 'r', bubbles: true})

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const newCommentValue = screen.getByRole('textbox', {name: /add a comment/i}) as HTMLTextAreaElement
  const selected = comment?.innerHTML?.substring(selectionStart, selectionEnd)
  let expectedValue = `> ${selected}\n\n`
  expect(newCommentValue).toHaveValue(expectedValue)

  const textInputValue = 'SOMETHING'
  fireEvent.change(newCommentValue, {target: {value: `${newCommentValue.value}${textInputValue}`}})

  selectRangeInComment(comment, selectionEnd, selectionEnd + 4)

  fireEvent.keyDown(container, {key: 'r', bubbles: true})

  const newSelected = comment?.innerHTML?.substring(selectionEnd, selectionEnd + 4)
  expectedValue = `> ${selected}\n\n${textInputValue}\n\n>${newSelected}\n\n`
  expect(newCommentValue).toHaveValue(expectedValue)

  selectRangeInComment(comment, selectionEnd, selectionEnd + 7)
  // Open comment action menu
  // Get all comment boxes
  const commentBoxes = screen.getAllByTestId(/comment-viewer-outer-box/)
  expect(commentBoxes).not.toHaveLength(0)
  const commentBox = commentBoxes[0]!
  const commentAction = within(commentBox).getByLabelText('Comment actions')
  fireEvent.click(commentAction)
  // Click quote reply option
  const quoteReplyAction = screen.getByText('Quote reply')
  expect(quoteReplyAction).toBeInTheDocument()
  fireEvent.click(quoteReplyAction)

  const newSelected2 = comment?.innerHTML?.substring(selectionEnd, selectionEnd + 7)
  expectedValue = `> ${selected}\n\n${textInputValue}\n\n>${newSelected}\n\n\n\n>${newSelected2}\n\n`
  expect(newCommentValue).toHaveValue(expectedValue)
})

test('submit a new comment via the comment composer', async () => {
  const {environment} = await setupMockEnvironment({
    mockOverwrites: {
      Issue() {
        return {
          viewerCanComment: true,
        }
      },
    },
  })

  // Check that the issue viewer is rendered, but not the edit components
  // -------------------------------

  // Check that issue viewer is loaded
  expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

  // Check that the comment composer is loaded
  const commentComposer = screen.getByTestId(TEST_IDS.commentBox('comment-composer'))
  expect(commentComposer).not.toBeNull()
  // Check that the commment composer body has no text
  const textArea = within(commentComposer).getByRole('textbox', {hidden: true})
  expect(textArea).toHaveValue('')

  // Update the text in the comment composer
  fireEvent.change(textArea, {target: {value: 'new comment text'}})

  // Check that the comment composer body has the new text
  expect(textArea).toHaveValue('new comment text')

  // Save the changes
  const updateCommentButton = within(commentComposer).getByText('Comment')
  fireEvent.click(updateCommentButton)

  // Check that the correct mutation was called
  const operation = environment.mock.getMostRecentOperation()
  expect(operation.fragment.node.name).toBe('addCommentMutation')

  act(() => {
    environment.mock.resolveMostRecentOperation((x: OperationDescriptor) => {
      return MockPayloadGenerator.generate(x, {
        ...makeIssueBaseFields(),
      })
    })
  })

  // Check that the commment composer body has no text. Query for the element again since it has been reset and thus rerendered
  await waitFor(() => expect(within(commentComposer).getByRole('textbox')).toHaveValue(''))
})

test('triggers secondary view query on render', async () => {
  const {environment} = await setupMockEnvironment({
    mockOverwrites: {
      Issue() {
        return {
          viewerCanDelete: true,
        }
      },
    },
  })

  // Check that issue viewer is loaded
  expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

  const lastOperation = environment.mock.getMostRecentOperation()
  expect(lastOperation.fragment.node.name).toBe('IssueViewerTestComponentSecondaryQuery')
})

test('Does not show contributor footer on first render', async () => {
  await setupMockEnvironment({
    mockOverwrites: {
      Issue() {
        return {
          viewerCanComment: true,
        }
      },
    },
  })
  // Check that issue viewer is loaded
  expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

  // Check that the comment composer is loaded
  const commentComposer = screen.getByTestId(TEST_IDS.commentBox('comment-composer'))
  expect(commentComposer).toBeInTheDocument()

  expect(screen.queryByTestId('contributor-footer')).not.toBeInTheDocument()
})

test('shows correct document title after loading issue viewer', async () => {
  await setupMockEnvironment()
  // We expect there to be a issue header title and a sticky header title (which is invisible)
  const issueHeader = screen.getByTestId(TEST_IDS.issueHeader)
  const issueTitle = within(issueHeader).getByTestId(TEST_IDS.issueTitle).textContent

  const stickyIssueTitle = screen.getByTestId(TEST_IDS.issueTitleSticky)
  expect(stickyIssueTitle).not.toBeVisible()

  expect(document.title).toContain(issueTitle)
})

test('when reply button is clicked, comment composer is focused and quoted text is appened to it', async () => {
  await setupMockEnvironment({
    mockOverwrites: {
      Issue() {
        return {
          viewerCanComment: true,
        }
      },
    },
  })

  // Prefill comment composer with a comment so we can later check that value is appended, not replaced
  const commentComposerContainer = screen.getByTestId(TEST_IDS.commentComposer)
  const commentComposerTextarea = within(commentComposerContainer).getByRole('textbox')
  fireEvent.change(commentComposerTextarea, {target: {value: 'default comment'}})
  expect(commentComposerTextarea).toHaveValue('default comment')
  expect(commentComposerTextarea).not.toHaveFocus()

  // Get all comment boxes
  const comments = screen.getAllByTestId(/comment-viewer-outer-box/)
  expect(comments).not.toHaveLength(0)

  // Pick the first available comment for testing
  const comment = comments[0]!
  const commentAction = within(comment).getByLabelText('Comment actions')
  const commentText = within(comment).getByTestId(TEST_IDS.markdownBody)

  // Open comment action menu
  fireEvent.click(commentAction)

  // Click quote reply option
  const quoteReplyAction = screen.getByText('Quote reply')
  expect(quoteReplyAction).toBeInTheDocument()
  fireEvent.click(quoteReplyAction)

  // Expect textarea to have quoted text
  const expectedValue = `default comment\n\n> ${commentText.textContent}\n\n`
  expect(commentComposerTextarea).toHaveValue(expectedValue)

  await waitFor(() => expect(commentComposerTextarea).toHaveFocus())
}, 12_000)

describe('issue viewer metadata section width', () => {
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth || 0)
  })

  test('for small screens', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 543,
    })

    await setupMockEnvironment()

    const container1 = screen.getByTestId(TEST_IDS.issueViewerMetadataContainer)
    const width = window.getComputedStyle(container1).width

    expect(width).toBe('auto')
  })

  test('for medium screens', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 545,
    })

    await setupMockEnvironment()

    const container1 = screen.getByTestId(TEST_IDS.issueViewerMetadataContainer)
    const width = window.getComputedStyle(container1).width

    expect(width).toBe('auto')
  })

  test('for large screens', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 769,
    })

    await setupMockEnvironment()

    const container1 = screen.getByTestId(TEST_IDS.issueViewerMetadataContainer)
    const width = window.getComputedStyle(container1).width

    expect(width).toBe('256px')
  })

  test('for extra large screens', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 1012,
    })

    await setupMockEnvironment()

    const container1 = screen.getByTestId(TEST_IDS.issueViewerMetadataContainer)
    const width = window.getComputedStyle(container1).width

    expect(width).toBe('296px')
  })
})

describe('issue viewer metadata responsiveness', () => {
  test('overlay and sidebar in dom when responsive', async () => {
    await setupMockEnvironment({viewerOptions: {useViewportQueries: true, responsiveRightSidepanel: true}})

    const triggers = screen.getAllByTestId(TEST_IDS.issueViewerMetadataOverlayTrigger)
    expect(triggers).toHaveLength(2)

    const sidebar = screen.getByTestId(TEST_IDS.issueViewerMetadataPane)
    expect(sidebar).toBeInTheDocument()
  })
  test('only sidebar presented when non-responsive', async () => {
    await setupMockEnvironment({viewerOptions: {useViewportQueries: true, responsiveRightSidepanel: false}})

    const trigger = screen.queryByTestId(TEST_IDS.issueViewerMetadataOverlayTrigger)
    expect(trigger).not.toBeInTheDocument()

    const sidebar = screen.getByTestId(TEST_IDS.issueViewerMetadataPane)
    expect(sidebar).toBeInTheDocument()
  })
})

describe('issue viewer metadata responsiveness using parent container width', () => {
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth ?? 0)
  })

  test('overlay presented for small containers', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 543,
    })

    await setupMockEnvironment({viewerOptions: {useViewportQueries: false, responsiveRightSidepanel: true}})

    const triggers = screen.getAllByTestId(TEST_IDS.issueViewerMetadataOverlayTrigger)
    expect(triggers).toHaveLength(2)
    for (const trigger of triggers) {
      expect(trigger).toBeInTheDocument()
    }
    const headerTrigger = within(screen.getByTestId(TEST_IDS.issueMetadataFixed)).getByTestId(
      TEST_IDS.issueViewerMetadataOverlayTrigger,
    )
    expect(headerTrigger).toBeVisible()

    const sidebar = screen.queryByTestId(TEST_IDS.issueViewerMetadataPane)
    expect(sidebar).not.toBeInTheDocument()
  })
  test('overlay presented for medium containers', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 545,
    })

    await setupMockEnvironment({viewerOptions: {useViewportQueries: false, responsiveRightSidepanel: true}})

    const triggers = screen.getAllByTestId(TEST_IDS.issueViewerMetadataOverlayTrigger)
    expect(triggers).toHaveLength(2)
    for (const trigger of triggers) {
      expect(trigger).toBeInTheDocument()
    }
    const headerTrigger = within(screen.getByTestId(TEST_IDS.issueMetadataFixed)).getByTestId(
      TEST_IDS.issueViewerMetadataOverlayTrigger,
    )
    expect(headerTrigger).toBeVisible()

    const sidebar = screen.queryByTestId(TEST_IDS.issueViewerMetadataPane)
    expect(sidebar).not.toBeInTheDocument()
  })
  test('sidebar presented for large containers', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 769,
    })

    await setupMockEnvironment({viewerOptions: {useViewportQueries: false, responsiveRightSidepanel: true}})

    const trigger = screen.queryByTestId(TEST_IDS.issueViewerMetadataOverlayTrigger)
    expect(trigger).not.toBeInTheDocument()

    const sidebar = screen.getByTestId(TEST_IDS.issueViewerMetadataPane)
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toBeVisible()
  })
  test('sidebar presented for extra large containers', async () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 1012,
    })

    await setupMockEnvironment({viewerOptions: {useViewportQueries: false, responsiveRightSidepanel: true}})

    const trigger = screen.queryByTestId(TEST_IDS.issueViewerMetadataOverlayTrigger)
    expect(trigger).not.toBeInTheDocument()

    const sidebar = screen.getByTestId(TEST_IDS.issueViewerMetadataPane)
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toBeVisible()
  })
})

test('Renders EMU contribution blocked banner', async () => {
  const {environment} = await setupMockEnvironment({
    mockOverwrites: {
      Issue() {
        return {
          viewerCanComment: true,
        }
      },
      User() {
        return {
          enterpriseManagedEnterpriseId: 'EMUID',
        }
      },
    },
  })

  // Check that issue viewer is loaded
  expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

  // Check that the comment composer is not loaded
  const commentComposer = screen.queryByTestId(TEST_IDS.commentBox('comment-composer'))
  expect(commentComposer).not.toBeInTheDocument()

  environment.mock.queuePendingOperation(EmuContributionBlockedBannerGraphQLQuery, {enterpriseId: 'EMUID'})
  await act(async () => {
    environment.mock.resolveMostRecentOperation((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('EmuContributionBlockedBannerQuery')
      return MockPayloadGenerator.generate(operation, {
        String(context: MockResolverContext) {
          if (context.name === 'slug') {
            return 'EMUSLUG'
          }
        },
      })
    })
  })

  const banner = screen.getByText(/you cannot contribute to repositories outside of your enterprise emuslug\./i)
  expect(banner).toBeInTheDocument()
})

function selectRangeInComment(
  comment: HTMLTextAreaElement | null | undefined,
  selectionStart: number,
  selectionEnd: number,
) {
  if (comment && comment.firstChild) {
    const selection = window.getSelection()
    const range = document.createRange()
    // eslint-disable-next-line testing-library/no-node-access
    range.setStart(comment.firstChild, selectionStart)
    // eslint-disable-next-line testing-library/no-node-access
    range.setEnd(comment.firstChild, selectionEnd)

    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

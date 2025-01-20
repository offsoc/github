import {render} from '@github-ui/react-core/test-utils'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {act, fireEvent, screen} from '@testing-library/react'
import {createRef} from 'react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'

import {ERRORS} from '../../../constants/errors'
import type {MarkdownComposerRef} from '../../../hooks/use-markdown-body'
import {IssueCommentComposerTestComponent} from '../../../test-utils/IssueCommentComposerTestComponent'

jest.mock('@github-ui/react-core/use-feature-flag')
const mockUseFeatureFlags = jest.mocked(useFeatureFlags)

beforeEach(() => {
  mockUseFeatureFlags.mockReturnValue({})
})

afterEach(() => {
  sessionStorage.clear()
})

test("Contains the viewer's avatar that links to their profile", async () => {
  const environment = createMockEnvironment()

  render(<IssueCommentComposerTestComponent environment={environment} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        User: () => ({
          login: 'monalisa',
          commentingAvatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
        }),
      }),
    )
  })

  const viewerAvatar = screen.getByAltText('monalisa')
  expect(viewerAvatar).toBeVisible()

  const link = screen.getByRole('link', {name: /monalisa/i})
  expect(link).toHaveAttribute('href', '/monalisa')
  // make sure we maintain accessibility
  expect(link).toHaveAttribute('aria-label', "@monalisa's profile")
})

test('can append text to textarea via imperative handle', async () => {
  const environment = createMockEnvironment()
  const commentComposerRef = createRef<MarkdownComposerRef>()

  render(<IssueCommentComposerTestComponent environment={environment} ref={commentComposerRef} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Issue: () => ({
          id: 'I_id',
          databaseId: 'issueid',
          locked: false,
          viewerCanComment: true,
          viewerCanClose: true,
          viewerCanReopen: true,
          repository: {
            databaseId: 'repoid',
            isArchived: false,
            nameWithOwner: 'owner/repo',
            slashCommandsEnabled: false,
            viewerCanInteract: true,
            viewerInteractionLimitReasonHTML: '',
          },
        }),
      }),
    )
  })

  const commentComposer = screen.getByRole('textbox')
  expect(commentComposer).toHaveValue('')

  act(() => {
    commentComposerRef.current?.appendText('appended text')
  })

  expect(commentComposer).toHaveValue('\n\nappended text')
})

test('can focus textarea via imperative handle', async () => {
  const environment = createMockEnvironment()
  const commentComposerRef = createRef<MarkdownComposerRef>()

  render(<IssueCommentComposerTestComponent environment={environment} ref={commentComposerRef} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Issue: () => ({
          id: 'I_id',
          databaseId: 'issueid',
          locked: false,
          viewerCanComment: true,
          viewerCanClose: true,
          viewerCanReopen: true,
          repository: {
            databaseId: 'repoid',
            isArchived: false,
            nameWithOwner: 'owner/repo',
            slashCommandsEnabled: false,
            viewerCanInteract: true,
            viewerInteractionLimitReasonHTML: '',
          },
        }),
      }),
    )
  })

  const commentComposer = screen.getByRole('textbox')
  expect(commentComposer).not.toHaveFocus()

  act(() => {
    commentComposerRef.current?.focus()
  })

  expect(commentComposer).toHaveFocus()
})

test('Cant add comment when there is an SAML error', async () => {
  const environment = createMockEnvironment()
  const commentComposerRef = createRef<MarkdownComposerRef>()

  render(<IssueCommentComposerTestComponent environment={environment} ref={commentComposerRef} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Issue: () => ({
          id: 'I_id',
          databaseId: 'issueid',
          locked: false,
          viewerCanComment: true,
          viewerCanClose: true,
          viewerCanReopen: true,
          repository: {
            databaseId: 'repoid',
            isArchived: false,
            nameWithOwner: 'owner/repo',
            slashCommandsEnabled: false,
            viewerCanInteract: true,
            viewerInteractionLimitReasonHTML: '',
          },
        }),
      }),
    )
  })

  const commentComposer = screen.getByRole('textbox')
  fireEvent.change(commentComposer, {target: {value: '123'}})

  const submitButton = screen.getByRole('button', {name: /Comment/i})
  fireEvent.click(submitButton)

  act(() => {
    environment.mock.resolveMostRecentOperation(() => {
      const error = {
        data: {
          addComment: null,
        },
        errors: [
          {
            type: 'FORBIDDEN',
            path: ['addComment'],
            extensions: {
              saml_failure: false,
            },
            locations: [
              {
                line: 4,
                column: 3,
              },
            ],
            message: 'SAML error',
          },
        ],
      }

      return error
    })
  })

  const toastContainer = screen.getByTestId('ui-app-toast-error')
  expect(toastContainer).toBeInTheDocument()
  expect(toastContainer).toHaveTextContent(ERRORS.couldNotComment)
})

test('Can close with comment', async () => {
  const environment = createMockEnvironment()
  const commentComposerRef = createRef<MarkdownComposerRef>()

  render(<IssueCommentComposerTestComponent environment={environment} ref={commentComposerRef} />)

  await act(async () => {
    environment.mock.resolveMostRecentOperation(operation =>
      MockPayloadGenerator.generate(operation, {
        Issue: () => ({
          id: 'I_id',
          databaseId: 'issueid',
          locked: false,
          viewerCanComment: true,
          viewerCanClose: true,
          viewerCanReopen: true,
          state: 'OPEN',
          repository: {
            databaseId: 'repoid',
            isArchived: false,
            nameWithOwner: 'owner/repo',
            slashCommandsEnabled: false,
            viewerCanInteract: true,
            viewerInteractionLimitReasonHTML: '',
          },
        }),
      }),
    )
  })

  const commentComposer = screen.getByRole('textbox')
  fireEvent.change(commentComposer, {target: {value: '123'}})

  // Clicking with meta+shift does not incur multiple updateIssueStateMutationCloseMutation
  fireEvent.keyDown(window, {metaKey: true, shiftKey: true})
  fireEvent.click(screen.getByRole('button', {name: /Close with comment/i}))

  expect(commentComposer).toHaveValue('123')
  act(() => {
    environment.mock.resolveMostRecentOperation(operation => {
      return MockPayloadGenerator.generate(operation, {
        Issue() {
          return {
            id: 'I_id',
            state: 'CLOSED',
            stateReason: 'COMPLETED',
            viewerCanReopen: true,
          }
        },
      })
    })
  })

  const recentOperation = environment.mock.getMostRecentOperation()
  expect(recentOperation.fragment.node.name).toBe('addCommentMutation')

  expect(screen.getByRole('button', {name: /Reopen Issue/i})).toBeInTheDocument()
})

describe('viewer interaction ban', () => {
  test('Cannot add comment if the user has an interaction ban', async () => {
    const environment = createMockEnvironment()
    const commentComposerRef = createRef<MarkdownComposerRef>()

    render(<IssueCommentComposerTestComponent environment={environment} ref={commentComposerRef} />)

    await act(async () => {
      environment.mock.resolveMostRecentOperation(operation =>
        MockPayloadGenerator.generate(operation, {
          Issue: () => ({
            id: 'I_id',
            databaseId: 'issueid',
            locked: false,
            viewerCanComment: true,
            viewerCanClose: true,
            viewerCanReopen: true,
            repository: {
              databaseId: 'repoid',
              isArchived: false,
              nameWithOwner: 'owner/repo',
              slashCommandsEnabled: false,
              viewerCanInteract: false,
              viewerInteractionLimitReasonHTML: 'Interaction unavailable',
            },
          }),
        }),
      )
    })

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText(/Interaction unavailable/)).toBeInTheDocument()
  })
})

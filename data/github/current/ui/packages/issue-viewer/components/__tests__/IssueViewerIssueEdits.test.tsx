import {act, fireEvent, screen, waitFor, within} from '@testing-library/react'
import type {OperationDescriptor} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'

import {HOTKEYS} from '../../constants/hotkeys'
import {TEST_IDS} from '../../constants/test-ids'
import {setupMockEnvironment} from '../../test-utils/components/IssueViewerTestComponent'
import {VALIDATORS} from '@github-ui/entity-validators'

jest.mock('@github-ui/use-safe-storage/session-storage', () => ({
  useSessionStorage: () => ['', jest.fn()],
}))

const mockUseFeatureFlags = jest.fn()
jest.mock('@github-ui/react-core/use-feature-flag', () => {
  const originalModule = jest.requireActual('@github-ui/react-core/use-feature-flag')
  return {
    ...originalModule,
    useFeatureFlags: () => mockUseFeatureFlags(),
  }
})

jest.setTimeout(35_000)
jest.mock('@github-ui/react-core/use-app-payload')

beforeAll(async () => {
  // preload the ReactionViewer component because it is lazily rendered inside IssueBodyViewer
  await import('@github-ui/reaction-viewer/ReactionViewer')
})

beforeEach(() => {
  mockUseFeatureFlags.mockReturnValue({})
})

describe('edit issue', () => {
  test('open issue title edit, close issue edit', async () => {
    const {container} = await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
          }
        },
        Actor() {
          return {
            id: 'monalisa-id-1',
            login: 'monalisa',
            avatarUrl: '',
          }
        },
      },
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
            title: 'test title',
          }
        },
      },
    })

    // Check that the issue viewer is rendered, but not the edit components
    // -------------------------------

    // Check that issue viewer is loaded
    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()
    // Check that the title input box isn't rendered
    expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull()
    // Check that the body input box isn't rendered
    expect(
      within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
    ).toBeNull()
    // Check that the edit issue title button is loaded
    // (select first element since we expect multiple buttons to be rendered for responsive behaviour)
    const editIssueTitleButton = screen.getAllByTestId(TEST_IDS.editIssueTitleButton)[0]!
    expect(editIssueTitleButton).toBeInTheDocument()
    // -------------------------------

    // Click the edit issue hotkey and check that the edit components are rendered
    // -------------------------------

    // Clicking the button to start title edit
    fireEvent.click(editIssueTitleButton)

    // Check that the title input box is rendered
    expect(screen.getByTestId(TEST_IDS.issueTitleInput)).toBeInTheDocument()

    // Check that the edit issue button is not rendered
    expect(screen.queryByTestId(TEST_IDS.editIssueTitleButton)).toBeNull()
    // -------------------------------

    // Click the close edit hotkey and check that the edit components are not rendered
    // -------------------------------
    // Clicking the hotkey to close the issue editor
    expect(container).not.toBeNull()
    fireEvent.keyDown(container, {key: HOTKEYS.closeEdit, bubbles: true})

    // Check that the title input box is not rendered
    expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull()
    // Check that the body input box is not rendered
    expect(
      within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
    ).toBeNull()
    // Check that the edit issue button is rendered
    await act(async () => {
      expect(screen.getAllByTestId(TEST_IDS.editIssueTitleButton).length).toBeGreaterThan(0)
    })
    // -------------------------------
  })

  test('open issue edit, make changes to title, save', async () => {
    const {environment} = await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
          }
        },
        Actor() {
          return {
            id: 'monalisa-id-1',
            login: 'monalisa',
            avatarUrl: '',
          }
        },
      },
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
          }
        },
      },
    })

    // Check that the issue viewer is rendered, but not the edit components
    // -------------------------------

    // Check that issue viewer is loaded
    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()
    // Check that the title input box isn't rendered
    expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull()
    // Check that the body input box isn't rendered
    expect(
      within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
    ).toBeNull()
    // Check that the edit issue title button is loaded
    const editIssueTitleButton = screen.getAllByTestId(TEST_IDS.editIssueTitleButton)[0]!
    expect(editIssueTitleButton).toBeInTheDocument()
    // -------------------------------

    // Click the edit issue hotkey and check that the edit components are rendered
    // -------------------------------

    // Clicking the button to start title edit
    fireEvent.click(editIssueTitleButton)

    // Check that the title input box is rendered
    expect(screen.getByTestId(TEST_IDS.issueTitleInput)).toBeInTheDocument()

    // Check that the edit issue button is not rendered
    expect(screen.queryByTestId(TEST_IDS.editIssueTitleButton)).toBeNull()
    // -------------------------------

    // Make changes to the issue title, click the save hotkey
    // -------------------------------

    // Change the issue title
    const titleInput = screen.getByTestId(TEST_IDS.issueTitleInput)
    fireEvent.change(titleInput, {target: {value: 'new title'}})

    // Trigger the hotkey to save changes
    fireEvent.keyDown(titleInput, {key: HOTKEYS.commitEdit, bubbles: true})

    expect(titleInput).toBeDisabled()

    // Check that a mutation call was called with the new title
    const operation = environment.mock.getMostRecentOperation()
    expect(operation.fragment.node.name).toBe('updateIssueTitleMutation')
    expect(operation.request.identifier).toMatch(/"title":"new title"/)

    // Act as if the mutation has been performed
    act(() => {
      environment.mock.resolveMostRecentOperation((x: OperationDescriptor) => {
        return MockPayloadGenerator.generate(x, {
          UpdateIssuePayload() {
            return {
              issue: {
                author: {
                  login: 'author',
                  id: 'author-id-123',
                },
                body: 'test body',
                id: 'testid',
              },
            }
          },
        })
      })
    })
    // Check that the discard changes confirmation dialog is not rendered
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())

    // Check that the title input box is not rendered
    await waitFor(() => expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull())

    // Check that the body input box is not rendered
    await waitFor(() =>
      expect(
        within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
      ).toBeNull(),
    )
    // -------------------------------
  })

  test('edit title, clear title, save with hotkey, see validation error', async () => {
    mockUseFeatureFlags.mockReturnValue({issues_react_ui_commands_migration: true})
    const {environment, user} = await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
            title: "I'm a title",
            name: 'name',
          }
        },
        Actor() {
          return {
            id: 'monalisa-id-1',
            login: 'monalisa',
            avatarUrl: '',
          }
        },
      },
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
          }
        },
      },
    })

    // Check that the issue viewer is rendered, but not the edit components
    // -------------------------------

    // Check that issue viewer is loaded
    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()
    // Check that the title input box isn't rendered
    expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull()
    // Check that the body input box isn't rendered
    expect(
      within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
    ).toBeNull()
    // Check that the edit issue title button is loaded
    const editIssueTitleButton = screen.getAllByTestId(TEST_IDS.editIssueTitleButton)[0]!
    expect(editIssueTitleButton).toBeInTheDocument()
    // -------------------------------

    // Click the edit issue hotkey and check that the edit components are rendered
    // -------------------------------

    // Clicking the button to start title edit
    await user.click(editIssueTitleButton)

    // Check that the title input box is rendered
    expect(screen.getByTestId(TEST_IDS.issueTitleInput)).toBeInTheDocument()

    // Check that the edit issue button is not rendered
    expect(screen.queryByTestId(TEST_IDS.editIssueTitleButton)).toBeNull()
    // -------------------------------

    // Make changes to the issue title, click the save hotkey
    // -------------------------------

    // Delete the issue title
    const titleInput = screen.getByTestId(TEST_IDS.issueTitleInput)
    await user.type(titleInput, '{backspace}{enter}', {initialSelectionStart: 0, initialSelectionEnd: 30})

    // we're not submitting, so the input should still be enabled
    expect(titleInput).toBeEnabled()

    // Check that a mutation call was not called
    const operation = environment.mock.getMostRecentOperation()
    expect(operation.fragment.node.name).not.toBe('updateIssueTitleMutation')

    // Check that the validation error is rendered
    expect(screen.getByText(VALIDATORS.titleCanNotBeEmpty)).toBeInTheDocument()
  })

  test('open issue body edit, make changes to body, save', async () => {
    const {environment, user} = await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            viewerCanDelete: true,
            body: 'test body',
            id: 'issue-testid-1',
          }
        },
        Actor() {
          return {
            id: 'monalisa-id-1',
            login: 'monalisa',
            avatarUrl: '',
          }
        },
      },
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            id: 'issue-testid-1',
          }
        },
      },
    })

    // Check that the issue viewer is rendered, but not the edit components
    // -------------------------------

    // Check that issue viewer is loaded
    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()
    // Check that the title input box isn't rendered
    expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull()
    // Check that the body input box isn't rendered
    expect(
      within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
    ).toBeNull()

    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })
    const issueBodyActionsMenu = screen.getByRole('menu', {
      name: (accessibleName, element) => accessibleName === 'Issue body actions' && element.nodeName === 'UL',
    })
    expect(issueBodyActionsMenu).toBeInTheDocument()
    const editIssueBodyButton = within(issueBodyActionsMenu).getByText('Edit')
    expect(editIssueBodyButton).toBeInTheDocument()

    // Open the issue body editor
    fireEvent.click(editIssueBodyButton)
    const mdEditor = within(screen.getByTestId(TEST_IDS.issueBody)).getByTestId(TEST_IDS.commentBox('body'))
    // -------------------------------

    // Make changes to the issue body, click the save hotkey
    // -------------------------------

    // Change the issue body
    const descriptionTextArea = screen.getByPlaceholderText('Type your description here…')
    expect(descriptionTextArea).toHaveValue('test body')
    await user.type(descriptionTextArea, ' new body')

    const newBody = 'test body new body'
    expect(descriptionTextArea).toHaveValue(newBody)

    const saveButton = within(mdEditor).getByRole('button', {name: 'Save'})
    await user.click(saveButton)

    // Act as if the mutation has been performed
    act(() => {
      environment.mock.resolveMostRecentOperation((x: OperationDescriptor) => {
        expect(x.fragment.node.name).toBe('updateIssueBodyMutation')

        return MockPayloadGenerator.generate(x, {
          UpdateIssuePayload() {
            return {
              issue: {
                id: 'issue-testid-1',
                viewerCanUpdateNext: true,
                viewerCanDelete: true,
                body: newBody,
                bodyHTML: newBody,
              },
            }
          },
          Actor() {
            return {
              id: 'monalisa-id-1',
              login: 'monalisa',
              avatarUrl: '',
            }
          },
        })
      })
    })

    const mdViewer = within(screen.getByTestId(TEST_IDS.issueBody)).getByTestId(TEST_IDS.markdownBody)
    expect(mdViewer).toBeInTheDocument()
    expect(mdViewer.textContent).toBe(newBody)

    // Check that the discard changes confirmation dialog is not rendered
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())

    // Check that the title input box is not rendered
    await waitFor(() => expect(screen.queryByTestId(TEST_IDS.issueTitleInput)).toBeNull())
    // Check that the body input box is not rendered
    await waitFor(() =>
      expect(
        within(screen.queryByTestId(TEST_IDS.issueBody) as HTMLElement).queryByTestId(TEST_IDS.commentBox('body')),
      ).toBeNull(),
    )
  })

  test('Issue body edits are not lost when there is an SAML error', async () => {
    const {environment, user} = await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
            viewerCanDelete: true,
            body: 'test body',
          }
        },
        Actor() {
          return {
            id: 'monalisa-id-1',
            login: 'monalisa',
            avatarUrl: '',
          }
        },
      },
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
          }
        },
      },
    })

    // Check that issue viewer is loaded
    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    const issueBodyMenuButton = screen.getByRole('button', {name: 'Issue body actions'})
    expect(issueBodyMenuButton).toBeInTheDocument()
    act(() => {
      issueBodyMenuButton.click()
    })
    const issueBodyActionsMenu = screen.getByRole('menu', {
      name: (accessibleName, element) => accessibleName === 'Issue body actions' && element.nodeName === 'UL',
    })
    expect(issueBodyActionsMenu).toBeInTheDocument()
    const editIssueBodyButton = within(issueBodyActionsMenu).getByText('Edit')
    expect(editIssueBodyButton).toBeInTheDocument()

    // Open the issue body editor
    fireEvent.click(editIssueBodyButton)
    const mdEditor = within(screen.getByTestId(TEST_IDS.issueBody)).getByTestId(TEST_IDS.commentBox('body'))
    // -------------------------------

    // Make changes to the issue body, click the save hotkey
    // -------------------------------

    // Change the issue body
    const descriptionTextArea = screen.getByPlaceholderText('Type your description here…')
    expect(descriptionTextArea).toHaveValue('test body')
    await user.type(descriptionTextArea, ' new body')

    const newBody = 'test body new body'
    expect(descriptionTextArea).toHaveValue(newBody)

    const saveButton = within(mdEditor).getByRole('button', {name: 'Save'})
    await user.click(saveButton)

    act(() => {
      environment.mock.resolveMostRecentOperation(() => {
        const error = {
          data: {
            updateIssue: null,
          },
          errors: [
            {
              type: 'FORBIDDEN',
              path: ['updateIssue'],
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
    expect(toastContainer).toHaveTextContent('Could not update issue body')
    expect(screen.getByPlaceholderText('Type your description here…')).toHaveValue(newBody)
  })
})

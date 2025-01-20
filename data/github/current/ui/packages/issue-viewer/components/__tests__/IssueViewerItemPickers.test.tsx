import {act, screen, within} from '@testing-library/react'

import {LABELS} from '../../constants/labels'
import {TEST_IDS} from '../../constants/test-ids'
import {setupMockEnvironment} from '../../test-utils/components/IssueViewerTestComponent'
import type {OperationDescriptor} from 'relay-runtime'
import {MockPayloadGenerator} from 'relay-test-utils'
import {generateMockPayloadWithDefaults} from '../../test-utils/DefaultWrappers'
import {setupUserEvent} from '@github-ui/react-core/test-utils'

jest.mock('@github-ui/use-safe-storage/session-storage', () => ({
  useSessionStorage: () => ['', jest.fn()],
}))

jest.setTimeout(10_000)
jest.mock('@github-ui/react-core/use-app-payload')

describe('item pickers', () => {
  beforeAll(async () => {
    // preload the ReactionViewer component because it is lazily rendered inside IssueBodyViewer
    await import('@github-ui/reaction-viewer/ReactionViewer')
  })

  test('open assignee picker when pressing A', async () => {
    const user = setupUserEvent()
    const {environment} = await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanAssign: true,
          }
        },
      },
    })

    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('AssigneePickerViewerQuery')
      const payload = generateMockPayloadWithDefaults(operation, {
        User() {
          return {
            login: 'monalisa',
          }
        },
      })
      return payload
    })

    await user.keyboard('a')
    const dialog = within(screen.getByRole('dialog'))

    await act(async () => {
      expect(dialog.getByText('Assign up to 10 people to this issue')).toBeInTheDocument()
      expect(dialog.getByRole('textbox')).toHaveTextContent('')
    })
  })

  test('open label picker when pressing L', async () => {
    const user = setupUserEvent()
    await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanLabel: true,
          }
        },
      },
    })

    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    await user.keyboard('l')
    const dialog = within(screen.getByRole('dialog'))

    expect(dialog.getByText('Apply labels to this issue')).toBeInTheDocument()

    const input = dialog.getByRole('textbox')
    expect(input).toHaveTextContent('')
  })

  test('open milestone picker when pressing M', async () => {
    const user = setupUserEvent()
    await setupMockEnvironment({
      mockOverwrites: {
        Issue() {
          return {
            viewerCanSetMilestone: true,
          }
        },
      },
    })

    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    await user.keyboard('m')

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('Set milestone')).toBeInTheDocument()

    const input = dialog.getByRole('textbox')
    expect(input).toHaveTextContent('')
  })

  test('open project picker when pressing P', async () => {
    const user = setupUserEvent()
    await setupMockEnvironment({
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateMetadata: true,
          }
        },
      },
    })

    const projectContainer = await screen.findByTestId(TEST_IDS.projectsContainer)
    expect(projectContainer).toBeInTheDocument()

    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    await user.keyboard('p')

    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText(LABELS.selectProjects)).toBeInTheDocument()

    const input = dialog.getByRole('textbox')
    expect(input).toHaveTextContent('')
  })

  test('open development picker when pressing D', async () => {
    const user = setupUserEvent()
    const {environment} = await setupMockEnvironment({
      mockSecondaryOverwrites: {
        Issue() {
          return {
            viewerCanUpdateNext: true,
          }
        },
      },
    })

    // Mock cache fetching of the bare minimum content of current repo in DevelopmentPicker
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('DevelopmentPickerQuery')
      return MockPayloadGenerator.generate(operation)
    })

    // Mock the content prefetching of the extra content of current repo
    // and top repositories for RepoPicker in DevelopmentPicker
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('RepositoryPickerCurrentRepoQuery')
      return MockPayloadGenerator.generate(operation)
    })
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      expect(operation.fragment.node.name).toBe('RepositoryPickerTopRepositoriesQuery')
      return MockPayloadGenerator.generate(operation)
    })

    expect(screen.getByTestId(TEST_IDS.issueHeader)).toBeInTheDocument()

    await user.keyboard('d')

    const pickerOverlay = screen.getByRole('dialog')
    const pickerSubtitle = within(pickerOverlay).getByText(LABELS.development.prsBranchesPickerSubtitle, {exact: false})
    expect(pickerSubtitle).toBeVisible()

    const input = within(pickerOverlay).getByRole('textbox')
    expect(input).toHaveTextContent('')
  })
})

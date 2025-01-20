import {render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import type {MemexWorkflowConfiguration, MemexWorkflowPersisted} from '../../../client/api/workflows/contracts'
import {AutomationPage} from '../../../client/components/automation/automation-page'
import useToasts from '../../../client/components/toasts/use-toasts'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {
  useGetFieldIdsFromFilter,
  useLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../client/hooks/use-load-required-fields'
import {statusColumn} from '../../../mocks/data/columns'
import {statusOptions} from '../../../mocks/data/single-select'
import {invalidClosedWorkflowPersisted, invalidClosedWorkflowUncreated} from '../../../mocks/data/workflows'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

jest.mock('../../../client/components/toasts/use-toasts')
jest.mock('../../../client/hooks/use-load-required-fields')

type Workflows = {
  persistedWorkflows?: Array<MemexWorkflowPersisted>
  workflowConfigurations?: Array<MemexWorkflowConfiguration>
}

function createTestEnvironmentForWorkflows(showNewEditor: boolean, workflows?: Workflows) {
  return createTestEnvironment({
    'memex-columns-data': [
      {
        ...statusColumn,
        settings: {
          options: [...statusOptions.filter(option => option.name !== 'Done')],
        },
      },
    ],
    'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
    'memex-workflows-data': workflows?.persistedWorkflows ?? [invalidClosedWorkflowPersisted],
    'memex-workflow-configurations-data': workflows?.workflowConfigurations ?? [invalidClosedWorkflowUncreated],
  })
}

function renderWorkflowView(workflows?: Workflows) {
  createTestEnvironmentForWorkflows(true, workflows)
  render(
    <TestAppContainer>
      <AutomationPage />
    </TestAppContainer>,
  )
}

describe('When there are no workflows', () => {
  beforeAll(() => {
    asMockHook(useToasts).mockReturnValue({
      addToast: jest.fn(),
    })
    asMockHook(useGetFieldIdsFromFilter).mockReturnValue({
      getFieldIdsFromFilter: jest.fn(),
    })
    asMockHook(useLoadRequiredFieldsForViewsAndCurrentView).mockReturnValue([])
  })

  it('renders a text stating that there are no workflows', () => {
    renderWorkflowView({persistedWorkflows: [], workflowConfigurations: []})

    expect(screen.getByText('No workflows')).toBeInTheDocument()
  })
})

describe('When an active workflow with set_field action has its selected status option deleted from memex project', () => {
  beforeAll(() => {
    asMockHook(useToasts).mockReturnValue({
      addToast: jest.fn(),
    })
    asMockHook(useGetFieldIdsFromFilter).mockReturnValue({
      getFieldIdsFromFilter: jest.fn(),
    })
    asMockHook(useLoadRequiredFieldsForViewsAndCurrentView).mockReturnValue([])
  })

  it('renders a dropdown displaying A value is required', () => {
    renderWorkflowView()

    expect(screen.getByTestId('workflow-set-field-anchor')).toHaveTextContent('A value is required')
  })

  it('renders a dropdown with available status options', async () => {
    renderWorkflowView()

    const editButton = screen.getByTestId('workflow-edit-button')
    await userEvent.click(editButton)

    const statusPill = screen.getByTestId('workflow-set-field-anchor')
    await userEvent.click(statusPill)

    const setFieldDropdown = screen.getByTestId('workflow-set-field-panel')
    const options = within(setFieldDropdown).getAllByRole('option')

    expect(setFieldDropdown).toBeInTheDocument()
    expect(options).toHaveLength(3)
    for (const option of options) {
      expect(option).toHaveTextContent(/Backlog|Ready|In Progress/)
    }
  })

  it('disables the workflow toggle', () => {
    renderWorkflowView()

    const workflowToggle = within(screen.getByTestId('workflow-enable-toggle-container')).getByRole('button')
    expect(workflowToggle).toBeDisabled()
  })

  it('disables the save button', async () => {
    renderWorkflowView()

    const editButton = screen.getByTestId('workflow-edit-button')
    await userEvent.click(editButton)

    const saveButton = await screen.findByTestId('workflow-save-button')
    await waitFor(() => expect(saveButton).toBeDisabled())
  })

  it('re-enables the workflow when a new status option is selected and workflow becomes valid again', async () => {
    renderWorkflowView()

    const editButton = screen.getByTestId('workflow-edit-button')
    await userEvent.click(editButton)

    const statusPill = screen.getByTestId('workflow-set-field-anchor')
    await userEvent.click(statusPill)

    const options = within(screen.getByTestId('workflow-set-field-panel')).getAllByRole('option')
    await userEvent.click(options[0])

    const saveButton = screen.getByTestId('workflow-save-button')
    await waitFor(() => expect(saveButton).toBeEnabled())
    await userEvent.click(saveButton)

    await waitFor(() => {
      const workflowToggle = within(screen.getByTestId('workflow-enable-toggle-container')).getByRole('button')
      expect(workflowToggle).toBeEnabled()
    })
  })
})

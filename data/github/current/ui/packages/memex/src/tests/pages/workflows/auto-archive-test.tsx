import {render, screen, waitFor, within} from '@testing-library/react'

import type {MemexWorkflowConfiguration, MemexWorkflowPersisted} from '../../../client/api/workflows/contracts'
import {AutomationPage} from '../../../client/components/automation/automation-page'
import {
  useGetFieldIdsFromFilter,
  useLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../client/hooks/use-load-required-fields'
import {
  autoArchiveItemsWorkflow,
  autoArchiveItemsWorkflowPersisted,
  DefaultWorkflowConfigurations,
  DefaultWorkflowsPersisted,
} from '../../../mocks/data/workflows'
import {asMockHook} from '../../mocks/stub-utilities'
import {mockGetArchiveStatus, mockGetArchiveStatusError} from '../../state-providers/workflows/helpers'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

jest.mock('../../../client/hooks/use-load-required-fields')

type Workflows = {
  persistedWorkflows?: Array<MemexWorkflowPersisted>
  workflowConfigurations?: Array<MemexWorkflowConfiguration>
}

function createTestEnvironmentForWorkflows(showNewEditor: boolean, workflows?: Workflows) {
  return createTestEnvironment({
    'logged-in-user': {
      id: 1,
      login: 'test-user',
      name: 'Test User',
      avatarUrl: 'https://github.com/test-user.png',
      global_relay_id: 'MDQ6VXNl',
      isSpammy: false,
    },
    'memex-workflows-data': workflows?.persistedWorkflows ?? [autoArchiveItemsWorkflowPersisted],
    'memex-workflow-configurations-data': workflows?.workflowConfigurations ?? [autoArchiveItemsWorkflow],
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

describe('Auto-archive Workflow', () => {
  beforeAll(() => {
    asMockHook(useGetFieldIdsFromFilter).mockReturnValue({
      getFieldIdsFromFilter: jest.fn(),
    })
    asMockHook(useLoadRequiredFieldsForViewsAndCurrentView).mockReturnValue([])
  })

  it('renders a flash message when the auto-archive workflow is active and archive is full', async () => {
    renderWorkflowView()
    mockGetArchiveStatus()

    expect(await screen.findByTestId('archive-full-warning')).toBeInTheDocument()
  })

  it('does not render a flash message when the auto-archive workflow is active but archive is not full', () => {
    renderWorkflowView()
    mockGetArchiveStatus({totalCount: 0, isArchiveFull: false})

    expect(screen.queryByTestId('archive-full-warning')).not.toBeInTheDocument()
  })

  it('does not render a flash message when the auto-archive workflow is not active', () => {
    renderWorkflowView({
      persistedWorkflows: DefaultWorkflowsPersisted,
      workflowConfigurations: DefaultWorkflowConfigurations,
    })
    mockGetArchiveStatus()

    expect(screen.queryByTestId('archive-full-warning')).not.toBeInTheDocument()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('disables the auto-archive workflow and the toggle when archive is full', async () => {
    renderWorkflowView({
      persistedWorkflows: [{...autoArchiveItemsWorkflowPersisted, enabled: true}],
      workflowConfigurations: [
        {...autoArchiveItemsWorkflow, defaultWorkflow: {...autoArchiveItemsWorkflow.defaultWorkflow, enabled: true}},
      ],
    })
    mockGetArchiveStatus()

    const workflowToggle = within(screen.getByTestId('workflow-enable-toggle-container')).getByRole('button')

    await waitFor(() => expect(workflowToggle).toBeDisabled())
    await waitFor(() => expect(workflowToggle).not.toBeChecked())
  })

  it('renders the workflow but does not render the archive full warning message when the request fails', () => {
    renderWorkflowView()
    mockGetArchiveStatusError()

    expect(screen.queryByTestId('archive-full-warning')).not.toBeInTheDocument()
    expect(screen.getByTestId('automation-archive-block')).toBeInTheDocument()
  })
})

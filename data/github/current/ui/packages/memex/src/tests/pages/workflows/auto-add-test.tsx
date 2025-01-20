import {act, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {Role} from '../../../client/api/common-contracts'
import type {MemexWorkflowConfiguration, MemexWorkflowPersisted} from '../../../client/api/workflows/contracts'
import {AutomationPage} from '../../../client/components/automation/automation-page'
import {overrideDefaultPrivileges} from '../../../client/helpers/viewer-privileges'
import {
  useGetFieldIdsFromFilter,
  useLoadRequiredFieldsForViewsAndCurrentView,
} from '../../../client/hooks/use-load-required-fields'
import {autoAddItemsWorkflow, autoAddItemsWorkflowPersisted} from '../../../mocks/data/workflows'
import {asMockHook} from '../../mocks/stub-utilities'
import {
  mockCountMatchedRepositoryItems,
  mockCountMatchedRepositoryItemsError,
  mockSuggestedRepositories,
} from '../../state-providers/workflows/helpers'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

jest.mock('../../../client/hooks/use-load-required-fields')

type Workflows = {
  persistedWorkflows?: Array<MemexWorkflowPersisted>
  workflowConfigurations?: Array<MemexWorkflowConfiguration>
}

function createTestEnvironmentForWorkflows(workflows?: Workflows) {
  return createTestEnvironment({
    'logged-in-user': {
      id: 1,
      global_relay_id: 'MDQ6VXNl',
      login: 'test-user',
      name: 'Test User',
      avatarUrl: 'https://github.com/test-user.png',
      isSpammy: false,
    },
    'memex-viewer-privileges': overrideDefaultPrivileges({
      role: Role.Write,
      canChangeProjectVisibility: false,
    }),
    'memex-workflows-data': workflows?.persistedWorkflows ?? [autoAddItemsWorkflowPersisted],
    'memex-workflow-configurations-data': workflows?.workflowConfigurations ?? [autoAddItemsWorkflow],
    'memex-owner': {
      id: 1,
      login: 'github',
      name: 'GitHub',
      avatarUrl: 'https://foo.bar/avatar.png',
      type: 'organization',
    },
  })
}

async function renderWorkflowView() {
  createTestEnvironmentForWorkflows()

  // eslint-disable-next-line testing-library/no-unnecessary-act, @typescript-eslint/require-await
  await act(async () => {
    render(
      <TestAppContainer>
        <AutomationPage />
      </TestAppContainer>,
    )
  })
}

describe('Auto-add Workflow', () => {
  beforeEach(() => {
    asMockHook(useGetFieldIdsFromFilter).mockReturnValue({
      getFieldIdsFromFilter: jest.fn(),
    })
    asMockHook(useLoadRequiredFieldsForViewsAndCurrentView).mockReturnValue([])
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('updates the count and search result url when repository is selected', async () => {
    await renderWorkflowView()
    mockSuggestedRepositories()

    const editButton = await screen.findByTestId('workflow-edit-button')
    await waitFor(() => expect(editButton).toBeEnabled())
    await userEvent.click(editButton)

    const repoSuggestionButton = await screen.findByTestId('repo-suggestions-button')
    await waitFor(() => expect(repoSuggestionButton).toBeEnabled())
    await userEvent.click(repoSuggestionButton)
    const repoList = await screen.findByTestId('repo-picker-repo-list')

    mockCountMatchedRepositoryItems({count: 5})
    await userEvent.click(within(repoList).getAllByRole('option')[1])

    const resultLink = await screen.findByTestId('search-result-link')

    expect(resultLink).toBeInTheDocument()
    await waitFor(() => expect(resultLink).toHaveTextContent('See 5 existing items that match this query'))
    expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent('github/github')

    for (const item of ['-project:github/1', 'is:issue', 'label:bug']) {
      await waitFor(() => {
        expect(resultLink).toHaveAttribute('href', expect.stringContaining(encodeURIComponent(item)))
      })
    }
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('updates the count and search result url when query is changed', async () => {
    await renderWorkflowView()
    mockSuggestedRepositories()
    const editButton = await screen.findByTestId('workflow-edit-button')
    await waitFor(() => expect(editButton).toBeEnabled())
    await userEvent.click(editButton)

    const queryInput = await screen.findByTestId('filter-bar-input')
    await userEvent.clear(queryInput)

    mockCountMatchedRepositoryItems({count: 5})
    await userEvent.type(queryInput, 'is:open')

    const resultLink = await screen.findByTestId('search-result-link')

    expect(resultLink).toBeInTheDocument()
    await waitFor(() => expect(resultLink).toHaveTextContent('See 5 existing items that match this query'))
    await waitFor(() => expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent('github/memex'))
    await waitFor(() =>
      expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent(
        encodeURIComponent('-project:github/2 is:open'),
      ),
    )
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('updates the search result url in accordance with the repo url', async () => {
    await renderWorkflowView()
    mockSuggestedRepositories()

    const editButton = await screen.findByTestId('workflow-edit-button')
    await waitFor(() => expect(editButton).toBeEnabled())
    await userEvent.click(editButton)

    const repoSuggestionButton = await screen.findByTestId('repo-suggestions-button')
    await waitFor(() => expect(repoSuggestionButton).toBeEnabled())
    await userEvent.click(repoSuggestionButton)
    const repoList = await screen.findByTestId('repo-picker-repo-list')

    await userEvent.click(within(repoList).getAllByRole('option')[2])

    const resultLink = await screen.findByTestId('search-result-link')

    expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent('https://github.com/rails/rails')
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('removes `is:issues,pr` from search result url', async () => {
    await renderWorkflowView()
    mockSuggestedRepositories()
    mockCountMatchedRepositoryItems({count: 5})

    const editButton = await screen.findByTestId('workflow-edit-button')
    await waitFor(() => expect(editButton).toBeEnabled())
    await userEvent.click(editButton)

    const queryInput = await screen.findByTestId('filter-bar-input')
    await userEvent.clear(queryInput)
    await userEvent.type(queryInput, 'label:bug is:issues,pr is:open')

    const resultLink = await screen.findByTestId('search-result-link')

    expect(resultLink).toBeInTheDocument()
    expect(resultLink).toHaveTextContent('See 5 existing items that match this query')
    await waitFor(() => expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent('github/memex'))
    await waitFor(() =>
      expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent(
        encodeURIComponent('-project:github/3 label:bug is:open'),
      ),
    )
  })

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('does not crash when countMatchedRepositoryItems errors', async () => {
    await renderWorkflowView()
    mockSuggestedRepositories()
    mockCountMatchedRepositoryItems({count: 5})

    const editButton = await screen.findByTestId('workflow-edit-button')
    await waitFor(() => expect(editButton).toBeEnabled())
    await userEvent.click(editButton)

    const queryInput = await screen.findByTestId('filter-bar-input')

    mockCountMatchedRepositoryItemsError()
    await userEvent.type(queryInput, ' is:open')

    const resultLink = await screen.findByTestId<HTMLAnchorElement>('search-result-link')

    expect(resultLink).toBeInTheDocument()
    expect(resultLink).toHaveTextContent('See 5 existing items that match this query')
    await waitFor(() => expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent('github/memex'))
    await waitFor(() =>
      expect(resultLink.attributes.getNamedItem('href')).toHaveTextContent(
        encodeURIComponent('-project:github/4 is:issue label:bug is:open'),
      ),
    )
  })
})

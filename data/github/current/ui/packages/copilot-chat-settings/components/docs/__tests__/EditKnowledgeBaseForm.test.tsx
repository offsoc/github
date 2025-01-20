import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {EditKnowledgeBase} from '../../../routes/EditKnowledgeBase'
import {getEditKnowledgeBaseFormRoutePayload, getShowKnowledgeBasePayload} from '../../../test-utils/mock-data'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {DIALOG_LABEL} from '../RepoSelectionDialog'
import CopilotChatSettingsService, {
  CopilotChatSettingsServiceContext,
} from '../../../utils/copilot-chat-settings-service'

jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))
jest.setTimeout(15_000)

const mockIsFeatureEnabled = jest.mocked(isFeatureEnabled)

jest.mock('@github-ui/use-repository-items', () => {
  const originalModule = jest.requireActual('@github-ui/use-repository-items')
  const repositories = [
    {
      databaseId: 1,
      id: 'R_1',
      name: 'cool-repo',
      nameWithOwner: 'cool-org/cool-repo',
      owner: {
        login: 'cool-org',
        avatarUrl: '',
      },
      shortDescriptionHTML: 'This is a cool repo',
      isInOrganization: true,
      isPrivate: false,
      isArchived: false,
    },
    {
      databaseId: 2,
      id: 'R_2',
      name: 'bar',
      nameWithOwner: 'foo/bar',
      owner: {
        databaseId: 1,
        login: 'foo',
        avatarUrl: '',
      },
      shortDescriptionHTML: 'This is not a cool repo',
      isInOrganization: true,
      isPrivate: false,
      isArchived: false,
    },
  ]
  return {
    __esModule: true,
    ...originalModule,
    useRepositoryItems: jest.fn().mockReturnValue({repositories, loading: false}),
  }
})

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  const navigateFn = jest.fn()
  return {
    ...originalModule,
    useNavigate: () => navigateFn,
    _routerNavigateFn: navigateFn,
  }
})

jest.mock('../../../utils/copilot-chat-settings-service')

const service = jest.mocked(new CopilotChatSettingsService('', []))

describe('EditKnowledgeBaseForm', () => {
  afterEach(jest.clearAllMocks)

  test('Renders the EditKnowledgeBase route component with pre-filled data', async () => {
    const routePayload = getEditKnowledgeBaseFormRoutePayload()
    const payload = getShowKnowledgeBasePayload()
    payload.docset.sourceRepos = undefined

    service.fetchKnowledgeBase.mockResolvedValue(payload)

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <EditKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(await screen.findByRole('button', {name: 'Update knowledge base'})).toBeInTheDocument()
    const nameInput = screen.getByLabelText('Name*')
    expect(nameInput).toHaveValue('my knowledge base')
    const descriptionInput = screen.getByLabelText('Description')
    expect(descriptionInput).toHaveValue('my knowledge base description')
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('/ Edit my knowledge base')).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Add repositories'})).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: 'Select repositories', level: 2})).toBeInTheDocument()
  })

  test('Submitting the form calls the update endpoint', async () => {
    const routePayload = getEditKnowledgeBaseFormRoutePayload()
    const payload = getShowKnowledgeBasePayload(true)

    service.fetchKnowledgeBase.mockResolvedValue(payload)
    service.updateKnowledgeBase.mockResolvedValue()

    const {user} = render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <EditKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    // check that a repo is already selected
    expect(await screen.findByText('1 repository')).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: 'foo/bar', level: 3})).toBeInTheDocument()

    // select a second repo for the knowledge base
    await user.click(screen.getByRole('button', {name: DIALOG_LABEL}))
    await screen.findByRole('heading', {name: DIALOG_LABEL, level: 1})
    await screen.findByText('cool-org/cool-repo', {exact: false})
    await user.click(screen.getByRole('checkbox', {name: 'Select: cool-org/cool-repo'}))
    await user.click(screen.getByRole('button', {name: 'Apply'}))

    expect(screen.getByText('2 repositories')).toBeInTheDocument()

    // update knowledge base
    const submitButton = screen.getByRole('button', {name: 'Update knowledge base'})
    await user.click(submitButton)

    await act(async () => {
      expect(service.updateKnowledgeBase).toHaveBeenCalled()
    })
  })

  test('Use source repos if exists and feature flag enabled', async () => {
    mockIsFeatureEnabled.mockReturnValue(true)
    const routePayload = getEditKnowledgeBaseFormRoutePayload()
    const payload = getShowKnowledgeBasePayload(true)
    payload.docset.repos = []
    payload.docset.scopingQuery = ''

    service.fetchKnowledgeBase.mockResolvedValue(payload)
    service.updateKnowledgeBase.mockResolvedValue()

    const {user} = render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <EditKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    // check that a repo is already selected
    expect(await screen.findByText('1 repository')).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: 'foo/bar', level: 3})).toBeInTheDocument()

    // select a second repo for the knowledge base
    await user.click(screen.getByRole('button', {name: DIALOG_LABEL}))
    await screen.findByRole('heading', {name: DIALOG_LABEL, level: 1})
    await screen.findByText('cool-org/cool-repo', {exact: false})
    await user.click(screen.getByRole('checkbox', {name: 'Select: cool-org/cool-repo'}))
    await user.click(screen.getByRole('button', {name: 'Apply'}))

    // update knowledge base
    const submitButton = screen.getByRole('button', {name: 'Update knowledge base'})
    await user.click(submitButton)

    await act(async () => {
      expect(service.updateKnowledgeBase).toHaveBeenCalled()
    })
  })

  test('Use scoping query if source repos if exists and feature flag disabled', async () => {
    mockIsFeatureEnabled.mockReturnValue(false)
    const routePayload = getEditKnowledgeBaseFormRoutePayload()
    const payload = getShowKnowledgeBasePayload(true)
    payload.docset.sourceRepos = []

    service.fetchKnowledgeBase.mockResolvedValue(payload)
    service.updateKnowledgeBase.mockResolvedValue()

    const {user} = render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <EditKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    // check that a repo is already selected
    expect(await screen.findByText('1 repository')).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: 'foo/bar', level: 3})).toBeInTheDocument()

    // select a second repo for the knowledge base
    await user.click(screen.getByRole('button', {name: DIALOG_LABEL}))
    await screen.findByRole('heading', {name: DIALOG_LABEL, level: 1})
    await screen.findByText('cool-org/cool-repo', {exact: false})
    await user.click(screen.getByRole('checkbox', {name: 'Select: cool-org/cool-repo'}))
    await user.click(screen.getByRole('button', {name: 'Apply'}))

    // update knowledge base
    const submitButton = screen.getByRole('button', {name: 'Update knowledge base'})
    await user.click(submitButton)

    await act(async () => {
      expect(service.updateKnowledgeBase).toHaveBeenCalled()
    })
  })
})

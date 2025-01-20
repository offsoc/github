import {act, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {NewKnowledgeBase} from '../../../routes/NewKnowledgeBase'
import {getNewKnowledgeBaseFormRoutePayload} from '../../../test-utils/mock-data'
import {DIALOG_LABEL} from '../RepoSelectionDialog'
import CopilotChatSettingsService, {
  CopilotChatSettingsServiceContext,
} from '../../../utils/copilot-chat-settings-service'

const REPO_PICKER_HEADING = 'Select repositories'

jest.mock('../../../utils/copilot-chat-settings-service')

const service = jest.mocked(new CopilotChatSettingsService('', []))
jest.setTimeout(10_000)

jest.mock('@github-ui/use-repository-items', () => {
  const originalModule = jest.requireActual('@github-ui/use-repository-items')
  const repositories = [
    {
      databaseId: 1,
      id: 'R_1',
      name: 'cool-repo',
      nameWithOwner: 'cool-org/cool-repo',
      owner: {
        databaseId: 1,
        login: 'cool-org',
        avatarUrl: '',
      },
      shortDescriptionHTML: 'This is a cool repo',
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

describe('NewKnowledgeBaseForm', () => {
  afterEach(jest.clearAllMocks)

  test('Renders the NewKnowledgeBase route component', async () => {
    const routePayload = getNewKnowledgeBaseFormRoutePayload()

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <NewKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(screen.getByRole('button', {name: 'Create knowledge base'})).toBeInTheDocument()
    const nameInput = screen.getByLabelText('Name*')
    expect(nameInput).toHaveValue('')
    const descriptionInput = screen.getByLabelText('Description')
    expect(descriptionInput).toHaveValue('')
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('/ New')).toBeInTheDocument()

    // blank state for repo picker
    expect(screen.getByRole('button', {name: DIALOG_LABEL})).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: REPO_PICKER_HEADING, level: 2})).toBeInTheDocument()
  })

  test('Submitting the form calls the create endpoint', async () => {
    const routePayload = getNewKnowledgeBaseFormRoutePayload()

    service.createKnowledgeBase.mockResolvedValue(undefined)
    service.validateKnowledgeBaseNameAvailability.mockResolvedValue(true)

    const {user} = render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <NewKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    // blank state for repo picker
    expect(screen.getByRole('button', {name: DIALOG_LABEL})).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: REPO_PICKER_HEADING, level: 2})).toBeInTheDocument()

    // set name
    const nameInput = screen.getByLabelText('Name*')
    await user.type(nameInput, 'kbkb')

    await screen.findByText('Available!')
    expect(service.validateKnowledgeBaseNameAvailability).toHaveBeenCalledTimes(1)

    // Select a repo for the knowledge base
    await user.click(screen.getByRole('button', {name: DIALOG_LABEL}))
    await screen.findByRole('heading', {name: DIALOG_LABEL, level: 1})
    await screen.findByText('cool-org/cool-repo', {exact: false})
    await user.click(screen.getByRole('checkbox', {name: 'Select: cool-org/cool-repo'}))
    await user.click(screen.getByRole('button', {name: 'Apply'}))

    expect(screen.getByText('1 repository')).toBeInTheDocument()

    // create knowledge base
    const submitButton = screen.getByRole('button', {name: 'Create knowledge base'})
    await user.click(submitButton)

    await act(async () => {
      expect(service.createKnowledgeBase).toHaveBeenCalled()
    })
  })

  test('renders error message when create endpoint fails', async () => {
    const routePayload = getNewKnowledgeBaseFormRoutePayload()

    service.createKnowledgeBase.mockResolvedValue('asplode')
    service.validateKnowledgeBaseNameAvailability.mockResolvedValue(true)

    const {user} = render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <NewKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    // blank state for repo picker
    expect(screen.getByRole('button', {name: DIALOG_LABEL})).toBeInTheDocument()
    expect(screen.getByRole('heading', {name: REPO_PICKER_HEADING, level: 2})).toBeInTheDocument()

    // set name
    const nameInput = screen.getByLabelText('Name*')
    await user.type(nameInput, 'kbkb')
    await screen.findByText('Available!')
    expect(service.validateKnowledgeBaseNameAvailability).toHaveBeenCalledTimes(1)

    // Select a repo for the knowledge base
    await user.click(screen.getByRole('button', {name: DIALOG_LABEL}))
    await screen.findByRole('heading', {name: DIALOG_LABEL, level: 1})
    await screen.findByText('cool-org/cool-repo', {exact: false})
    await user.click(screen.getByRole('checkbox', {name: 'Select: cool-org/cool-repo'}))
    await user.click(screen.getByRole('button', {name: 'Apply'}))

    expect(screen.getByText('1 repository')).toBeInTheDocument()

    // create knowledge base
    const submitButton = screen.getByRole('button', {name: 'Create knowledge base'})
    await user.click(submitButton)

    expect(await screen.findByText('asplode')).toBeInTheDocument()
  })
})

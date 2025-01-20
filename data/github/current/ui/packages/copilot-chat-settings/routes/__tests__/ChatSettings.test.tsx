import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ChatSettings} from '../ChatSettings'
import {getChatSettingsRoutePayload, getKnowledgeBase} from '../../test-utils/mock-data'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import CopilotChatSettingsService, {CopilotChatSettingsServiceContext} from '../../utils/copilot-chat-settings-service'

jest.mock('../../utils/copilot-chat-settings-service')
jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))

const mockIsFeatureEnabled = jest.mocked(isFeatureEnabled)
const service = jest.mocked(new CopilotChatSettingsService('', []))

describe('ChatSettings', () => {
  afterEach(jest.clearAllMocks)

  test('Renders the ChatSettings', async () => {
    const routePayload = getChatSettingsRoutePayload()
    service.fetchKnowledgeBases.mockResolvedValue([])

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <ChatSettings />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(await screen.findByText('New knowledge base')).toBeInTheDocument()
  })

  test('Renders the repos', async () => {
    const routePayload = getChatSettingsRoutePayload()
    const kb = getKnowledgeBase()
    kb.repos = ['github/github', 'github/thehub']
    kb.sourceRepos = undefined
    service.fetchKnowledgeBases.mockResolvedValue([kb])

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <ChatSettings />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(await screen.findByText('2 repositories')).toBeInTheDocument()
  })

  test('Renders source repos field if repo has sourceRepos', async () => {
    mockIsFeatureEnabled.mockReturnValue(true)

    const routePayload = getChatSettingsRoutePayload()
    const kb = getKnowledgeBase()
    kb.sourceRepos = [
      {
        id: 1,
        ownerID: kb.ownerID,
        paths: [],
      },
      {
        id: 2,
        ownerID: kb.ownerID,
        paths: [],
      },
    ]
    service.fetchKnowledgeBases.mockResolvedValue([kb])

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <ChatSettings />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(await screen.findByText(`2 repositories`)).toBeInTheDocument()
  })

  test('Renders repos field if repo does not have sourceRepos', async () => {
    mockIsFeatureEnabled.mockReturnValue(true)

    const routePayload = getChatSettingsRoutePayload()
    const kb = getKnowledgeBase()
    kb.sourceRepos = undefined
    kb.repos = ['github/github']

    service.fetchKnowledgeBases.mockResolvedValue([kb])

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <ChatSettings />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(await screen.findByText('1 repository')).toBeInTheDocument()
  })
})

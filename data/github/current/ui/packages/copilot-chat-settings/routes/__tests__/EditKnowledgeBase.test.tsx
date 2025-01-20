import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {getEditKnowledgeBaseFormRoutePayload, getShowKnowledgeBasePayload} from '../../test-utils/mock-data'
import CopilotChatSettingsService, {CopilotChatSettingsServiceContext} from '../../utils/copilot-chat-settings-service'
import {EditKnowledgeBase} from '../EditKnowledgeBase'

jest.mock('../../utils/copilot-chat-settings-service')

const service = jest.mocked(new CopilotChatSettingsService('', []))

describe('EditKnowledgeBase', () => {
  afterEach(jest.clearAllMocks)

  test('Renders the EditKnowledgeBase', async () => {
    const routePayload = getEditKnowledgeBaseFormRoutePayload()
    const payload = getShowKnowledgeBasePayload()

    service.fetchKnowledgeBase.mockResolvedValue(payload)

    render(
      <CopilotChatSettingsServiceContext.Provider value={service}>
        <EditKnowledgeBase />
      </CopilotChatSettingsServiceContext.Provider>,
      {routePayload},
    )

    expect(await screen.findByText('Update knowledge base')).toBeInTheDocument()
  })
})

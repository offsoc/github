import {CopilotAuthTokenProvider} from '@github-ui/copilot-auth-token'
import {AuthToken} from '@github-ui/copilot-auth-token/auth-token'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

import {CopilotChatService} from '../copilot-chat-service'
import {getCopilotExperiments} from '../experiments'

jest.mock('@github-ui/verified-fetch')
jest.mock('@github-ui/copilot-chat/utils/copilot-local-storage')
jest.mock('../experiments')

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock
const mockExperiments = getCopilotExperiments as jest.Mock

class TestCopilotChatService extends CopilotChatService {
  constructor() {
    super('http://localhost', [])

    this.copilotAuthTokenProvider = new CopilotAuthTokenProvider([])
  }

  testGetAuthToken() {
    return this.copilotAuthTokenProvider.getAuthToken()
  }

  testDotcomRequest() {
    return this.makeDotcomRequest('/test', 'GET')
  }
}

function mockCachedToken() {
  jest
    .spyOn(CopilotAuthTokenProvider.prototype, 'getLocalStorageAuthToken')
    .mockReturnValue(new AuthToken('buttercakes', 'no expiry', []))
}

function mockResponse(resp: unknown) {
  mockVerifiedFetchJSON.mockResolvedValue({
    ok: true,
    json: () => resp,
  })
}

describe('CopilotChatService', () => {
  afterEach(jest.resetAllMocks)

  describe('#getAuthToken', () => {
    it('returns a cached token', async () => {
      mockCachedToken()

      const service = new TestCopilotChatService()

      const token = await service.testGetAuthToken()

      expect(token.value).toEqual('buttercakes')
    })

    it('fetches a new token', async () => {
      mockResponse({
        token: 'something else',
        expiration: 'whenever',
      })

      const service = new TestCopilotChatService()

      const token = await service.testGetAuthToken()

      expect(token.value).toEqual('something else')
      expect(token.expiration).toEqual('whenever')
    })
  })

  describe('#makeDotcomRequest', () => {
    beforeEach(() => {
      mockResponse({docsets: []})
      mockExperiments.mockReturnValue(['no_value', 'with_value=123'])
    })

    it('does not send the X-Copilot-Api-Token header by default', async () => {
      const service = new TestCopilotChatService()

      await service.testDotcomRequest()

      expect(mockVerifiedFetchJSON.mock.lastCall[1].headers['X-Copilot-Api-Token']).toBeUndefined()
    })

    it('sends the X-Copilot-Api-Token header when the feature is enabled', async () => {
      mockCachedToken()

      const service = new TestCopilotChatService()

      const docsets = await service.listDocsets()

      expect(docsets).toBeDefined()
      expect(mockVerifiedFetchJSON.mock.lastCall[1].headers['X-Copilot-Api-Token']).toEqual('buttercakes')
    })

    it('sends experiment headers with dashified keys', async () => {
      mockExperiments.mockReturnValue(['no_value', 'with_some_value=123'])

      const service = new TestCopilotChatService()
      await service.testDotcomRequest()

      expect(mockVerifiedFetchJSON.mock.lastCall[1].headers['X-Experiment-no-value']).toEqual('1')
      expect(mockVerifiedFetchJSON.mock.lastCall[1].headers['X-Experiment-with-some-value']).toEqual('123')
    })
  })
})

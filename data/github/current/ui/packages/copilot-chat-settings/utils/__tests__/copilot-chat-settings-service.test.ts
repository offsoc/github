import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import CopilotChatSettingsService from '../copilot-chat-settings-service'
import {AuthToken} from '@github-ui/copilot-auth-token/auth-token'
import type {FailedAPIResult} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {ERRORS} from '@github-ui/copilot-chat/utils/copilot-chat-service'
import {CopilotAuthTokenProvider} from '@github-ui/copilot-auth-token'

jest.mock('@github-ui/verified-fetch', () => ({
  verifiedFetchJSON: jest.fn(),
}))
jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))

const mockVerifiedFetchJSON = verifiedFetchJSON as jest.Mock

afterEach(jest.clearAllMocks)

class Service extends CopilotChatSettingsService {
  doRequest(path: string, method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT', body?: object) {
    return this.makeDotcomRequest(path, method, body)
  }
}

describe('CopilotChatSettingsService', () => {
  describe('#makeDotcomRequest', () => {
    test('sets X-Copilot-Api-Token header', async () => {
      const provider = new CopilotAuthTokenProvider([])
      provider.setLocalStorageAuthToken(new AuthToken('buttercakes', 'whenever', []))
      mockVerifiedFetchJSON.mockResolvedValue({
        ok: true,
        json: () => ({}),
      })

      const service = new Service('', [])
      const response = await service.doRequest('/', 'GET')

      expect(response.ok).toBeTruthy()
      expect(mockVerifiedFetchJSON).toHaveBeenCalledWith('/', {
        method: 'GET',
        headers: {'X-Copilot-Api-Token': 'buttercakes'},
      })
    })

    test('uses default error message', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        ok: false,
        status: 9999,
        json: () => {
          throw new TypeError('kaboom')
        },
      })

      const service = new Service('', [])
      const response = await service.doRequest('/', 'GET')

      expect(response.ok).toBeFalsy()
      expect((response as FailedAPIResult).error).toEqual(service.ERROR_MSG)
    })

    test('uses status code error messages', async () => {
      mockVerifiedFetchJSON.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => {
          throw new TypeError('kaboom')
        },
      })

      const service = new Service('', [])
      const response = await service.doRequest('/', 'GET')

      expect(response.ok).toBeFalsy()
      expect((response as FailedAPIResult).error).toEqual(ERRORS[404])
    })

    test('uses supplied error messages', async () => {
      const expectedError = 'Exceeded maximum of 25 knowledge bases'
      const notShownError = 'Not shown'
      mockVerifiedFetchJSON.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => ({
          errors: [{detail: expectedError}, {detail: notShownError}],
        }),
      })

      const service = new Service('', [])
      const response = await service.doRequest('/', 'GET')

      expect(response.ok).toBeFalsy()
      expect((response as FailedAPIResult).error).toEqual(expectedError)
    })
  })
})

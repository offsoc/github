import {AuthToken, type AuthTokenResult, type SerializedAuthToken} from './auth-token'
import safeStorage from '@github-ui/safe-storage'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

const COPILOT_AUTH_TOKEN_KEY = 'COPILOT_AUTH_TOKEN'
export class CopilotAuthTokenProvider {
  ssoOrgIDs: string[]
  currentAuthTokenRequest: Promise<AuthToken> | null
  copilotLocalStorage: {
    getItem: (key: string, now?: number) => string | null
    setItem: (key: string, value: string, now?: number) => void
  }

  constructor(ssoOrgIDs: string[]) {
    this.ssoOrgIDs = ssoOrgIDs
    this.currentAuthTokenRequest = null
    this.copilotLocalStorage = safeStorage('localStorage', {
      throwQuotaErrorsOnSet: false,
      ttl: 1000 * 60 * 60 * 24,
    })
  }

  /**
   * Get the current auth token, either from local storage or by minting a new one from dotcom.
   */
  async getAuthToken(): Promise<AuthToken> {
    const token = this.getLocalStorageAuthToken()

    return token ? this.validateAuthToken(token) : this.fetchAuthToken()
  }

  setLocalStorageAuthToken(token: AuthToken) {
    this.copilotLocalStorage.setItem(COPILOT_AUTH_TOKEN_KEY, JSON.stringify(token.serialize()))
  }

  getLocalStorageAuthToken(): AuthToken | null {
    const value = this.copilotLocalStorage.getItem(COPILOT_AUTH_TOKEN_KEY)

    return value ? AuthToken.deserialize(JSON.parse(value) as SerializedAuthToken) : null
  }

  /**
   * Validate the given auth token.  If it's all good, return it, otherwise, go mint a new one from
   * dotcom and return it instead.
   */
  private async validateAuthToken(token: AuthToken): Promise<AuthToken> {
    return token.needsRefreshing(this.ssoOrgIDs) ? this.fetchAuthToken() : token
  }

  /**
   * Return the current auth token request, or start a new one.
   *
   * The inner workings of the chat app can cause multiple requests to CAPI in quick succession.  If we
   * do not have an auth token available in local storage, each of those requests will trigger their own
   * token fetch, hence the storing of the current request on `this`.
   */
  private fetchAuthToken(): Promise<AuthToken> {
    if (!this.currentAuthTokenRequest) {
      this.currentAuthTokenRequest = this._fetchAuthToken()
    }

    return this.currentAuthTokenRequest
  }

  /**
   * Start a new auth token request, parsing the result, persisting it in local storage,
   * and clearing the current request once finished.
   */
  private async _fetchAuthToken(): Promise<AuthToken> {
    const response = await verifiedFetchJSON('/github-copilot/chat/token', {method: 'POST'})

    if (response.ok) {
      const result = (await response.json()) as AuthTokenResult
      this.currentAuthTokenRequest = null

      const token = AuthToken.fromResult(result, this.ssoOrgIDs)

      this.setLocalStorageAuthToken(token)

      return token
    } else {
      this.currentAuthTokenRequest = null

      throw new Error('Failed to mint new auth token')
    }
  }
}

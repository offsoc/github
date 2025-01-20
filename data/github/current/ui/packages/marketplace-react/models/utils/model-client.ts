import safeStorage from '@github-ui/safe-storage'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {AuthToken} from './auth-token'
import type {AuthTokenResult} from './auth-token'
import type {Model, PlaygroundAPIMessage, PlaygroundAPIMessageAuthor} from '../../types'
import {MessageStreamer} from './streamer'
import {
  TooManyRequestsError,
  PlaygroundChatRequestSent,
  PlaygroundChatRequestStreamingStarted,
  PlaygroundChatRequestStreamingCompleted,
  PlaygroundChatRateLimited,
  ContentErrorResponseError,
  TokenLimitReachedResponseError,
} from './playground-types'
import {sendEvent} from '@github-ui/hydro-analytics'
import {sendStats} from '@github-ui/stats'

export type PlaygroundMessage = {
  timestamp: Date
  message: string
  role: PlaygroundAPIMessageAuthor
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type PlaygroundRequestParameters = Record<string, any>

type SendMessageCallback = (message: PlaygroundMessage) => void

export interface ModelClient {
  sendMessage(
    model: Model,
    messages: PlaygroundMessage[],
    parameters: PlaygroundRequestParameters,
    systemPrompt: string | null,
    callback: SendMessageCallback,
  ): Promise<boolean>
}

export class AzureModelClient implements ModelClient {
  url: string
  currentAuthTokenRequest: Promise<AuthToken> | null
  authTokenLocalStorageKey: string = 'NEUTRON_AUTH_TOKEN'
  authTokenLocalStorageOverwriteKey: string = 'NEUTRON_AUTH_TOKEN_OVERWRITE'
  streamer: MessageStreamer | null = null

  constructor(url: string) {
    this.url = url
    this.currentAuthTokenRequest = null
  }

  async sendMessage(
    model: Model,
    messages: PlaygroundMessage[],
    parameters: PlaygroundRequestParameters,
    systemPrompt: string | null,
    callback: SendMessageCallback,
  ): Promise<boolean> {
    const res = await this.makeRequest(model, messages, parameters, systemPrompt)
    this.emitChatRequestSent(res, model)
    if (!res.ok) {
      switch (res.status) {
        case 413:
          throw new TokenLimitReachedResponseError()

        case 429: {
          this.emitRateLimitedEvent(res, model)
          const timeLeft = res.headers.get('retry-after')
          const errorMessage = timeLeft
            ? `Rate limited, please try again in ${timeLeft} seconds.`
            : 'Rate limited, please try again later.'
          throw new TooManyRequestsError(errorMessage)
        }
        default: {
          // No special handling, lets check if the response is JSON and has more info

          let errorMessage = null
          try {
            const json = await res.json()
            errorMessage = json?.error?.message
          } catch {
            // Response was no JSON, so show a generic error
            throw new Error('An error occurred while processing your request.')
          }
          if (typeof errorMessage === 'string') {
            throw new ContentErrorResponseError(errorMessage)
          } else {
            throw new Error('An error occurred while processing your request.')
          }
        }
      }
    }
    const reader = res.body?.getReader()
    if (!reader) {
      return false
    }

    this.streamer = new MessageStreamer(reader)

    this.emitStreamingStarted(model)
    let fullMessage = ''
    for await (const chunk of this.streamer.stream()) {
      if (chunk.choices.length === 0) {
        continue
      }
      if (!chunk.choices[0]?.delta?.content) {
        continue
      }
      fullMessage += chunk.choices[0]?.delta?.content
      callback({
        timestamp: new Date(),
        role: 'assistant',
        message: fullMessage,
      })
    }
    this.emitStreamingCompleted(model)
    return true
  }

  private async makeRequest(
    model: Model,
    messages: PlaygroundMessage[],
    parameters: PlaygroundRequestParameters,
    systemPrompt: string | null,
  ) {
    // For local dev, set local storage with key this.authTokenLocalStorageOverwriteKey to "Bearer <PAT>"
    const tokenOverwrite = this.localStorage.getItem(this.authTokenLocalStorageOverwriteKey)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-ms-model-mesh-model-name': model.original_name.toLowerCase(),
      Authorization: tokenOverwrite ?? (await this.getAuthToken()).authorizationHeaderValue,
    }

    if (crypto && typeof crypto.randomUUID === 'function') {
      const uuid = crypto.randomUUID()
      headers['x-ms-client-request-id'] = uuid
    }

    const newMessages: PlaygroundAPIMessage[] = []
    if (systemPrompt) {
      newMessages.push({role: 'system', content: systemPrompt})
    }

    const existingMessagesAsPayload: PlaygroundAPIMessage[] = messages
      // Dont send error messages back to the API
      .filter(m => m.role !== 'error')
      .map(m => {
        return {role: m.role, content: m.message}
      })

    for (const m of existingMessagesAsPayload) {
      if (m.content.trim() !== '') {
        newMessages.push(m)
      }
    }

    const body = {
      ...parameters,
      messages: newMessages,
      stream: true,
    }
    return fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
  }

  private localStorage = safeStorage('localStorage', {
    throwQuotaErrorsOnSet: false,
    ttl: 1000 * 60 * 60 * 24,
  })

  /**
   * Get the current auth token, either from local storage or by minting a new one from dotcom.
   */
  private async getAuthToken(): Promise<AuthToken> {
    const stored = this.localStorage.getItem(this.authTokenLocalStorageKey)
    if (!stored) {
      return this.fetchAuthToken()
    }
    const token = AuthToken.deserialize(JSON.parse(stored) as AuthTokenResult)
    return this.validateAuthToken(token)
  }

  /**
   * Validate the given auth token.  If it's all good, return it, otherwise, go mint a new one from
   * dotcom and return it instead.
   */
  private async validateAuthToken(token: AuthToken): Promise<AuthToken> {
    return token.needsRefreshing() ? this.fetchAuthToken() : token
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
    const response = await verifiedFetchJSON('/marketplace/models/token', {method: 'POST'})

    if (response.ok) {
      const result = (await response.json()) as AuthTokenResult

      this.currentAuthTokenRequest = null

      const token = AuthToken.fromResult(result)

      this.localStorage.setItem(this.authTokenLocalStorageKey, JSON.stringify(token.serialize()))

      return token
    } else {
      this.currentAuthTokenRequest = null

      throw new Error('Failed to mint new auth token')
    }
  }

  private emitChatRequestSent(res: Response, model: Model) {
    sendEvent(PlaygroundChatRequestSent, {
      registry: model.registry,
      model: model.name,
      publisher: model.publisher,
      success: res.ok,
      result_code: res.status,
    })

    if (res.ok) {
      sendStats({incrementKey: 'MODELS_CHAT_REQUEST', requestUrl: window.location.href})
    } else {
      sendStats({incrementKey: 'MODELS_CHAT_REQUEST_ERROR', requestUrl: window.location.href})
    }
  }

  private emitRateLimitedEvent(res: Response, model: Model) {
    sendEvent(PlaygroundChatRateLimited, {
      registry: model.registry,
      model: model.name,
      publisher: model.publisher,
      rate_limit_type: res.headers.get('X-RateLimit-Type'),
    })
  }

  private emitStreamingStarted(model: Model) {
    sendEvent(PlaygroundChatRequestStreamingStarted, {
      registry: model.registry,
      model: model.name,
      publisher: model.publisher,
    })
  }

  private emitStreamingCompleted(model: Model) {
    sendEvent(PlaygroundChatRequestStreamingCompleted, {
      registry: model.registry,
      model: model.name,
      publisher: model.publisher,
    })
  }
}

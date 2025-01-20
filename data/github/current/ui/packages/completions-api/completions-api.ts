import {verifiedFetch} from '@github-ui/verified-fetch'
import {sendEvent} from '@github-ui/hydro-analytics'

/**
 * This is a clone of the Ghost Pilot completion api.
 * The goal is to ultimately have this as the single completion api that can be used by both
 */
export class CompletionsApi {
  completionsUrl: string = 'https://copilot-proxy.githubusercontent.com/v1/engines/github-completion/completions'
  completionsDotcomPath: string = '/copilot/completions'
  completionsTokenPath: string = `${this.completionsDotcomPath}/token`
  corsProxyToken: string | null = null

  lastPayload: string = ''
  lastResponse: string = ''
  lastRawJoined: string = ''
  lastTokens: Array<{text: string; tokens: [string]; token_logprobs: [number]; top_logprobs: Array<{string: number}>}> =
    []

  // Working around an aggressive abuse filter than is affecting some users, but
  // not all. If the proxy returns a 422, we'll fall back to making the request
  // through dotcom.
  private proxy422s: number = 0
  private readonly MAX_PROXY_422S: number = 2

  constructor(
    readonly userAgent: string,
    readonly eventPrefix: string,
  ) {
    this.userAgent = userAgent
  }

  async complete(
    prompt: string,
    signal: AbortSignal,
    options?: {
      suffix?: string
      useCors?: boolean
      overrideReturnTokenCount?: string
      language?: string
    },
  ): Promise<string | undefined> {
    const {suffix, useCors, overrideReturnTokenCount, language} = options || {}

    if (useCors && !this.corsProxyToken) {
      this.refreshProxyToken()
    }

    const stop = ['\n##', '\n\n', '---']
    let maxContext = 800
    if (overrideReturnTokenCount) {
      const tokenOverrideInput = document.getElementById(overrideReturnTokenCount) as HTMLInputElement
      if (tokenOverrideInput) {
        maxContext = tokenOverrideInput.valueAsNumber
      }
    }

    const metricTags: Record<string, string> = {version: this.userAgent.split('/')[1] || ''}

    let response: Response | undefined = undefined
    const payload = {
      prompt,
      suffix,
      stop,
      extra: {language},
      stream: true,
      max_tokens: maxContext,
      logprobs: 5,
    }
    const json = JSON.stringify(payload)
    this.lastPayload = json

    if (useCors && this.proxy422s < this.MAX_PROXY_422S) {
      metricTags['target'] = 'proxy'
      try {
        response = await this.fetchCompletionsFromProxy(json, signal)
      } catch (error: unknown) {
        // If the request was aborted, don't throw an error
        if ((error as Error).name !== 'AbortError') {
          throw error
        }
      }

      response = response as Response

      // If we get a 401, refresh the token and try again
      if (response.status === 401) {
        await this.refreshProxyToken()
        response = await this.fetchCompletionsFromProxy(json, signal)
      } else if (response.status === 422) {
        // If we get a 422, the proxy is being aggressive with content filtering
        // and we should fall back to dotcom
        sendEvent(`completions-api.${this.eventPrefix}.completion-not-ok`, {status: response.status, ...metricTags})
        this.proxy422s++
        metricTags['proxy422s'] = this.proxy422s.toString()
        return this.complete(prompt, signal, {
          suffix,
          useCors: true,
        })
      }
    } else {
      metricTags['target'] = 'dotcom'
      response = await this.fetchCompletionsFromDotCom(json, signal)
    }

    if (response.status !== 200) {
      sendEvent(`completions-api.${this.eventPrefix}.completion-not-ok`, {status: response.status, ...metricTags})
    }

    const data = response.body
    if (!data) {
      return
    }

    return await this.parseResponseStream(data, metricTags)
  }

  // Fetch a new token from the proxy api. Not used in local development.
  async refreshProxyToken(): Promise<void> {
    const response = await verifiedFetch(this.completionsTokenPath, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Editor-Version': this.userAgent,
      },
    })
    const json = await response.json()
    this.corsProxyToken = json.token
    this.completionsUrl = json.completions_url
  }

  private async fetchCompletionsFromProxy(json: string, signal: AbortSignal): Promise<Response> {
    return await fetch(this.completionsUrl, {
      method: 'POST',
      body: json,
      signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.corsProxyToken}`,
        'User-Agent': this.userAgent,
        'Editor-Version': this.userAgent,
      },
    })
  }

  private async fetchCompletionsFromDotCom(json: string, signal: AbortSignal): Promise<Response> {
    return await verifiedFetch(this.completionsDotcomPath, {
      method: 'POST',
      body: json,
      signal,
      headers: {
        Accept: 'application/json',
        ContentType: 'application/json',
        'User-Agent': this.userAgent,
        'Editor-Version': this.userAgent,
      },
    })
  }

  private async parseResponseStream(
    stream: ReadableStream<Uint8Array>,
    metricTags: Record<string, string>,
  ): Promise<string | undefined> {
    const decoder = new TextDecoder()
    const reader = stream.getReader()
    let chunks = ''

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const {done, value} = await reader.read()
      if (done) {
        sendEvent(`completions-api.${this.eventPrefix}.response-stream-done-early`, metricTags)
        return
      }

      const chunk = decoder.decode(value)
      chunks += chunk

      // Last chunk we care about, so we can now assemble the completion.
      if (chunk.endsWith('\n\ndata: [DONE]\n\n')) {
        chunks = chunks.replace('data: ', '').replace('\n\ndata: [DONE]\n\n', '')
        this.lastResponse = chunks
        const tokensAndLogprobs: Array<{
          text: string
          tokens: [string]
          token_logprobs: [number]
          top_logprobs: Array<{string: number}>
        }> = []

        let parseError = false
        const choices = chunks.split('\n\ndata: ').map(completion => {
          try {
            const choice = JSON.parse(completion).choices[0]
            tokensAndLogprobs.push({...choice.logprobs, text: choice.text})
            return choice.text
          } catch (e) {
            // Sometimes we don't get JSON -- don't die for it, just skip
            // eslint-disable-next-line no-console
            console.error(`completion: '${completion}'\nerror: ${e}`)
            parseError = true
          }
        })
        if (parseError) {
          sendEvent(`completions-api.${this.eventPrefix}.parse-response-failed`, metricTags)
          return
        }
        this.lastTokens = tokensAndLogprobs

        this.lastRawJoined = choices.join('')
        return this.lastRawJoined
      }
    }
  }
}

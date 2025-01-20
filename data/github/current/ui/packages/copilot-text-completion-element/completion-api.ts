import {verifiedFetch} from '@github-ui/verified-fetch'
import {featureFlag} from '@github-ui/feature-flags'
import {sendEvent} from '@github-ui/hydro-analytics'

// Stateful API wrapper that will hold onto context for us,
// interact with the API and return use completion results
export class CompletionApi {
  completionsUrl: string = 'https://copilot-proxy.githubusercontent.com/v1/engines/github-completion/completions'
  completionsDotcomPath: string = '/copilot/completions'
  completionsTokenPath: string = `${this.completionsDotcomPath}/token`
  corsProxyToken: string | null = null
  userAgentBaseName = 'GitHubGhostPilot'
  userAgent: string = `${this.userAgentBaseName}/0.0.0` // Gets overwritten with latest version

  lastPayload: string = ''
  lastResponse: string = ''
  lastRawJoined: string = ''
  lastTokens: Array<{
    text: string
    tokens: [string]
    token_logprobs: [number]
    top_logprobs: Array<{[key: string]: number}>
  }> = []

  // Working around an aggressive abuse filter than is affecting some users, but
  // not all. If the proxy returns a 422, we'll fall back to making the request
  // through dotcom.
  private proxy422s: number = 0
  private readonly MAX_PROXY_422S: number = 2

  async complete(
    prompt: string,
    suffix: string,
    signal: AbortSignal,
    useCors: boolean = false,
    overrideReturnTokenCount?: string,
  ): Promise<string | undefined> {
    if (useCors && !this.corsProxyToken) {
      this.refreshProxyToken()
    }

    const stop = ['\n##', '\n\n', '---']
    let maxContext = 40
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
      extra: {language: 'markdown'},
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
        sendEvent('ghost-pilot.completion-not-ok', {status: response.status, ...metricTags})
        this.proxy422s++
        metricTags['proxy422s'] = this.proxy422s.toString()
        return this.complete(prompt, suffix, signal, true)
      }
    } else {
      metricTags['target'] = 'dotcom'
      response = await this.fetchCompletionsFromDotCom(json, signal)
    }

    if (response.status !== 200) {
      sendEvent('ghost-pilot.completion-not-ok', {status: response.status, ...metricTags})
    }

    const data = response.body
    if (!data) {
      return
    }

    if (featureFlag.isFeatureEnabled('ghost_pilot_stream_handling')) {
      return this.parseResponseStream(data, metricTags)
    }

    const decoder = new TextDecoder()
    const reader = data.getReader()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const {done, value} = await reader.read()
      if (done) {
        return
      }

      let toParse = decoder.decode(value)
      if (toParse.endsWith('\n\ndata: [DONE]\n\n')) {
        this.lastResponse = toParse

        toParse = toParse.replace('data: ', '')
        toParse = toParse.replace('\n\ndata: [DONE]\n\n', '')

        const logprobs: Array<{
          text: string
          tokens: [string]
          token_logprobs: [number]
          top_logprobs: Array<{string: number}>
        }> = []
        const choices = toParse.split('\n\ndata: ').map(completion => {
          try {
            const choice = JSON.parse(completion).choices[0]
            logprobs.push({...choice.logprobs, text: choice.text})
            return choice.text
          } catch (e) {
            // Sometimes we don't get JSON -- don't die for it, just skip
            // eslint-disable-next-line no-console
            console.error(`completion: '${completion}'\nerror: ${e}`)
            return null
          }
        })
        this.lastTokens = logprobs

        // Join the list, exclude any direct parrotting of our context
        this.lastRawJoined = choices.join('')
        return this.lastRawJoined
      }
    }
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
    if (featureFlag.isFeatureEnabled('copilot_completion_new_domain')) {
      this.completionsUrl = json.completions_url
    }
  }

  private async fetchCompletionsFromProxy(json: string, signal: AbortSignal): Promise<Response> {
    let completionsUrl = 'https://copilot-proxy.githubusercontent.com/v1/engines/github-completion/completions'
    if (featureFlag.isFeatureEnabled('copilot_completion_new_domain')) {
      completionsUrl = this.completionsUrl
    }
    return await fetch(completionsUrl, {
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
        sendEvent('ghost-pilot.response-stream-done-early', metricTags)
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
          sendEvent('ghost-pilot.parse-response-failed', metricTags)
          return
        }
        this.lastTokens = tokensAndLogprobs

        this.lastRawJoined = choices.join('')
        return this.lastRawJoined
      }
    }
  }
}

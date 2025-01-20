import errorTemplate from '../shared/error-template'
import {linearRegression} from './forecasting'
import type {InsightsForecastOptions} from './forecasting/linear-regression'
import {fillMissing} from './padding'
import type {SeriesData} from './types'

interface Errors {
  hasErrors: boolean
  errorMessage: string
}

interface Column {
  name: string
  dataType: string
}

interface Data {
  columns: Column[]
  rows: SeriesData
  isSensitive: boolean
}

interface Response {
  version: string
  data: Data
  errors: Errors
  redacted: boolean | undefined
}

interface ChartConfig {
  [key: string]: string | boolean | null
}

interface Enhancements {
  'padding-applied'?: boolean
  'forecast-startdate'?: string
}

const DATADOG_TELEMETRY_KEY = 'insights-query-datadog-telemetry'
const HYDRO_TELEMETRY_KEY = 'insights-query-hydro-telemetry'
const BASE_TELEMETRY_OPTIONS = {bubbles: true, cancelable: true}

const RENDER_SERIES_TABLE = `series-table`
const RENDER_LINE_CHART = `line-chart`
const RENDER_STACKED_AREA_CHART = `stacked-area-chart`
const RENDER_BAR_CHART = `bar-chart`
const RENDER_COLUMN_CHART = `column-chart`
const CHART_CONFIG_PREFIX = `chart-`
const DATA_CONFIG_PREFIX = `data-`

const renderRegex = /--\s*render\s+(?<render>[a-z0-9-]+)\s?(?<config>\(.*\))?\s*(?:\n|\r\n|$)/is
const configRegexp = /(?<key>[a-z-]+)(?::(?:\s*"(?<stringValue>(?:[^"\\]|\\.)*)"|(?<nonStringValue>[^",\s]*)))?/gi

type QueryOptions = {
  authQueryTime: number
  apiUrl: RequestInfo
  query: string
  queryScope: string | null | undefined
  organization: string
  authScope: string
  startTime: number
  token: string
  queryId: number
  config: ChartConfig | null
  options: Record<string, unknown>
}

// InsightsQueryElement is a custom webcomponent which extends HTMLElement.
// For more information on this pattern, see https://developer.mozilla.org/en-US/docs/Web/Web_Components
export class InsightsQueryElement extends HTMLElement {
  currentQueryId = 0

  connectedCallback(): void {
    this.executeQuery()
  }

  static get observedAttributes(): string[] {
    return ['query', 'api-url', 'auth-url']
  }

  attributeChangedCallback(_attrName: string, oldVal: string, newVal: string): void {
    if (this.autoRender && oldVal !== newVal) {
      this.executeQuery()
    }
  }

  get autoRender(): boolean {
    return this.hasAttribute('auto-render')
  }

  set autoRender(val: boolean) {
    if (val) {
      this.setAttribute('auto-render', '')
    } else {
      this.removeAttribute('auto-render')
    }
  }

  get query(): string | null {
    let query = this.getAttribute('query')
    if (query) {
      return query
    }

    const queryContainerId = this.getAttribute('query-container-id')
    if (queryContainerId) {
      const queryContainer = document.getElementById(queryContainerId)
      if (queryContainer) {
        query = queryContainer instanceof HTMLInputElement ? queryContainer.value : queryContainer.textContent
      }
    }

    return query
  }

  set query(val: string | null) {
    if (val) {
      this.setAttribute('query', val)
    } else {
      this.removeAttribute('query')
    }
  }

  get apiUrl(): string | null {
    return this.getAttribute('api-url')
  }

  set apiUrl(val: string | null) {
    if (val) {
      this.setAttribute('api-url', val)
    } else {
      this.removeAttribute('api-url')
    }
  }

  get authUrl(): string | null {
    return this.getAttribute('auth-url')
  }

  set authUrl(val: string | null) {
    if (val) {
      this.setAttribute('auth-url', val)
    } else {
      this.removeAttribute('auth-url')
    }
  }

  /**
   * Gets options attribute; used for proxying custom options to intermediary layers not handled by Insights
   */
  get options(): Record<string, unknown> {
    const opt = this.getAttribute('options')
    if (!opt) {
      return {}
    }

    try {
      return JSON.parse(opt)
    } catch (e) {
      return {}
    }
  }

  set options(newOptions: Record<string, unknown>) {
    this.setAttribute('options', JSON.stringify(newOptions))
  }

  get height(): string | null {
    return this.getAttribute('height')
  }

  set height(val: string | null) {
    if (val) {
      this.setAttribute('height', val)
    } else {
      this.removeAttribute('height')
    }
  }

  async executeQuery(): Promise<void> {
    const startTime = new Date().getTime()
    const {query, render, config, queryScope} = this.parseQuery()
    const apiUrl = this.apiUrl

    if (!apiUrl || !query || !render) {
      return
    }

    // make sure we render something as soon as possible!
    const validRenderTypes = [
      RENDER_SERIES_TABLE,
      RENDER_LINE_CHART,
      RENDER_STACKED_AREA_CHART,
      RENDER_BAR_CHART,
      RENDER_COLUMN_CHART,
    ]
    if (this.children.length === 0) {
      if (!validRenderTypes.some(renderType => render.startsWith(renderType))) {
        // if there are no children and we can't add a renderer
        // display an error
        this.innerHTML = errorTemplate()
        this.dispatchEvent(
          new CustomEvent(DATADOG_TELEMETRY_KEY, {
            ...BASE_TELEMETRY_OPTIONS,
            detail: {incrementKey: 'execute-error'},
          }),
        )
        throw new InsightsQueryStatementError(`Query contains unknown render type: ${render}`)
      }

      this.appendChild(document.createElement(render))
    }

    if (!this.isValidQueryScope(queryScope)) {
      this.innerHTML = errorTemplate()
      this.dispatchEvent(
        new CustomEvent(DATADOG_TELEMETRY_KEY, {
          ...BASE_TELEMETRY_OPTIONS,
          detail: {incrementKey: 'execute-error'},
        }),
      )
      throw new InsightsQueryStatementError(`Query contains invalid scope: ${queryScope}`)
    }

    // bump the current query id counter
    // the id is passed to each render method to check that the render update
    // relates to the most recent query
    const queryId = this.currentQueryId + 1
    this.currentQueryId = queryId

    this.renderLoading(queryId)

    const authStartTime = new Date().getTime()
    const {token, authScope, organization} = await this.fetchTokenAndAuthScope(queryId)
    const authEndTime = new Date().getTime()

    if (!token || !authScope || !organization) {
      return
    }

    await this.fetchQuery({
      authQueryTime: authEndTime - authStartTime,
      apiUrl,
      organization,
      query,
      queryScope,
      authScope,
      startTime,
      token,
      queryId,
      config,
      options: this.options,
    })
  }

  async fetchQuery({
    authQueryTime,
    apiUrl,
    query,
    queryScope,
    organization,
    authScope,
    startTime,
    token,
    queryId,
    config,
    options,
  }: QueryOptions): Promise<void> {
    try {
      const apiStartTime = new Date().getTime()
      // make call to the Insights API to fetch data
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          query: this.stripRenderCommentFromQuery(query),
          queryScope,
          options,
        }),
        headers: {Authorization: token, 'X-Auth-Scope': authScope, 'Content-Type': 'application/json'},
      })

      const apiEndTime = new Date().getTime()
      if (response.status !== 200) {
        // Best effort: insights-api returns a valid response even in case of error.
        // Try to extract more details about the error to let the user know
        let errorMsg = `Insights API returned status code ${response.status}`
        try {
          const decodedResponse = await response.json()
          if (decodedResponse?.errors?.hasErrors) {
            errorMsg += `: ${decodedResponse.errors.errorMessage}`
          }
        } catch (e) {
          // decoding the response failed
          errorMsg += ` and an invalid JSON response`
        }

        throw new Error(errorMsg)
      }

      const decodedResponse = await response.json()

      const {data, errors, redacted}: Response = decodedResponse

      if (!data || !errors) {
        throw new Error(`Either no data is returned or data response has changed`)
      } else if (errors && errors.hasErrors) {
        throw new Error(`Insights API Error: ${errors.errorMessage}`)
      }

      this.renderSeries(queryId, data, config, data.isSensitive)

      if (redacted && !document.getElementById('redaction_msg')) {
        const msgElement = document.createElement('div')
        msgElement.classList.add('redaction_msg')
        msgElement.id = 'redaction_msg'
        msgElement.textContent =
          'You do not have access to all project items. Your chart visualization might differ from others.'
        msgElement.setAttribute('style', 'margin-top: 15px; margin-left: 16px; font-size: small; color: gray;')
        this.appendChild(msgElement)
      }

      const endTime = new Date().getTime()
      this.dispatchEvent(
        new CustomEvent(DATADOG_TELEMETRY_KEY, {...BASE_TELEMETRY_OPTIONS, detail: {incrementKey: 'execute-success'}}),
      )

      this.dispatchEvent(
        new CustomEvent(HYDRO_TELEMETRY_KEY, {
          ...BASE_TELEMETRY_OPTIONS,
          detail: {
            incrementKey: 'execute-success',
            context: {
              organization,
              'insights.render.time': endTime - startTime,
              'api.query.time': apiEndTime - apiStartTime,
              'auth.query.time': authQueryTime,
              'insights.with.config': config ? true : false,
            },
          },
        }),
      )
    } catch (e) {
      // for typescript type checker and `error.message` usage
      const error = e as Error

      this.dispatchEvent(
        new CustomEvent(DATADOG_TELEMETRY_KEY, {...BASE_TELEMETRY_OPTIONS, detail: {incrementKey: 'execute-error'}}),
      )

      this.dispatchEvent(
        new CustomEvent(HYDRO_TELEMETRY_KEY, {
          ...BASE_TELEMETRY_OPTIONS,
          detail: {
            incrementKey: 'execute-error',
            context: {
              organization,
              'auth.query.time': authQueryTime,
            },
          },
        }),
      )

      this.renderError(queryId, error.message)
      throw new InsightsDataFetchError(error.message)
    }
  }

  async fetchTokenAndAuthScope(queryId: number): Promise<{
    token: string | null
    authScope: string | null
    organization: string | null
  }> {
    const authUrl = this.authUrl
    if (!authUrl) {
      return {token: null, authScope: null, organization: null}
    }

    try {
      // make call to the monolith to generate SAT
      const authResponse = await fetch(authUrl, {
        headers: {
          Accept: 'application/json',
        },
      })

      if (authResponse.status !== 200) {
        // Checking for 401 and 403 here would make sense, but the API is always returning 404 if unauthorized
        if (authResponse.status === 404) {
          throw new Error(
            `Authorization failed: either you don't have access to the organization/repository or it doesn't support codeblocks`,
          )
        } else {
          throw new Error(`Sorry, something went wrong, please try again later (status: ${authResponse.status})`)
        }
      }

      const {token, authScope, organization} = await authResponse.json()
      return {token, authScope, organization}
    } catch (e) {
      // for typescript type checker and `error.message` usage
      const error = e as Error

      this.dispatchEvent(
        new CustomEvent(DATADOG_TELEMETRY_KEY, {
          ...BASE_TELEMETRY_OPTIONS,
          detail: {incrementKey: 'token-fetch-error'},
        }),
      )

      this.dispatchEvent(
        new CustomEvent(HYDRO_TELEMETRY_KEY, {...BASE_TELEMETRY_OPTIONS, detail: {incrementKey: 'token-fetch-error'}}),
      )

      this.renderError(queryId, error.message)
      throw new InsightsTokenFetchError(error.message)
    }
  }

  parseQuery(): {
    query: string | null
    render: string | null | undefined
    config: ChartConfig | null
    queryScope: string | null | undefined
  } {
    const query = this.query

    if (!query) {
      return {query: null, render: null, config: null, queryScope: null}
    }

    // match one or more non-whitespace characters following a "-- render" SQL comment
    const renderMatch = query.match(renderRegex)

    // if the regex matched, get the named render group, otherwise default to series-table
    const render = renderMatch && renderMatch.groups !== undefined ? renderMatch.groups['render'] : 'series-table'
    const config =
      renderMatch && renderMatch.groups !== undefined && renderMatch.groups['config'] !== undefined
        ? this.parseConfig(renderMatch.groups['config'])
        : null

    // match one or more non-whitespace characters following a "-- scope" SQL comment
    const scopeRegex = /--\s*scope\s+(?<scope>[^\s]+)/i
    const scopeMatch = query.match(scopeRegex)

    // if the regex matched, get the named render group, otherwise default to series-table
    const queryScope = scopeMatch && scopeMatch.groups !== undefined ? scopeMatch.groups['scope'] : null

    return {query, render, config, queryScope}
  }

  parseConfig(config: string): ChartConfig {
    config = config.substring(1, config.length - 1)

    const chartConfig: ChartConfig = {}

    for (const pairMatch of config.matchAll(configRegexp)) {
      if (pairMatch.groups) {
        const [key, value] = [pairMatch.groups.key, pairMatch.groups.stringValue, pairMatch.groups.nonStringValue]
          .filter(s => s)
          .map(s => String(s).trim())

        if (key && this.isValidConfigKey(key)) {
          chartConfig[key] = value || true
        }
      }
    }

    return chartConfig
  }

  isValidQueryScope(queryScope: string | null | undefined): boolean {
    if (queryScope == null) {
      return true
    }

    return /^project\/\d+$/.test(queryScope)
  }

  renderError(
    queryId: number,
    message?: string,
    options?: {
      chartCallback: (child: Element) => void
    },
  ): void {
    if (this.currentQueryId !== queryId) {
      return
    }

    for (const child of Array.from(this.children)) {
      child.removeAttribute('loading')
      child.removeAttribute('masked')

      if (!options?.chartCallback) {
        child.setAttribute('error', encodeURI(message || ''))
      } else {
        options.chartCallback(child)
      }
    }
  }

  renderLoading(queryId: number): void {
    if (this.currentQueryId !== queryId) {
      return
    }

    for (const child of Array.from(this.children)) {
      child.setAttribute('loading', '')
      child.removeAttribute('error')
      child.removeAttribute('masked')
    }
  }

  renderSeries(queryId: number, data: Data, config: ChartConfig | null, showMask: boolean): void {
    if (this.currentQueryId !== queryId) {
      return
    }

    const {data: series, enhancements} = this.enhanceSeriesFromConfig({data, config})

    const encodedSeries = encodeURI(JSON.stringify(series))
    for (const child of Array.from(this.children)) {
      if (showMask) {
        child.setAttribute('masked', '')
      } else {
        child.removeAttribute('masked')
      }
      child.setAttribute('series', encodedSeries)
      child.removeAttribute('loading')
      child.removeAttribute('error')

      // reset all chart config attributes
      const keys = Array.from(Object.keys(child.attributes)).filter(a => {
        return this.isValidConfigKey(a)
      })

      for (const key in keys) {
        child.removeAttribute(key)
      }

      // if config isn't empty, set chart config attributes
      if (config) {
        for (const [key, value] of Object.entries(config)) {
          if (value === true) {
            child.setAttribute(key, '')
          } else {
            child.setAttribute(key, String(value))
          }
        }
      }

      if (enhancements) {
        for (const [key, value] of Object.entries(enhancements)) {
          child.setAttribute(key, String(value))
        }
      }

      const height = this.height
      if (height) {
        child.setAttribute('height', height)
      }
    }
  }

  enhanceSeriesFromConfig({data, config}: {data: Data; config: ChartConfig | null}): {
    data: Data
    enhancements: Enhancements
  } {
    const enhancements: Enhancements = {}
    if (!config) {
      return {data, enhancements}
    }

    if (config['data-forecast-type'] === 'linear') {
      let daysInFuture = 5
      if (config['data-forecast-buckets-in-future']) {
        // at the moment forecasting can be done in days only, buckets === days
        const daysAsStr = config['data-forecast-buckets-in-future']
        if (daysAsStr === true) {
          daysInFuture = 5
        } else {
          daysInFuture = parseInt(daysAsStr, 10)
        }
      }

      const options: InsightsForecastOptions = {}
      if (config['data-forecast-round-to']) {
        options.roundTo = parseInt(config['data-forecast-round-to'] as string, 10)
      }

      if (config['data-forecast-allow-negative']) {
        options.allowNegative = true
      }

      data.rows = fillMissing(data.rows)
      enhancements['padding-applied'] = true
      const {series, forecastStartdate} = linearRegression.forecastAndAppend(data.rows, daysInFuture, options)
      data = {
        ...data,
        rows: series,
      }
      enhancements['forecast-startdate'] = new Date(forecastStartdate).toISOString()
    }

    return {data, enhancements}
  }

  isValidConfigKey(key: string): boolean {
    return key.startsWith(CHART_CONFIG_PREFIX) || key.startsWith(DATA_CONFIG_PREFIX)
  }

  stripRenderCommentFromQuery(query: string): string {
    query = query.trim()

    const matchedScope = query.match(/(?<scope>--\s*?scope\s+[\w/]+)?/is)
    const matchedRender = query.match(/(?<render>--\s*render\s+[a-z-]+)(?<options>.*?)/is)
    const matchedSQL = query.match(/\n?(?<sql>SELECT.*)/is)

    const scope = matchedScope?.groups?.scope
    const render = matchedRender?.groups?.render
    const sql = matchedSQL?.groups?.sql

    let final = ''

    if (scope === undefined && render === undefined) {
      return query
    }

    if (scope) {
      final += `${scope.trim()}\n`
    }

    if (render) {
      final += `${render.trim()}\n`
    }

    if (sql) {
      final += sql.trim()
    }

    return final
  }
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export class InsightsTokenFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsightsTokenFetchError'
  }
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export class InsightsDataFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsightsDataFetchError'
  }
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export class InsightsQueryStatementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsightsQueryStatementError'
  }
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export function RegisterInsightsQuery() {
  if (!window.customElements.get('insights-query')) {
    window.customElements.define('insights-query', InsightsQueryElement)
  }
}

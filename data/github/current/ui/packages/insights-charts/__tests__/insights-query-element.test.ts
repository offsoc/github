import {InsightsQueryElement} from '../src/insights-query-element'

if (!window.customElements.get('insights-query')) {
  window.customElements.define('insights-query', InsightsQueryElement)
}

// @ts-expect-error - testing
const mockResolvedFetch = res => ({
  json: async () => res,
  status: 200,
  headers: {
    'Content-type': 'application/json',
  },
})

const MOCK_DATA_RESPONSE = {
  version: '1.0',
  data: {
    columns: [
      {
        name: 'UserId',
        dataType: 'bigint',
      },
      {
        name: 'Login',
        dataType: 'nvarchar',
      },
      {
        name: 'Name',
        dataType: 'nvarchar',
      },
      {
        name: 'IsHidden',
        dataType: 'bit',
      },
    ],
    rows: [
      [1, 'monalisa', 'Monalisa', false],
      [2, 'joewilliams', 'Joe Williams', false],
      [3, 'keithduncan', 'Keith Duncan', false],
      [4, 'mdo', 'Mark Otto', true],
      [5, 'ross', 'Ross McFarland', true],
    ],
    isSensitive: false,
  },
  errors: {
    hasErrors: false,
  },
}

const MOCK_DATA_RESPONSE_WITH_QUOTE = {
  version: '1.0',
  data: {
    columns: [
      {
        name: 'UserId',
        dataType: 'bigint',
      },
      {
        name: 'Login',
        dataType: 'nvarchar',
      },
      {
        name: 'Name',
        dataType: 'nvarchar',
      },
      {
        name: 'IsHidden',
        dataType: 'bit',
      },
    ],
    rows: [
      [1, 'monalisa', 'Monalisa', false],
      [2, 'joewilliams', "Jo'e Williams", false],
      [3, 'keithduncan', "Kei'th Duncan", false],
      [4, 'mdo', 'Mark Otto', true],
      [5, 'ross', 'Ross McFarland', true],
    ],
    isSensitive: false,
  },
  errors: {
    hasErrors: false,
  },
}

const MOCK_DATA_RESPONSE_WITH_REDACTED_FLAG = {
  version: '1.0',
  data: {
    columns: [
      {
        name: 'UserId',
        dataType: 'bigint',
      },
      {
        name: 'Login',
        dataType: 'nvarchar',
      },
      {
        name: 'Name',
        dataType: 'nvarchar',
      },
      {
        name: 'IsHidden',
        dataType: 'bit',
      },
    ],
    rows: [
      [1, 'monalisa', 'Monalisa', false],
      [2, 'joewilliams', 'Joe Williams', false],
      [3, 'keithduncan', 'Keith Duncan', false],
      [4, 'mdo', 'Mark Otto', true],
      [5, 'ross', 'Ross McFarland', true],
    ],
    isSensitive: false,
  },
  errors: {
    hasErrors: false,
  },
  redacted: true,
}

const MOCK_AUTH_RESPONSE = {
  token: 'token123',
  authScope: 'auth-scope123',
  organization: 'org123',
}

describe('insights-query', function () {
  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('insights-query')
      expect('INSIGHTS-QUERY').toBe(el.nodeName)
    })
  })

  it('initiates and tries to execute a query', function () {
    // since dot is access operator in query strings, we have to escape it with \\
    const element = document.createElement(`insights-query`) as InsightsQueryElement
    jest.spyOn(element, 'executeQuery')
    document.body.appendChild(element)
    expect(element.textContent).toEqual('')
    expect(element).toBeInstanceOf(InsightsQueryElement)
    expect(element.executeQuery).toHaveBeenCalledTimes(1)

    // @ts-expect-error - testing
    element.executeQuery.mockClear()
  })

  describe('get autoRender', function () {
    it('returns true when auto-render attribute is set "true"', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auto-render', 'true')
      expect(element.autoRender).toBeTruthy()
    })

    it('returns true when auto-render attribute is set "false"', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auto-render', 'false')
      expect(element.autoRender).toBeTruthy()
    })

    it('returns true when auto-render attribute is set "anything"', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auto-render', 'anything')
      expect(element.autoRender).toBeTruthy()
    })

    it('returns true when auto-render attribute is set ""', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auto-render', '')
      expect(element.autoRender).toBeTruthy()
    })

    it('returns false auto-render attribute is unset', function () {
      const element = new InsightsQueryElement()
      expect(element.autoRender).toBeFalsy()
    })
  })

  describe('set auto-render', function () {
    it('with a non-null value sets the auto-render attribute', function () {
      const element = new InsightsQueryElement()
      element.autoRender = true
      expect(element.getAttribute('auto-render')).toBe('')
    })

    it('with a null value deletes the auto-render attribute', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auto-render', 'true')
      // @ts-expect-error - testing
      element.autoRender = null
      expect(element.hasAttribute('auto-render')).toBeFalsy()
    })
  })

  describe('get query', function () {
    it('returns the value from the query attribute when set', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('query', 'test')
      expect(element.query).toBe('test')
    })

    it('returns the text content from a referenced element when set', function () {
      document.body.innerHTML = '<div id="query-element">test</div>'
      const element = new InsightsQueryElement()
      element.setAttribute('query-container-id', 'query-element')
      expect(element.query).toBe('test')
    })

    it('returns the value from a referenced input when set', function () {
      document.body.innerHTML = '<input id="query-element" type="text" />'
      const input = document.getElementById('query-element')
      // @ts-expect-error - testing
      input.value = 'test'

      const element = new InsightsQueryElement()
      element.setAttribute('query-container-id', 'query-element')
      expect(element.query).toBe('test')
    })

    it('prefers query to query-component-id', function () {
      document.body.innerHTML = '<div id="query-element">referenced</div>'
      const element = new InsightsQueryElement()
      element.setAttribute('query', 'inline')
      element.setAttribute('query-container-id', 'query-element')
      expect(element.query).toBe('inline')
    })

    it('returns null when not available', function () {
      const element = new InsightsQueryElement()
      expect(element.query).toBeNull()
    })
  })

  describe('set query', function () {
    it('with a non-null value sets the query attribute', function () {
      const element = new InsightsQueryElement()
      element.query = 'test'
      expect(element.getAttribute('query')).toBe('test')
    })

    it('with a null value deletes the query attribute', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('query', 'test')
      element.query = null
      expect(element.hasAttribute('query')).toBeFalsy()
    })
  })

  describe('get authentication api url', function () {
    it('returns a value from the auth-url attribute when set', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auth-url', 'https://auth.api.com')
      expect(element.authUrl).toBe('https://auth.api.com')
    })

    it('returns null when not available', function () {
      const element = new InsightsQueryElement()
      expect(element.authUrl).toBeNull()
    })
  })

  describe('set authentication api url', function () {
    it('with a non-null value sets the auth-url attribute', function () {
      const element = new InsightsQueryElement()
      element.authUrl = 'https://auth.api.com'
      expect(element.getAttribute('auth-url')).toBe('https://auth.api.com')
    })

    it('with a null value deletes the auth-url attribute', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('auth-url', 'https://auth.api.com')
      element.authUrl = null
      expect(element.hasAttribute('auth-url')).toBeFalsy()
    })
  })

  describe('get data api url', function () {
    it('returns a value from the api-url attribute when set', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('api-url', 'https://data.api.com')
      expect(element.apiUrl).toBe('https://data.api.com')
    })

    it('returns null when not available', function () {
      const element = new InsightsQueryElement()
      expect(element.apiUrl).toBeFalsy()
    })
  })

  describe('set data api url', function () {
    it('with a non-null value sets the api-url attribute', function () {
      const element = new InsightsQueryElement()
      element.apiUrl = 'https://data.api.com'
      expect(element.getAttribute('api-url')).toBe('https://data.api.com')
    })

    it('with a null value deletes the api-url attribute', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('api-url', 'https://data.api.com')
      element.apiUrl = null
      expect(element.hasAttribute('api-url')).toBeFalsy()
    })
  })

  describe('get custom options', function () {
    it('returns a value from the options attribute when set', function () {
      const element = new InsightsQueryElement()
      element.options = {test: 'value'}
      expect(element.options).toStrictEqual({test: 'value'})
    })

    it('returns empty object when not available', function () {
      const element = new InsightsQueryElement()
      expect(element.options).toStrictEqual({})
    })
  })

  describe('executeQuery', function () {
    let receivedEvents: Event[]
    const element = new InsightsQueryElement()
    beforeEach(function () {
      receivedEvents = []
      jest.spyOn(element, 'fetchTokenAndAuthScope').mockImplementation(
        // @ts-expect-error - testing
        () => ({
          token: 'token',
          authScope: 'auth-scope',
          organization: 'org',
        }),
      )
      jest.spyOn(element, 'dispatchEvent').mockImplementation(e => {
        receivedEvents.push(e)
        return true
      })
      jest.spyOn(element, 'renderLoading')
      jest.spyOn(element, 'renderError')
      jest.spyOn(element, 'renderSeries')
      global.fetch = jest.fn().mockResolvedValue(mockResolvedFetch(MOCK_DATA_RESPONSE))
    })

    afterEach(function () {
      element.autoRender = false
      element.query = ''
      element.apiUrl = ''
      element.authUrl = ''
      element.textContent = ''
      jest.clearAllMocks()
    })

    it('fetches data from the configured api endpoint with auto-render turned on, api-url update', async function () {
      jest.spyOn(element, 'executeQuery')

      element.apiUrl = 'https://data.api.com'
      expect(element.executeQuery).toHaveBeenCalledTimes(0)

      element.autoRender = true
      element.apiUrl = 'https://data.api.com'
      expect(element.executeQuery).toHaveBeenCalledTimes(0)

      element.apiUrl = 'https://data.other-api.com'
      expect(element.executeQuery).toHaveBeenCalledTimes(1)
    })

    it('fetches data from the configured api endpoint with auto-render turned on, auth-url update', async function () {
      jest.spyOn(element, 'executeQuery')

      element.authUrl = 'https://data.api.com'
      expect(element.executeQuery).toHaveBeenCalledTimes(0)

      element.autoRender = true
      element.authUrl = 'https://data.api.com'
      expect(element.executeQuery).toHaveBeenCalledTimes(0)

      element.authUrl = 'https://data.other-api.com'
      expect(element.executeQuery).toHaveBeenCalledTimes(1)
    })

    it('fetches data from the configured api endpoint with auto-render turned on, query update', async function () {
      jest.spyOn(element, 'executeQuery')

      element.query = ''
      expect(element.executeQuery).toHaveBeenCalledTimes(0)

      element.autoRender = true
      element.query = 'test query'
      expect(element.executeQuery).toHaveBeenCalledTimes(1)

      element.query = 'test query'
      expect(element.executeQuery).toHaveBeenCalledTimes(1)

      element.query = 'changed test query'
      expect(element.executeQuery).toHaveBeenCalledTimes(2)
    })

    it('fetches data from the configured api endpoint', async function () {
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.fetchTokenAndAuthScope).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // @ts-expect-error - testing
      const mock = global.fetch.mock
      expect(mock.calls[0][0]).toBe('https://data.api.com')
      expect(mock.calls[0][1]).toStrictEqual({
        method: 'POST',
        body: JSON.stringify({query: 'test query', queryScope: null, options: {}}),
        headers: {Authorization: 'token', 'X-Auth-Scope': 'auth-scope', 'Content-Type': 'application/json'},
      })
    })

    it('fetches data from the configured api endpoint (with query scope)', async function () {
      element.query = `-- scope project/10
  SELECT test query`
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.fetchTokenAndAuthScope).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // @ts-expect-error - testing
      const mock = global.fetch.mock
      expect(mock.calls[0][0]).toBe('https://data.api.com')
      expect(mock.calls[0][1]).toStrictEqual({
        method: 'POST',
        body: JSON.stringify({
          query: '-- scope project/10\nSELECT test query',
          queryScope: 'project/10',
          options: {},
        }),
        headers: {Authorization: 'token', 'X-Auth-Scope': 'auth-scope', 'Content-Type': 'application/json'},
      })
    })

    it('renders fetched data', async function () {
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.renderSeries).toHaveBeenCalledTimes(1)
      expect(element.renderError).toHaveBeenCalledTimes(0)

      expect(element.childElementCount).toBe(1)
    })

    it('renders fetched data with redacted flag', async function () {
      // @ts-expect-error - testing
      global.fetch.mockResolvedValueOnce(mockResolvedFetch(MOCK_DATA_RESPONSE_WITH_REDACTED_FLAG))

      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.renderSeries).toHaveBeenCalledTimes(1)
      expect(element.renderError).toHaveBeenCalledTimes(0)

      expect(element.children).toHaveLength(2)
      // @ts-expect-error - testing
      expect(element.children[1].id).toBe('redaction_msg')
      // @ts-expect-error - testing
      expect(element.children[1].textContent).toBe(
        'You do not have access to all project items. Your chart visualization might differ from others.',
      )
    })

    it('renders fetched data with api response contains data with single quote', async function () {
      // @ts-expect-error - testing
      global.fetch.mockResolvedValueOnce(mockResolvedFetch(MOCK_DATA_RESPONSE_WITH_QUOTE))
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.renderSeries).toHaveBeenCalledTimes(1)
      // @ts-expect-error - testing
      expect(JSON.stringify(element.renderSeries.mock.calls[0])).toBe(
        JSON.stringify([element.currentQueryId, MOCK_DATA_RESPONSE_WITH_QUOTE.data, null, false]),
      )
      expect(element.renderError).toHaveBeenCalledTimes(0)
    })

    it('sets loading state on children', async function () {
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.renderLoading).toHaveBeenCalledTimes(1)
      expect(element.renderError).toHaveBeenCalledTimes(0)
    })

    it('renders child elements when included', async function () {
      // @ts-expect-error - testing
      global.fetch.mockResolvedValueOnce(mockResolvedFetch(MOCK_DATA_RESPONSE_WITH_QUOTE))
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'
      element.innerHTML = '<stacked-area-chart ></stacked-area-chart><series-table></series-table>'

      await element.executeQuery()
      expect(element.children).toHaveLength(2)
    })

    it('adds child elements when set in the query', async function () {
      // @ts-expect-error - testing
      global.fetch.mockResolvedValueOnce(mockResolvedFetch(MOCK_DATA_RESPONSE_WITH_QUOTE))

      element.query = `-- render line-chart
        test query`
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.children).toHaveLength(1)
      expect(element.children[0]!.nodeName.toLowerCase()).toBe('line-chart')
    })

    it('sends success telemetry', async function () {
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.dispatchEvent).toHaveBeenCalledTimes(2)
      expect(
        // @ts-expect-error - testing
        receivedEvents.find(e => e.name === 'insights-query-telemetry' && e.detail.incrementKey === 'execute-success'),
      ).not.toBeNull()
    })

    it('does not fetch data when a valid token and auth scope are not available', async function () {
      element.query = 'test query'
      element.apiUrl = 'https://data.api.com'
      // @ts-expect-error - testing
      element.fetchTokenAndAuthScope.mockReturnValueOnce({token: null, authScope: null})

      await element.executeQuery()
      expect(element.fetchTokenAndAuthScope).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledTimes(0)
    })

    it('does not fetch data when a valid query is not available', async function () {
      element.apiUrl = 'https://data.api.com'

      await element.executeQuery()
      expect(element.fetchTokenAndAuthScope).toHaveBeenCalledTimes(0)
      expect(global.fetch).toHaveBeenCalledTimes(0)
    })

    it('does not fetch data when a valid data api url is not available', async function () {
      element.query = 'test query'

      await element.executeQuery()
      expect(element.fetchTokenAndAuthScope).toHaveBeenCalledTimes(0)
      expect(global.fetch).toHaveBeenCalledTimes(0)
    })
  })

  describe('renderLoading', function () {
    it('sets the loading attribute on child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart></stacked-area-chart><series-table></series-table>'
      element.renderLoading(element.currentQueryId)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('loading')).toBeTruthy()
      }
    })

    it('removes error attribute from child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart error="test error"></stacked-area-chart><series-table></series-table>'
      element.renderLoading(element.currentQueryId)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('error')).toBeFalsy()
      }
    })

    it('removes masked attribute from child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart masked></stacked-area-chart><series-table></series-table>'
      element.renderLoading(element.currentQueryId)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('masked')).toBeFalsy()
      }
    })

    it("does not update renderers if queryId isn't up to date", function () {
      const element = new InsightsQueryElement()
      element.currentQueryId = 123
      element.innerHTML =
        '<stacked-area-chart error="test error"></stacked-area-chart><series-table error="test error"></series-table>'

      // @ts-expect-error - testing
      element.renderSeries(456, MOCK_DATA_RESPONSE)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('loading')).toBeFalsy()
        expect(child.hasAttribute('error')).toBeTruthy()
      }
    })
  })

  describe('renderError', function () {
    it('sets the error attribute on child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart></stacked-area-chart><series-table></series-table>'
      element.renderError(element.currentQueryId, 'test error')
      for (const child of Array.from(element.children)) {
        expect(child.getAttribute('error')).toBe(encodeURI('test error'))
      }
    })

    it('removes loading attribute from child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart loading></stacked-area-chart><series-table></series-table>'
      element.renderError(element.currentQueryId)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('loading')).toBeFalsy()
      }
    })

    it('removes masked attribute from child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart masked></stacked-area-chart><series-table></series-table>'
      element.renderLoading(element.currentQueryId)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('masked')).toBeFalsy()
      }
    })
    it("does not update renderers if queryId isn't up to date", function () {
      const element = new InsightsQueryElement()
      element.currentQueryId = 123
      element.innerHTML = '<stacked-area-chart loading></stacked-area-chart><series-table loading></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(456, MOCK_DATA_RESPONSE)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('loading')).toBeTruthy()
        expect(child.hasAttribute('error')).toBeFalsy()
      }
    })
  })

  describe('renderSeries', function () {
    it('set the chart config attributes on child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<bar-chart></bar-chart>'
      const config = element.parseConfig(
        `(nonchart-stacked, chart-stacked, chart-tooltip, chart-title:"This is a title", chart-subtitle: "This is a subtitle")`,
      )

      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE, config, false)
      expect(element.children).toHaveLength(1)

      const child = element.children[0]!
      expect(child.nodeName.toLowerCase()).toBe('bar-chart')
      expect(child.hasAttribute('nonchart-stacked')).toBe(false)
      expect(child.hasAttribute('chart-stacked')).toBe(true)
      expect(child.hasAttribute('chart-tooltip')).toBe(true)
      expect(child.getAttribute('chart-title')).toBe('This is a title')
      expect(child.getAttribute('chart-subtitle')).toBe('This is a subtitle')
    })

    it('overwrite the chart config attributes on child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<bar-chart chart-title="Old title" custom-attribute></bar-chart>'
      const config = element.parseConfig(`(
              nonchart-stacked,
              chart-stacked,
              chart-tooltip,
              chart-title:"New title",
              chart-subtitle: "This is a subtitle"
            )`)
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE, config, false)
      expect(element.children).toHaveLength(1)

      const child = element.children[0]!
      expect(child.nodeName.toLowerCase()).toBe('bar-chart')
      expect(child.hasAttribute('custom-attribute')).toBe(true)
      expect(child.hasAttribute('nonchart-stacked')).toBe(false)
      expect(child.hasAttribute('chart-stacked')).toBe(true)
      expect(child.hasAttribute('chart-tooltip')).toBe(true)
      expect(child.getAttribute('chart-title')).toBe('New title')
      expect(child.getAttribute('chart-subtitle')).toBe('This is a subtitle')
    })

    it('set the chart height in px', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('height', '100px')
      element.innerHTML = '<bar-chart></bar-chart>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE, null, false)
      expect(element.children).toHaveLength(1)
      const child = element.children[0]!
      expect(child.nodeName.toLowerCase()).toBe('bar-chart')
      expect(child.getAttribute('height')).toBe('100px')
    })

    it('set the chart height in %', function () {
      const element = new InsightsQueryElement()
      element.setAttribute('height', '80%')
      element.innerHTML = '<bar-chart></bar-chart>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE, null, false)
      expect(element.children).toHaveLength(1)
      const child = element.children[0]!
      expect(child.nodeName.toLowerCase()).toBe('bar-chart')
      expect(child.getAttribute('height')).toBe('80%')
    })

    it('set the data attribute series on child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart></stacked-area-chart><series-table></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE)
      for (const child of Array.from(element.children)) {
        const series = child.getAttribute('series')
        expect(series).toBe(encodeURI(JSON.stringify(MOCK_DATA_RESPONSE)))
      }
    })

    it('preserves child attributes when children are rendered', async function () {
      const element = new InsightsQueryElement()
      const colorConfig = escape(
        JSON.stringify({
          'In progress': {borderColor: '#005CC5', backgroundColor: 'red'},
          Done: {borderColor: '#005CC5', backgroundColor: 'blue'},
        }),
      )
      element.innerHTML = `<stacked-area-chart color-coding="${colorConfig}"></stacked-area-chart><series-table></series-table>`
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE)
      // @ts-expect-error - testing
      expect(element.querySelector('stacked-area-chart').getAttribute('color-coding')).toBe(colorConfig)
    })

    it('sets masked attribute on child elements when showMask is true', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart></stacked-area-chart><series-table></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE, null, true)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('masked')).toBe(true)
      }
    })

    it('removes masked attribute from child elements when showMask is falsey', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart masked></stacked-area-chart><series-table></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE, false)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('masked')).toBe(false)
      }
    })

    it('removes loading attribute from child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML = '<stacked-area-chart loading></stacked-area-chart><series-table></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('loading')).toBe(false)
      }
    })

    it('removes error attribute from child elements', function () {
      const element = new InsightsQueryElement()
      element.innerHTML =
        '<stacked-area-chart error="test error"></stacked-area-chart><series-table error="test error"></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(element.currentQueryId, MOCK_DATA_RESPONSE)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('error')).toBe(false)
      }
    })

    it("does not update renderers if queryId isn't up to date", function () {
      const element = new InsightsQueryElement()
      element.currentQueryId = 123
      element.innerHTML =
        '<stacked-area-chart loading error="test error"></stacked-area-chart><series-table loading error="test error"></series-table>'
      // @ts-expect-error - testing
      element.renderSeries(456, MOCK_DATA_RESPONSE)
      for (const child of Array.from(element.children)) {
        expect(child.hasAttribute('series')).toBe(false)
        expect(child.hasAttribute('loading')).toBe(true)
        expect(child.getAttribute('error')).toBe('test error')
      }
    })
  })

  describe('fetchTokenAndAuthScope', function () {
    let receivedEvents
    const element = new InsightsQueryElement()

    beforeEach(function () {
      receivedEvents = []
      global.fetch = jest.fn().mockResolvedValue(mockResolvedFetch(MOCK_AUTH_RESPONSE))
      jest.spyOn(element, 'dispatchEvent').mockImplementation(
        // @ts-expect-error - testing
        e => {
          receivedEvents.push(e)
        },
      )
    })

    afterEach(function () {
      element.autoRender = false
      element.query = ''
      element.apiUrl = ''
      element.authUrl = ''
      element.textContent = ''
      jest.clearAllMocks()
    })

    it('fetches data from the configured auth url', async function () {
      element.authUrl = 'https://auth.api.com'
      const {token, authScope, organization} = await element.fetchTokenAndAuthScope(0)
      expect(global.fetch).toHaveBeenCalledTimes(1)
      // @ts-expect-error - testing
      const mock = global.fetch.mock
      expect(mock.calls[0][0]).toBe('https://auth.api.com')

      expect(mock.calls[0][1]).toStrictEqual({
        headers: {Accept: 'application/json'},
      })

      expect(token).toBe('token123')
      expect(authScope).toBe('auth-scope123')
      expect(organization).toBe('org123')
    })

    it('returns null data if the auth url is not configured', async function () {
      const {token, authScope, organization} = await element.fetchTokenAndAuthScope(0)
      expect(global.fetch).toHaveBeenCalledTimes(0)
      expect(token).toBeNull()
      expect(authScope).toBeNull()
      expect(organization).toBeNull()
    })
  })

  describe('parseQuery', function () {
    const element = new InsightsQueryElement()
    it('tests the default query without render option', async function () {
      const inputQuery = 'SELECT * FROM issues'
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('series-table')
    })

    it('tests a query with an sql comment', async function () {
      const inputQuery = `-- render series-table
            -- SELECT anything
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('series-table')
    })

    it('tests query with the series-table render option', async function () {
      const inputQuery = `-- render series-table
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('series-table')
    })

    it('tests query with the series-table render option, no space between -- and text', async function () {
      const inputQuery = `--render series-table
        SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('series-table')
    })

    it('tests query with the line-chart render option', async function () {
      const inputQuery = `-- render line-chart
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('line-chart')
    })

    it('tests query with a dummy render option, still valid', async function () {
      const inputQuery = `-- render dummy
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('dummy')
    })

    it('tests query with a render option containing numbers', async function () {
      const chartName = `insights-chart-1-2-3`
      const inputQuery = `-- render ${chartName}
                                SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe(chartName)
    })

    it('tests query with a mixedup render option', async function () {
      const inputQuery = `-- test SQL render dummy
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('series-table')
    })

    it('tests query with the line-chart render option and a project scope', async function () {
      const inputQuery = `-- render line-chart
      -- scope project/10
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render, queryScope} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('line-chart')
      expect(queryScope).toBe('project/10')
    })

    it('tests query without render option and with scope', async function () {
      const inputQuery = `-- scope project/10
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, render, queryScope} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('series-table')
      expect(queryScope).toBe('project/10')
    })

    it('tests query with the bar-chart render option and config', async function () {
      const inputQuery = `-- render bar-chart (chart-stacked)
      SELECT * FROM issues`
      element.query = inputQuery
      const {query, config, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('bar-chart')
      expect(config).not.toBeNull()
      expect(config!['chart-stacked']).toBe(true)
    })

    it('tests query (contains parenthesis) with the bar-chart render option and config', async function () {
      const inputQuery = `-- render bar-chart (chart-stacked)
      SELECT COUNT(id) FROM issues`
      element.query = inputQuery
      const {query, config, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('bar-chart')
      expect(config).not.toBeNull()
      expect(config!['chart-stacked']).toBe(true)
    })

    it('tests query (contains parenthesis) with the stacked-area-chart render option and multi-line config', async function () {
      const inputQuery = `-- scope project/2193
      -- render stacked-area-chart (
         chart-title:"Category chart hello (test)",
         chart-subtitle:"stacked area chart",
         chart-label-x,
         chart-label-y
      )
      SELECT S.Name Category, SUM_WORK_ESTIMATE_IN_DAYS = SUM([Work estimate (days)]), Status
      FROM ProjectItemSnapshot P
      INNER JOIN SingleSelectColumnSetting S
      ON S.SingleSelectKey = P.CategoryKey
      WHERE  P.Archived = 0
      AND P.Status <> 'null'
      AND [Work estimate (days)] IS NOT NULL
      AND DateKey < 20211101
      GROUP BY S.Name, Status, StatusRank
      ORDER BY S.Name, StatusRank`
      element.query = inputQuery
      const {query, config, render} = element.parseQuery()
      expect(query).toBe(inputQuery)
      expect(render).toBe('stacked-area-chart')
      expect(config).not.toBeNull()
      expect(config!['chart-label-x']).toBe(true)
      expect(config!['chart-label-y']).toBe(true)
      expect(config!['chart-title']).toBe('Category chart hello (test)')
      expect(config!['chart-subtitle']).toBe('stacked area chart')
    })
  })
  describe('isValidQueryScope', function () {
    const element = new InsightsQueryElement()
    it('tests null parseQuery', function () {
      expect(element.isValidQueryScope(null)).toBe(true)
    })

    it('tests valid parseQuery', function () {
      expect(element.isValidQueryScope('project/10')).toBe(true)
    })

    it('tests invalid parseQuery, invalid format', function () {
      expect(element.isValidQueryScope('project')).toBe(false)
    })

    it('tests invalid parseQuery, unknown scope type', function () {
      expect(element.isValidQueryScope('org/10')).toBe(false)
    })

    it('tests invalid parseQuery, invalid scope id (ID is not a number)', function () {
      expect(element.isValidQueryScope('project/ID')).toBe(false)
    })

    it('tests invalid parseQuery, invalid scope id (10t is not a number)', function () {
      expect(element.isValidQueryScope('project/10t')).toBe(false)
    })
  })
  describe('parseConfig', function () {
    const element = new InsightsQueryElement()
    it('tests empty chart config', async function () {
      const config = element.parseConfig('')
      expect(Object.keys(config)).toHaveLength(0)
    })

    it('tests unknown chart config option', async function () {
      const config = element.parseConfig('(config-option)')
      expect(Object.keys(config)).toHaveLength(0)
    })

    it('tests chart config with a valid option', async function () {
      const config = element.parseConfig('(chart-config-option)')
      expect(Object.keys(config)).toHaveLength(1)
    })

    it('tests chart config with a mix of multiple valid and invalid options', async function () {
      const config = element.parseConfig(`(chart-config-option-one, config-option-two)`)
      expect(Object.keys(config)).toHaveLength(1)
      expect(config['chart-config-option-one']).toBe(true)
    })

    it('tests chart config with multiple valid options', async function () {
      const config = element.parseConfig(`(chart-config-option-one, chart-config-option-two)`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe(true)
      expect(config['chart-config-option-two']).toBe(true)
    })

    it('tests chart config with multiple non-boolean options', async function () {
      const config = element.parseConfig(`(chart-config-option-one:1,chart-config-option-two:true)`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe('1')
      expect(config['chart-config-option-two']).toBe('true')
    })

    it('tests chart config with options of boolean and string (quoted) type', async function () {
      const config = element.parseConfig(`(chart-config-option-one, chart-config-option-two:"string")`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe(true)
      expect(config['chart-config-option-two']).toBe('string')
    })

    it('tests chart config with options of boolean and string (quoted and containing line-return) type', async function () {
      const config = element.parseConfig(`(
            chart-config-option-one, chart-config-option-two:"string
            new line")`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe(true)
      expect(config['chart-config-option-two']).toBe(
        `string
            new line`,
      )
    })

    it('tests chart config (with closing parenthesis on a new line) with options of boolean and string (quoted) type', async function () {
      const config = element.parseConfig(`(chart-config-option-one,
            chart-config-option-two:"string"
            )`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe(true)
      expect(config['chart-config-option-two']).toBe('string')
    })

    it('tests chart config with string containing multiple commas', async function () {
      const config = element.parseConfig(`(chart-config-option-one:"string",
            chart-config-option-two:"string1, string2, string3")`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe('string')
      expect(config['chart-config-option-two']).toBe('string1, string2, string3')
    })

    it('tests chart config with string containing parenthesis', async function () {
      const config = element.parseConfig(`(chart-config-option-one:"string (string one)",
            chart-config-option-two:"string1, string2, string3")`)
      expect(Object.keys(config)).toHaveLength(2)
      expect(config['chart-config-option-one']).toBe('string (string one)')
      expect(config['chart-config-option-two']).toBe('string1, string2, string3')
    })
  })
})

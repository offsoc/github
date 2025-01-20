import {SeriesTableElement, RegisterSeriesTable, validateInput} from '../src/series-table-element'

RegisterSeriesTable()

describe('series-table', function () {
  describe('after tree insertion', function () {
    afterEach(function () {
      document.body.textContent = ''
    })

    it('initiates and try render the table', function () {
      document.body.innerHTML = '<series-table></series-table>'

      const element = document.querySelector(`series-table`)!
      expect(element.textContent!.includes('No data available')).toBeTruthy()
      expect(element.textContent!.includes('No results were returned')).toBeTruthy()
    })
  })

  it('renders the component when the series attribute changes', function () {
    jest.resetAllMocks()

    const element = new SeriesTableElement()
    const renderMethod = jest.spyOn(element, 'render')

    element.setAttribute('series', '')
    element.setAttribute('loading', '')
    element.setAttribute('error', '')
    element.setAttribute('masked', '')
    expect(renderMethod).toHaveBeenCalledTimes(4)
  })

  it('renders the component', function () {
    jest.resetAllMocks()

    const element = new SeriesTableElement()
    const renderMethod = jest.spyOn(element, 'render')

    element.handleAttributeChanged()
    expect(renderMethod).toHaveBeenCalledTimes(1)
  })

  describe('manipulate series attribute', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    afterEach(function () {
      jest.clearAllMocks()
    })

    it('set series attribute', function () {
      element = new SeriesTableElement()
      element.setAttribute(
        'series',
        '{"columns":[{"name":"Name","dataType":"string"},{"name":"Count","dataType":"int"}],"rows":[["Robin",10]],"isSensitive":false}',
      )
      expect(element.hasAttribute('series')).toBeTruthy()
    })

    it('get series attribute, unavailable', function () {
      element = new SeriesTableElement()
      expect(element.seriesData).toBeNull()
    })

    it('get series attribute, available', function () {
      element = new SeriesTableElement()
      element.setAttribute(
        'series',
        '{"columns":[{"name":"Name","dataType":"string"},{"name":"Count","dataType":"int"}],"rows":[["Robin",10]],"isSensitive":false}',
      )

      // converting to string for the assert
      expect(JSON.stringify(element.series)).toBe(
        '{"columns":[{"name":"Name","dataType":"string"},{"name":"Count","dataType":"int"}],"rows":[["Robin",10]],"isSensitive":false}',
      )
      expect(JSON.stringify(element.seriesData)).toBe('[["Name","Count"],["Robin",10]]')
    })

    it('delete series attribute', function () {
      element.setAttribute(
        'series',
        '{"columns":[{"name":"Name","dataType":"string"},{"name":"Count","dataType":"int"}],"rows":[["Robin",10]],"isSensitive":false}',
      )
      expect(element.hasAttribute('series')).toBeTruthy()
      element.series = null
      expect(element.hasAttribute('series')).toBeFalsy()
    })
  })

  describe('get loading', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    it('returns true when loading attribute exists', function () {
      element = new SeriesTableElement()
      element.setAttribute('loading', '')
      expect(element.loading).toBeTruthy()
    })

    it('returns false when loading attribute does not exist', function () {
      element = new SeriesTableElement()
      expect(element.loading).toBeFalsy()
    })
  })

  describe('set loading', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    it('with true sets the loading attribute', function () {
      element = new SeriesTableElement()
      element.loading = true
      expect(element.hasAttribute('loading')).toBeTruthy()
    })

    it('with false deletes the loading attribute', function () {
      element = new SeriesTableElement()
      element.setAttribute('loading', '')
      element.loading = false
      expect(element.hasAttribute('loading')).toBeFalsy()
    })
  })

  describe('get error', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    it('returns value from error attribute', function () {
      element = new SeriesTableElement()
      element.setAttribute('error', 'test error')
      expect('test error').toBe(element.error)
    })

    it('returns null when error attribute is not set', function () {
      element = new SeriesTableElement()
      expect(null).toBe(element.error)
    })
  })

  describe('set error', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    it('with a value sets the error attribute', function () {
      element = new SeriesTableElement()
      element.error = 'test error'
      expect(encodeURI('test error')).toBe(element.getAttribute('error'))
    })

    it('with null deletes the error attribute', function () {
      element = new SeriesTableElement()
      element.setAttribute('error', 'test error')
      element.error = null
      expect(element.hasAttribute('error')).toBeFalsy()
    })
  })

  describe('get masked', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    it('returns false when loading attribute does not exist', function () {
      element = new SeriesTableElement()
      expect(element.masked).toBeFalsy()
    })

    it('returns true when loading attribute exists', function () {
      element = new SeriesTableElement()
      element.setAttribute('masked', '')
      expect(element.masked).toBeTruthy()
    })
  })

  describe('set masked', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    it('with true sets the masked attribute', function () {
      element = new SeriesTableElement()
      element.masked = true
      expect(element.hasAttribute('masked')).toBeTruthy()
    })

    it('with false deletes the masked attribute', function () {
      element = new SeriesTableElement()
      element.setAttribute('masked', '')
      element.masked = false
      expect(element.hasAttribute('masked')).toBeFalsy()
    })
  })

  describe('test render method', function () {
    let element = new SeriesTableElement()
    // @ts-expect-error - testing
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged')

    beforeEach(function () {
      element = new SeriesTableElement()
      jest.clearAllMocks()
    })

    it('renders loading state when loading attribute is set', function () {
      element.loading = true
      expect(element.innerHTML.includes('Loading')).toBeTruthy()
    })

    it('renders error state when error attribute is set', function () {
      element = new SeriesTableElement()

      element.error = 'test error'
      expect(element.innerHTML.includes('test error')).toBeTruthy()
    })

    it('renders masked state when masked attribute is set', function () {
      element = new SeriesTableElement()

      element.masked = true
      expect(element.innerHTML.includes('Click to view')).toBeTruthy()
    })

    it('registers unmask as a click handler when masked attribute is set', function () {
      element = new SeriesTableElement()
      jest.spyOn(element, 'addEventListener')

      element.masked = true

      // @ts-expect-error - testing
      const mock = element.addEventListener.mock
      expect(mock.calls.length).toBe(1)
      expect(mock.calls[0][0]).toBe('click')
      expect(mock.calls[0][1]).toBe(element.unmask)
    })

    it('renders null state when null data is provided', function () {
      element = new SeriesTableElement()
      element.render()

      // content validation
      expect(element.innerHTML.includes('No data available')).toBeTruthy()
    })

    it('renders null state when no data is provided', function () {
      element = new SeriesTableElement()

      element.render()
      expect(element.innerHTML.includes('No data available')).toBeTruthy()
    })

    it('Verify render method parses and renders correct data with mixed data type', function () {
      element.series = {
        columns: [
          {name: 'Name', dataType: 'nvarchar'},
          {name: 'Count', dataType: 'int'},
        ],
        rows: [
          ['Ivan', 3],
          ['Shriyansh', true],
          ['Levin', '<style>body {background-color: hotpink;}</style>'],
          ['<a href="https://github.com/insights-robot">inisghts-robot</a>', 1],
        ],
        isSensitive: false,
      }
      element.render()

      const RENDERED_TABLE_HTML = `<table><thead><tr><th>Name</th><th>Count</th></tr></thead><tbody><tr><td>Ivan</td><td>3</td></tr><tr><td>Shriyansh</td><td>true</td></tr><tr><td>Levin</td><td></td></tr><tr><td><a href="https://github.com/insights-robot">inisghts-robot</a></td><td>1</td></tr></tbody></table>`
      // content validation
      expect(element.innerHTML).toBe(RENDERED_TABLE_HTML)
    })
  })

  describe('test validateInput Method', function () {
    it('returns true with correct data', function () {
      const dataToValidate = [
        ['Name', 'Count'],
        ['Ivan', 3],
        ['Levin', '3'],
        ['Shriyansh', true],
      ]
      // @ts-expect-error - testing
      expect(validateInput(dataToValidate)).toBeTruthy()
    })

    it('returns false when malformed with incorrect rows', function () {
      const dataToValidate = [['Name', 'Count'], ['Ivan'], ['Levin', '3']]
      expect(validateInput(dataToValidate)).toBeFalsy()
    })

    it('returns false when malformed with empty row data', function () {
      const dataToValidate = [['Name', 'Count'], [], ['Levin', '3']]
      expect(validateInput(dataToValidate)).toBeFalsy()
    })
  })

  describe('unmask', function () {
    it('is called when clicking on a mask element', function () {
      const element = new SeriesTableElement()
      jest.spyOn(element, 'addEventListener')

      // render the element mask
      element.masked = true

      // @ts-expect-error - testing
      const mock = element.addEventListener.mock
      expect(mock.calls.length).toBe(1)
      expect(mock.calls[0][0]).toBe('click')
      expect(mock.calls[0][1]).toBe(element.unmask)
    })

    it('sets masked to false', function () {
      const element = new SeriesTableElement()
      element.masked = true
      element.unmask()
      expect(element.masked).toBeFalsy()
    })

    it('unregisters unmask as a click handler', function () {
      const element = new SeriesTableElement()
      jest.spyOn(element, 'removeEventListener')

      element.unmask()

      // @ts-expect-error - testing
      const mock = element.removeEventListener.mock
      expect(mock.calls.length).toBe(1)
      expect(mock.calls[0][0]).toBe('click')
      expect(mock.calls[0][1]).toBe(element.unmask)
    })
  })

  it('adds forecasted data to table when forecasted data is present and we are in a time series as defined by incoming param', () => {
    const element = new SeriesTableElement()
    const data = [
      ['2020-01-07', 40],
      ['2020-01-08', 43],
      ['2020-01-09', 50],
    ]
    element.setAttribute(
      'series',
      JSON.stringify({
        columns: [
          {name: 'Name', dataType: 'nvarchar'},
          {name: 'Count', dataType: 'int'},
        ],
        rows: data,
      }),
    )

    element.setAttribute('is-time-series', 'true')
    element.setAttribute('forecast-start-date', '2020-01-08')

    element.render()

    const headers = element.getElementsByTagName('th')
    expect(headers[2]!.innerHTML).toBe('Is Forecasted')

    const trs = Array.from(element.getElementsByTagName('tr')).slice(1)
    // 2020-01-07; not forecasted
    expect(trs[0]!.getElementsByTagName('td')[2]!.innerHTML).toBe('false')

    // 2020-01-08; forecasted
    expect(trs[1]!.getElementsByTagName('td')[2]!.innerHTML).toBe('true')

    // 2020-01-09; forecasted
    expect(trs[2]!.getElementsByTagName('td')[2]!.innerHTML).toBe('true')
  })
})

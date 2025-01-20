import {
  BaseChartElement,
  validateTimeSeriesInput,
  validateCategoricalInput,
  forecastIndex,
  forecasted,
} from '../shared/base-chart/base-chart-element'
import {getColorMode, getTheme} from '../shared/primer'
import {getDefaultChartConfig, getDatasetConfig} from '../shared/base-chart/config'
import {type SeriesData, SeriesType} from '../src/types'

// base chart element needs to be defined for tests but we don't use it
if (!window.customElements.get('base-chart')) {
  window.customElements.define('base-chart', BaseChartElement)
}

// TestBaseChartElement will be our way to test the base chart logic
// class TestBaseChartElement extends BaseChartElement {
//   constructor() {
//     super()
//   }
// }

// RegisterTestBaseChart()

describe('base-chart', function () {
  afterEach(function () {
    jest.restoreAllMocks()
  })

  describe('primer.getColorMode', function () {
    it('should return the colorMode set in <html> data-color-mode', function () {
      document.querySelector('html')!.setAttribute('data-color-mode', 'dark')
      expect(getColorMode()).toBe('dark')

      document.querySelector('html')!.setAttribute('data-color-mode', 'light')
      expect(getColorMode()).toBe('light')

      document.querySelector('html')!.setAttribute('data-color-mode', 'auto')
      expect(getColorMode()).toBe('auto')
    })

    it('should always default to light when no value is found', function () {
      document.querySelector('html')!.removeAttribute('data-color-mode')
      expect(getColorMode()).toBe('light')
    })
  })

  describe('primer.getTheme', function () {
    it('should return the active theme, described by the <html> data attributes', function () {
      document.querySelector('html')!.setAttribute('data-color-mode', 'dark')
      document.querySelector('html')!.setAttribute('data-dark-theme', 'dark')
      expect(getTheme()).toBe('dark')

      document.querySelector('html')!.setAttribute('data-color-mode', 'light')
      document.querySelector('html')!.setAttribute('data-light-theme', 'light')
      expect(getTheme()).toBe('light')

      document.querySelector('html')!.setAttribute('data-color-mode', 'auto')
      document.querySelector('html')!.setAttribute('data-light-theme', 'light')
      document.querySelector('html')!.setAttribute('data-dark-theme', 'dark')
      expect(getTheme()).toBe('light')

      document.querySelector('html')!.setAttribute('data-color-mode', 'dark')
      document.querySelector('html')!.setAttribute('data-dark-theme', 'dark_dimmed')
      expect(getTheme()).toBe('dark_dimmed')

      document.querySelector('html')!.setAttribute('data-color-mode', 'dark')
      document.querySelector('html')!.setAttribute('data-dark-theme', 'dark_high_contrast')
      expect(getTheme()).toBe('dark_high_contrast')
    })

    it('should always default to light when no values are found', function () {
      document.querySelector('html')!.removeAttribute('data-color-mode')
      document.querySelector('html')!.removeAttribute('data-dark-theme')
      document.querySelector('html')!.removeAttribute('data-light-theme')
      expect(getTheme()).toBe('light')
    })
  })

  describe('chartConfig.getDefaultChartConfig', function () {
    it('should return the chart configuration for a given theme', function () {
      expect(getDefaultChartConfig(SeriesType.Time, 'light').scales?.x?.grid?.borderColor).toBe('#6e7781')
      expect(getDefaultChartConfig(SeriesType.Time, 'dark').scales?.x?.grid?.borderColor).toBe('#6e7681')
      expect(getDefaultChartConfig(SeriesType.Time, 'dark_dimmed').scales?.x?.grid?.borderColor).toBe('#636e7b')
      expect(getDefaultChartConfig(SeriesType.Time, 'dark_high_contrast').scales?.x?.grid?.borderColor).toBe('#9ea7b3')
    })

    it('should return chart options configured for light theme by default', function () {
      document.querySelector('html')!.removeAttribute('data-color-mode')
      document.querySelector('html')!.removeAttribute('data-dark-theme')
      document.querySelector('html')!.removeAttribute('data-light-theme')
      expect(getDefaultChartConfig(SeriesType.Categorical).scales?.x?.grid?.borderColor).toBe('#6e7781')
    })
  })

  describe('chartConfig.getDatasetConfig', function () {
    it('should return the color configuration for a given theme', function () {
      expect(getDatasetConfig('light')[0]!.borderColor).toBe('#0969da')
      expect(getDatasetConfig('dark')[0]!.borderColor).toBe('#1f6feb')
      expect(getDatasetConfig('dark_dimmed')[0]!.borderColor).toBe('#1f6feb')
      expect(getDatasetConfig('dark_high_contrast')[0]!.borderColor).toBe('#1f6feb')
    })

    it('should return chart colors configured for light theme by default', function () {
      document.querySelector('html')!.removeAttribute('data-color-mode')
      document.querySelector('html')!.removeAttribute('data-dark-theme')
      document.querySelector('html')!.removeAttribute('data-light-theme')
      expect(getDatasetConfig('dark_high_contrast')[0]!.borderColor).toBe('#1f6feb')
    })
  })

  it('render the component when any of observed properties changes', function () {
    const element = new BaseChartElement()
    const renderMethod = jest.spyOn(element, 'render')

    element.setAttribute('series', '')
    element.setAttribute('loading', '')
    element.setAttribute('error', '')
    element.setAttribute('masked', '')

    expect(renderMethod).toHaveBeenCalledTimes(4)
  })

  it('handleAttributeChanged: renders the component', function () {
    const element = new BaseChartElement()
    const renderMethod = jest.spyOn(element, 'render')

    element.handleAttributeChanged()
    expect(renderMethod).toHaveBeenCalledTimes(1)
  })

  describe('manipulate series attribute', function () {
    let element: BaseChartElement

    beforeEach(function () {
      element = new BaseChartElement()
      element.render = jest.fn()
      element.handleAttributeChanged = jest.fn()
    })
    afterEach(function () {
      jest.resetAllMocks()
    })

    it('set series attribute', function () {
      element.setAttribute(
        'series',
        '{"columns":[{"name":"Name","dataType":"string"},{"name":"Count","dataType":"int"}],"rows":[["Robin",10]],"isSensitive":false}',
      )
      expect(element.hasAttribute('series')).toBeTruthy()
    })

    it('get series attribute, unavailable', function () {
      expect(element.seriesData).toBeNull()
    })

    it('get series attribute, available', function () {
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

  describe('get seriesType', function () {
    it('returns time when no data is provided', function () {
      const element = new BaseChartElement()

      expect(element.seriesType).toBe('time')
    })

    it('returns time type when time series data is provided', function () {
      const element = new BaseChartElement()
      element.handleAttributeChanged = jest.fn()

      element.setAttribute(
        'series',
        `{"columns":[{"name":"Date","dataType":"datetimeoffset"}, {"name":"IssueCount","dataType":"int"}],"rows":[
        ["2020-01-01T18:49:53+00:00", 3],
        ["2020-01-02T18:49:53+00:00", 7],
        ["2020-01-03T18:49:53+00:00", 10],
        ["2020-01-04T18:49:53+00:00", 15],
        ["2020-01-01T18:49:53+00:00", 7],
        ["2020-01-02T18:49:53+00:00", 10],
        ["2020-01-03T18:49:53+00:00", 15],
        ["2020-01-01T18:49:53+00:00", 40],
        ["2020-01-02T18:49:53+00:00", 45],
        ["2020-01-03T18:49:53+00:00", 50],
        ["2020-01-01T18:49:53+00:00", 40],
        ["2020-01-02T18:49:53+00:00", 45],
        ["2020-01-03T18:49:53+00:00", 50]
      ]}`,
      )

      expect(element.seriesType).toBe('time')
    })

    it('returns categorical type when categorical series data is provided', function () {
      const element = new BaseChartElement()
      element.handleAttributeChanged = jest.fn()

      element.setAttribute(
        'series',
        `{"columns":[{"name":"Status","dataType":"nvarchar"},{"name":"Count","dataType":"int"},{"name":"InOrOut","dataType":"nvarchar"}],"rows":
        [["Backlog ⚪", 80, "Issues in"], [ "Backlog ⚪", 40,"Issues out"], ["Ready for Work  💻", 40, "Issues in"], [ "Ready for Work  💻", 30,"Issues out"], ["In Progress 🎉", 30, "Issues in"], ["In Progress 🎉", 20, "Issues out"], [ "In review 👀", 20,"Issues in"], ["In review 👀",19, "Issues out"], ["Done 🎉", 19, "Issues in"], ["Done 🎉", 0, "Issues out"]],"isSensitive":false}`,
      )

      expect(element.seriesType).toBe('categorical')
    })
  })

  describe('get colorCoding', function () {
    it('returns a value from the colorCoding attribute when set', function () {
      const element = new BaseChartElement()
      element.setAttribute(
        'color-coding',
        encodeURI(JSON.stringify({'In progress': {borderColor: '#005CC5', backgroundColor: '#D1BCF9'}})),
      )
      // converting to string for the assert
      expect(JSON.stringify(element.colorCoding)).toBe(
        JSON.stringify({
          'In progress': {
            borderColor: '#005CC5',
            backgroundColor: '#D1BCF9',
            borderWidth: 2,
            pointHoverBackgroundColor: '#D1BCF9',
            pointHoverBorderWidth: 2,
            pointHoverRadius: 3,
          },
        }),
      )
    })

    it('returns null when not available', function () {
      const element = new BaseChartElement()
      expect(element.colorCoding).toBeNull()
    })
  })

  describe('set colorCoding', function () {
    it('sets the "colorCoding" attribute with a non-null value', function () {
      const element = new BaseChartElement()
      element.colorCoding = {'In progress': {borderColor: '#005CC5', backgroundColor: '#D1BCF9'}}
      expect(decodeURI(element.getAttribute('color-coding') || '')).toBe(
        JSON.stringify({'In progress': {borderColor: '#005CC5', backgroundColor: '#D1BCF9'}}),
      )
    })

    it('deletes the "colorCoding" attribute when given a null value', function () {
      const element = new BaseChartElement()
      element.setAttribute(
        'color-coding',
        JSON.stringify({'In progress': {borderColor: '#005CC5', backgroundColor: '#D1BCF9'}}),
      )
      element.colorCoding = null
      expect(element.hasAttribute('color-coding')).toBeFalsy()
    })
  })

  describe('get loading', function () {
    let element = new BaseChartElement()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    it('returns true when loading attribute exists', function () {
      element = new BaseChartElement()
      element.setAttribute('loading', '')
      expect(element.loading).toBeTruthy()
    })

    it('returns false when loading attribute does not exist', function () {
      element = new BaseChartElement()
      expect(element.loading).toBeFalsy()
    })
  })

  describe('set loading', function () {
    let element = new BaseChartElement()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    it('with true sets the loading attribute', function () {
      element = new BaseChartElement()
      element.loading = true
      expect(element.hasAttribute('loading')).toBeTruthy()
    })

    it('with false deletes the loading attribute', function () {
      element = new BaseChartElement()
      element.setAttribute('loading', '')
      element.loading = false
      expect(element.hasAttribute('loading')).toBeFalsy()
    })
  })

  describe('get error', function () {
    let element = new BaseChartElement()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    it('returns value from error attribute', function () {
      element = new BaseChartElement()
      element.setAttribute('error', 'test error')
      expect('test error').toBe(element.error)
    })

    it('returns null when error attribute is not set', function () {
      element = new BaseChartElement()
      expect(null).toBe(element.error)
    })
  })

  describe('set error', function () {
    let element = new BaseChartElement()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    it('with a value sets the error attribute', function () {
      element = new BaseChartElement()
      element.error = 'test error'
      expect(encodeURI('test error')).toBe(element.getAttribute('error'))
    })

    it('with null deletes the error attribute', function () {
      element = new BaseChartElement()
      element.setAttribute('error', 'test error')
      element.error = null
      expect(element.hasAttribute('error')).toBeFalsy()
    })
  })

  describe('get masked', function () {
    let element = new BaseChartElement()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    it('returns false when loading attribute does not exist', function () {
      element = new BaseChartElement()
      expect(element.masked).toBeFalsy()
    })

    it('returns true when loading attribute exists', function () {
      element = new BaseChartElement()
      element.setAttribute('masked', '')
      expect(element.masked).toBeTruthy()
    })
  })

  describe('set masked', function () {
    let element = new BaseChartElement()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    it('with true sets the masked attribute', function () {
      element = new BaseChartElement()
      element.masked = true
      expect(element.hasAttribute('masked')).toBeTruthy()
    })

    it('with false deletes the masked attribute', function () {
      element = new BaseChartElement()
      element.setAttribute('masked', '')
      element.masked = false
      expect(element.hasAttribute('masked')).toBeFalsy()
    })
  })

  describe('test render method', function () {
    let element = new BaseChartElement()
    const mockValidateTimeSeriesInput = jest.spyOn(element, 'validateTimeSeriesInput')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.validateTimeSeriesInput = mockValidateTimeSeriesInput.mockReturnValue(true) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    element.handleAttributeChanged = jest.spyOn(element, 'handleAttributeChanged') as any

    afterEach(function () {
      jest.clearAllMocks()
    })

    it('renders loading state when loading attribute is set', function () {
      element = new BaseChartElement()

      element.loading = true
      expect(element.innerHTML.includes('Loading')).toBeTruthy()
    })

    it('renders error state when error attribute is set', function () {
      element = new BaseChartElement()

      element.error = 'test error'
      expect(element.innerHTML.includes('test error')).toBeTruthy()
    })

    it('renders masked state when masked attribute is set', function () {
      element = new BaseChartElement()

      element.masked = true
      expect(element.innerHTML.includes('Click to view')).toBeTruthy()
    })

    it('registers unmask as a click handler when masked attribute is set', function () {
      element = new BaseChartElement()
      jest.spyOn(element, 'addEventListener')

      element.masked = true

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const addEventListnerMock = (element.addEventListener as any).mock
      expect(addEventListnerMock.calls.length).toBe(1)
      expect(addEventListnerMock.calls[0][0]).toBe('click')
      expect(addEventListnerMock.calls[0][1]).toBe(element.unmask)
    })

    it('renders null state when null data is provided', function () {
      element = new BaseChartElement()
      element.render()

      // content validation
      expect(element.innerHTML.includes('No data available')).toBeTruthy()
    })

    it('renders null state when no data is provided', function () {
      element = new BaseChartElement()

      element.series = {
        columns: [
          {name: 'Date', dataType: 'datetimeoffset'},
          {name: 'IssueCount', dataType: 'int'},
          {name: 'Label', dataType: 'nvarchar'},
        ],
        rows: [],
        isSensitive: false,
      }

      element.colorCoding = {
        Done: {borderColor: '#5A32A3', backgroundColor: '#D1BCF9'},
      }

      element.render()
      expect(element.innerHTML.includes('No data available')).toBeTruthy()
    })

    it('renders the expected chart when given valid data', function () {
      element = new BaseChartElement()
      const renderMethod = jest.spyOn(element, 'render').mockReturnValue()

      element.setAttribute(
        'series',
        JSON.stringify({
          columns: [
            {Name: 'Date', dataType: 'datetimeoffset'},
            {name: 'IssueCount', dataType: 'int'},
            {name: 'Label', dataType: 'nvarchar'},
          ],
          rows: [
            ['2020-01-01T18:49:53+00:00', 2, 'Done'],
            ['2020-01-02T18:49:53+00:00', 7, 'Done'],
            ['2020-01-03T18:49:53+00:00', 10, 'Done'],
            ['2020-01-04T18:49:53+00:00', 15, 'Done'],
            ['2020-01-05T18:49:53+00:00', 25, 'Done'],
            ['2020-01-01T18:49:53+00:00', 7, 'In progress'],
            ['2020-01-02T18:49:53+00:00', 10, 'In progress'],
            ['2020-01-03T18:49:53+00:00', 15, 'In progress'],
            ['2020-01-04T18:49:53+00:00', 25, 'In progress'],
            ['2020-01-05T18:49:53+00:00', 32, 'In progress'],
            ['2020-01-01T18:49:53+00:00', 40, 'To do'],
            ['2020-01-02T18:49:53+00:00', 45, 'To do'],
            ['2020-01-03T18:49:53+00:00', 50, 'To do'],
            ['2020-01-04T18:49:53+00:00', 70, 'To do'],
            ['2020-01-05T18:49:53+00:00', 80, 'To do'],
            ['2020-01-01T18:49:53+00:00', 40, 'No status'],
            ['2020-01-02T18:49:53+00:00', 45, 'No status'],
            ['2020-01-03T18:49:53+00:00', 50, 'No status'],
            ['2020-01-04T18:49:53+00:00', 70, 'No status'],
            ['2020-01-05T18:49:53+00:00', 80, 'No status'],
          ],
          isSensitive: false,
        }),
      )

      element.setAttribute(
        'color-coding',
        JSON.stringify({
          Done: {borderColor: '#5A32A3', backgroundColor: '#D1BCF9'},
        }),
      )

      expect(renderMethod).toHaveBeenCalledTimes(2)
    })
  })

  describe('validateTimeSeriesInput', function () {
    it('returns true with correct data', function () {
      const dataToValidate = [
        ['Date', 'IssueCount', 'Label'],
        ['2020-01-01T18:49:53+00:00', 2, 'Done'],
        ['2020-01-02T18:49:53+00:00', 7, 'Done'],
        ['2020-01-03T18:49:53+00:00', 10, 'Done'],
        ['2020-01-04T18:49:53+00:00', 15, 'Done'],
        ['2020-01-05T18:49:53+00:00', 25, 'Done'],
        ['2020-01-06T18:49:53+00:00', 32, 'Done'],
        ['2020-01-07T18:49:53+00:00', 40, 'Done'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateTimeSeriesInput(dataToValidate)).toBeTruthy()
    })

    it('returns false when malformed with incorrect rows', function () {
      const dataToValidate = [
        ['Date', 'IssueCount', 'Label'],
        ['2020-01-01T18:49:53+00:00', 2],
        ['2020-01-02T18:49:53+00:00', 7, 'Done'],
        ['2020-01-03T18:49:53+00:00', 10, 'Done'],
        ['2020-01-04T18:49:53+00:00', 15, 'Done'],
        ['2020-01-05T18:49:53+00:00', 25, 'Done'],
        ['2020-01-06T18:49:53+00:00', 32, 'Done'],
        ['2020-01-07T18:49:53+00:00', 40, 'Done'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateTimeSeriesInput(dataToValidate)).toBe(false)
    })

    it('returns false when malformed with empty row data', function () {
      expect(validateTimeSeriesInput(null)).toBeFalsy()
    })

    it('returns false when formattedData contains an invalid date string in position [0] of any item', function () {
      expect(validateTimeSeriesInput(null)).toBeFalsy()
    })

    it('returns false when formattedData contains an invalid number in position [1] of any item', function () {
      expect(validateTimeSeriesInput(null)).toBeFalsy()
    })

    it('returns false when formattedData contains an anything other than a string in position [2] of any item', function () {
      expect(validateTimeSeriesInput(null)).toBeFalsy()
    })
  })

  describe('formatTimeSeriesData()', function () {
    it('returns the expected dataset format', function () {
      const element = new BaseChartElement()
      const data: SeriesData = [
        ['2020-01-01T18:49:53+00:00', 2, 'Done'],
        ['2020-01-02T18:49:53+00:00', 7, 'Done'],
        ['2020-01-03T18:49:53+00:00', 10, 'Done'],
        ['2020-01-04T18:49:53+00:00', 15, 'Done'],
        ['2020-01-05T18:49:53+00:00', 25, 'Done'],
        ['2020-01-06T18:49:53+00:00', 32, 'Done'],
        ['2020-01-07T18:49:53+00:00', 40, 'Done'],
        ['2020-01-08T18:49:53+00:00', 43, 'Done'],
        ['2020-01-09T18:49:53+00:00', 50, 'Done'],
        ['2020-01-10T18:49:53+00:00', 60, 'Done'],
        ['2020-01-11T18:49:53+00:00', 65, 'Done'],
        ['2020-01-12T18:49:53+00:00', 65, 'Done'],
        ['2020-01-13T18:49:53+00:00', 65, 'Done'],
        ['2020-01-14T18:49:53+00:00', 76, 'Done'],
        ['2020-01-01T18:49:53+00:00', 7, 'In progress'],
        ['2020-01-02T18:49:53+00:00', 10, 'In progress'],
        ['2020-01-03T18:49:53+00:00', 15, 'In progress'],
        ['2020-01-04T18:49:53+00:00', 25, 'In progress'],
        ['2020-01-05T18:49:53+00:00', 32, 'In progress'],
        ['2020-01-06T18:49:53+00:00', 40, 'In progress'],
        ['2020-01-07T18:49:53+00:00', 43, 'In progress'],
        ['2020-01-08T18:49:53+00:00', 50, 'In progress'],
        ['2020-01-09T18:49:53+00:00', 60, 'In progress'],
        ['2020-01-10T18:49:53+00:00', 65, 'In progress'],
        ['2020-01-11T18:49:53+00:00', 65, 'In progress'],
        ['2020-01-12T18:49:53+00:00', 65, 'In progress'],
        ['2020-01-13T18:49:53+00:00', 76, 'In progress'],
        ['2020-01-14T18:49:53+00:00', 76, 'In progress'],
        ['2020-01-01T18:49:53+00:00', 40, 'To do'],
        ['2020-01-02T18:49:53+00:00', 45, 'To do'],
        ['2020-01-03T18:49:53+00:00', 50, 'To do'],
        ['2020-01-04T18:49:53+00:00', 70, 'To do'],
        ['2020-01-05T18:49:53+00:00', 80, 'To do'],
        ['2020-01-06T18:49:53+00:00', 85, 'To do'],
        ['2020-01-07T18:49:53+00:00', 85, 'To do'],
        ['2020-01-08T18:49:53+00:00', 85, 'To do'],
        ['2020-01-09T18:49:53+00:00', 85, 'To do'],
        ['2020-01-10T18:49:53+00:00', 85, 'To do'],
        ['2020-01-11T18:49:53+00:00', 85, 'To do'],
        ['2020-01-12T18:49:53+00:00', 85, 'To do'],
        ['2020-01-13T18:49:53+00:00', 85, 'To do'],
        ['2020-01-14T18:49:53+00:00', 85, 'To do'],
        ['2020-01-01T18:49:53+00:00', 40, 'No status'],
        ['2020-01-02T18:49:53+00:00', 45, 'No status'],
        ['2020-01-03T18:49:53+00:00', 50, 'No status'],
        ['2020-01-04T18:49:53+00:00', 70, 'No status'],
        ['2020-01-05T18:49:53+00:00', 80, 'No status'],
        ['2020-01-06T18:49:53+00:00', 85, 'No status'],
        ['2020-01-07T18:49:53+00:00', 85, 'No status'],
        ['2020-01-08T18:49:53+00:00', 85, 'No status'],
        ['2020-01-09T18:49:53+00:00', 85, 'No status'],
        ['2020-01-10T18:49:53+00:00', 85, 'No status'],
        ['2020-01-11T18:49:53+00:00', 85, 'No status'],
        ['2020-01-12T18:49:53+00:00', 85, 'No status'],
        ['2020-01-13T18:49:53+00:00', 85, 'No status'],
        ['2020-01-14T18:49:53+00:00', 85, 'No status'],
      ]

      const formattedData = element.formatTimeSeriesData(data, '')

      expect(formattedData).toStrictEqual({
        datasets: [
          {
            label: 'Done',
            fill: false,
            data: [2, 7, 10, 15, 25, 32, 40, 43, 50, 60, 65, 65, 65, 76],
            borderColor: '#0969da',
            backgroundColor: '#ddf4ff',
            borderWidth: 2,
            pointHoverBackgroundColor: '#0969da',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#0969da',
            pointBorderColor: '#0969da',
            pointHoverBorderColor: '#0969da',
          },
          {
            label: 'In progress',
            fill: false,
            data: [7, 10, 15, 25, 32, 40, 43, 50, 60, 65, 65, 65, 76, 76],
            borderColor: '#2da44e',
            backgroundColor: '#dafbe1',
            borderWidth: 2,
            pointHoverBackgroundColor: '#2da44e',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#2da44e',
            pointBorderColor: '#2da44e',
            pointHoverBorderColor: '#2da44e',
          },
          {
            label: 'To do',
            fill: false,
            data: [40, 45, 50, 70, 80, 85, 85, 85, 85, 85, 85, 85, 85, 85],
            borderColor: '#e16f24',
            backgroundColor: '#fff1e5',
            borderWidth: 2,
            pointHoverBackgroundColor: '#e16f24',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#e16f24',
            pointBorderColor: '#e16f24',
            pointHoverBorderColor: '#e16f24',
          },
          {
            label: 'No status',
            fill: false,
            data: [40, 45, 50, 70, 80, 85, 85, 85, 85, 85, 85, 85, 85, 85],
            borderColor: '#bf3989',
            backgroundColor: '#ffeff7',
            borderWidth: 2,
            pointHoverBackgroundColor: '#bf3989',
            pointHoverBorderWidth: 1,
            pointHoverRadius: 3,
            pointBackgroundColor: '#bf3989',
            pointBorderColor: '#bf3989',
            pointHoverBorderColor: '#bf3989',
          },
        ],
        labels: [
          '2020-01-01T18:49:53+00:00',
          '2020-01-02T18:49:53+00:00',
          '2020-01-03T18:49:53+00:00',
          '2020-01-04T18:49:53+00:00',
          '2020-01-05T18:49:53+00:00',
          '2020-01-06T18:49:53+00:00',
          '2020-01-07T18:49:53+00:00',
          '2020-01-08T18:49:53+00:00',
          '2020-01-09T18:49:53+00:00',
          '2020-01-10T18:49:53+00:00',
          '2020-01-11T18:49:53+00:00',
          '2020-01-12T18:49:53+00:00',
          '2020-01-13T18:49:53+00:00',
          '2020-01-14T18:49:53+00:00',
        ],
      })
    })
  })

  it('formatCategoricalData(): returns the expected dataset format', function () {
    const element = new BaseChartElement()
    const data: SeriesData = [
      ['Backlog ⚪', 80, 'Issues in'],
      ['Backlog ⚪', 40, 'Issues out'],
      ['Ready for Work  💻', 40, 'Issues in'],
      ['Ready for Work  💻', 30, 'Issues out'],
      ['In Progress 🎉', 30, 'Issues in'],
      ['In Progress 🎉', 20, 'Issues out'],
      ['In review 👀', 20, 'Issues in'],
      ['In review 👀', 19, 'Issues out'],
      ['Done 🎉', 19, 'Issues in'],
      ['Done 🎉', 0, 'Issues out'],
    ]

    const formattedData = element.formatCategoricalData(data, '')

    expect(formattedData).toStrictEqual({
      datasets: [
        {
          label: 'Issues in',
          fill: false,
          data: [80, 40, 30, 20, 19],
          borderColor: '#0969da',
          backgroundColor: '#ddf4ff',
          borderWidth: 2,
          pointHoverBackgroundColor: '#0969da',
          pointHoverBorderWidth: 1,
          pointHoverRadius: 3,
          pointBackgroundColor: '#0969da',
          pointBorderColor: '#0969da',
          pointHoverBorderColor: '#0969da',
        },
        {
          label: 'Issues out',
          fill: false,
          data: [40, 30, 20, 19, 0],
          borderColor: '#2da44e',
          backgroundColor: '#dafbe1',
          borderWidth: 2,
          pointHoverBackgroundColor: '#2da44e',
          pointHoverBorderWidth: 1,
          pointHoverRadius: 3,
          pointBackgroundColor: '#2da44e',
          pointBorderColor: '#2da44e',
          pointHoverBorderColor: '#2da44e',
        },
      ],
      labels: ['Backlog ⚪', 'Ready for Work  💻', 'In Progress 🎉', 'In review 👀', 'Done 🎉'],
    })
  })

  describe('validateCategoricalInput', function () {
    it('returns true with correct data', function () {
      const dataToValidate: SeriesData = [
        ['Date', 'IssueCount', 'Label'],
        ['Day 1', 2, 'Done'],
        ['Day 2', 7, 'Done'],
        ['Day 3', 10, 'Done'],
        ['Day 4', 15, 'Done'],
        ['Day 5', 25, 'Done'],
        ['Day 6', 32, 'Done'],
        ['Day 7', 40, 'Done'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateCategoricalInput(dataToValidate)).toBeTruthy()
    })

    it('returns true with null values in position [1]', function () {
      const dataToValidate: SeriesData = [
        ['Date', 'IssueCount', 'Label'],
        ['Day 1', null, 'Done'],
        ['Day 2', 7, 'Done'],
        ['Day 3', 10, 'Done'],
        ['Day 4', 15, 'Done'],
        ['Day 5', 25, 'Done'],
        ['Day 6', null, 'Done'],
        ['Day 7', null, 'Done'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateCategoricalInput(dataToValidate)).toBe(true)
    })

    it('returns false with non-numerical values in position [1]', function () {
      const dataToValidate = [
        ['Date', 'IssueCount', 'Label'],
        ['Day 1', '2', 'Done'],
        ['Day 2', 7, 'Done'],
        ['Day 3', 10, 'Done'],
        ['Day 4', 15, 'Done'],
        ['Day 5', 25, 'Done'],
        ['Day 6', 32, 'Done'],
        ['Day 7', 40, 'Done'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateCategoricalInput(dataToValidate)).toBe(false)
    })

    it('returns true with no third column data', function () {
      const dataToValidate: SeriesData = [
        ['Date', 'IssueCount'],
        ['Day 1', 2],
        ['Day 2', 7],
        ['Day 3', 10],
        ['Day 4', 15],
        ['Day 5', 25],
        ['Day 6', 32],
        ['Day 7', 40],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateCategoricalInput(dataToValidate)).toBe(true)
    })

    it('returns false with non-string values in position [2]', function () {
      const dataToValidate = [
        ['Date', 'IssueCount', 'Label'],
        ['Day 1', 2, 1234],
        ['Day 2', 7, 'Done'],
        ['Day 3', 10, 'Done'],
        ['Day 4', 15, 'Done'],
        ['Day 5', 25, 'Done'],
        ['Day 6', 32, 'Done'],
        ['Day 7', 40, 'Done'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any as SeriesData

      expect(validateCategoricalInput(dataToValidate)).toBe(false)
    })
  })

  describe('forecastIndex', function () {
    const labels = new Set<string>()
    labels.add('2020-01-01T18:49:53+00:00')
    labels.add('2020-01-02T18:49:53+00:00')
    labels.add('2020-01-03T18:49:53+00:00')
    labels.add('2020-01-04T18:49:53+00:00')
    labels.add('2020-01-05T18:49:53+00:00')
    labels.add('2020-01-06T18:49:53+00:00')
    labels.add('2020-01-07T18:49:53+00:00')

    it('find index with a full match of dates', function () {
      const forecastStartdate = '2020-01-04T18:49:53+00:00'
      expect(forecastIndex(labels, forecastStartdate)).toBe(3)
    })

    it('find index without a full match of dates', function () {
      const forecastStartdate = '2020-01-04T19:49:53+00:00'
      expect(forecastIndex(labels, forecastStartdate)).toBe(4)
    })

    it('find index with a match of dates in different format', function () {
      const forecastStartdate = 'Sat Jan 04 2020 10:49:53 GMT-0800 (Pacific Standard Time)'
      expect(forecastIndex(labels, forecastStartdate)).toBe(3)
    })

    it('not found index', function () {
      const forecastStartdate = '2020-01-14T18:49:53+00:00'
      expect(forecastIndex(labels, forecastStartdate)).toBe(-1)
    })

    it('not found index with null forecastStartdate', function () {
      expect(forecastIndex(labels, null)).toBe(-1)
    })
  })

  describe('forecasted', function () {
    it('-1 index', function () {
      expect(forecasted(0, -1)).toBe(false)
    })

    it('index > -1 and = currentIndex', function () {
      expect(forecasted(0, 0)).toBe(true)
    })

    it('index > -1 and < currentIndex', function () {
      expect(forecasted(1, 0)).toBe(true)
    })

    it('index > -1 and > currentIndex', function () {
      expect(forecasted(1, 5)).toBe(false)
    })
  })
})

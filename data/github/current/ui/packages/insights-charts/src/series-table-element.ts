/* eslint github/unescaped-html-literal: off */

import nullTemplate from '../shared/null-template'
import errorTemplate from '../shared/error-template'
import loadingTemplate from '../shared/loading-template'
import maskedTemplate from '../shared/masked-template'
import DOMPurify from 'dompurify'

interface Column {
  name: string
  dataType: string
}

interface Data {
  columns: Column[]
  rows: Array<Array<string | number | boolean>>
  isSensitive: boolean
}

class SeriesTableElement extends HTMLElement {
  connectedCallback(): void {
    this.render()
  }

  static get observedAttributes(): string[] {
    return ['series', 'error', 'loading', 'masked', 'is-time-series', 'forecast-start-date']
  }

  // called from changes on observedAttributes attributes
  // HACK: separating out the handler into a separate function so that it can be stubbed
  // in tests. for some reason this method isn't able to be stubbed directly :(
  attributeChangedCallback(): void {
    this.handleAttributeChanged()
  }

  // HACK: this handler is separated into a separate function from attributeChangedCallback
  // so that the behavior can be stubbed in tests :(
  handleAttributeChanged(): void {
    this.render()
  }

  get forecastStartDate(): Date | null {
    const forecastStartDate = this.getAttribute('forecast-start-date')
    if (forecastStartDate) {
      const date = new Date(forecastStartDate)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    return null
  }

  render(): void {
    this.textContent = ''
    if (this.error || this.error === '') {
      this.innerHTML = errorTemplate(undefined, this.error === '' ? undefined : this.error)
      return
    } else if (this.loading) {
      this.innerHTML = loadingTemplate
      return
    } else if (this.masked) {
      this.innerHTML = maskedTemplate
      this.addEventListener('click', this.unmask)
      return
    }

    const data = this.seriesData
    if (!data) {
      this.innerHTML = nullTemplate
      return
    }

    if (!this.validateInput()) {
      this.innerHTML = errorTemplate(
        undefined,
        Array.isArray(data) && data.filter(d => d[1] === null).length > 0
          ? 'Data cannot contain null values'
          : undefined,
      )
      throw new SeriesTableError('Malformed input. Failed to render component')
    }

    let header = '<thead><tr>'
    const [firstItem] = data
    if (firstItem) {
      for (const element of firstItem) {
        header += `<th>${element}</th>`
      }
    }
    if (this.isTimeSeries && this.forecastStartDate) {
      header += '<th>Is Forecasted</th>'
    }
    header += '</tr></thead>'

    let body = '<tbody>'

    for (const row of data.slice(1)) {
      body += '<tr>'

      // eslint-disable-next-line github/array-foreach
      row.forEach((cell, i) => {
        if (this.isTimeSeries && cell !== null && i === 0) {
          body += `<td>${new Date(cell).toLocaleString()}</td>`
        } else {
          body += `<td>${cell}</td>`
        }
      })

      if (this.isTimeSeries && this.forecastStartDate) {
        const isForecasted = new Date(String(row[0])) >= this.forecastStartDate
        body += `<td>${isForecasted}</td>`
      }
      body += '</tr>'
    }
    body += '</tbody>'

    // Clean the table so no XSS can be rendered.
    // To check that this is working, see "XSS Attempt" in components/sandbox
    const dirtyTable = `<table>${header}${body}</table>`
    const cleanTable = DOMPurify.sanitize(dirtyTable, {
      ALLOWED_TAGS: ['a', 'table', 'th', 'thead', 'tbody', 'td', 'tr'],
      ALLOWED_ATTR: ['href'],
    })

    this.innerHTML = cleanTable
  }

  get series(): Data | null {
    const data = this.getAttribute('series')

    if (data) {
      return JSON.parse(decodeURI(data))
    }
    return null
  }

  set series(val: Data | null) {
    if (val) {
      this.setAttribute('series', encodeURI(JSON.stringify(val)))
    } else {
      this.removeAttribute('series')
    }
  }

  get seriesData(): string[][] | null {
    const data = this.series
    if (data) {
      if (data.columns === undefined || data.rows === undefined) {
        throw new SeriesTableError('Malformed input. Failed to render component')
      }
      return [data.columns.map(d => d.name), ...data.rows] as string[][]
    }
    return null
  }

  get isTimeSeries(): boolean {
    return this.hasAttribute('is-time-series')
  }

  get error(): string | null {
    const error = this.getAttribute('error')
    if (error || error === '') {
      return decodeURI(error)
    }
    return null
  }

  set error(val: string | null) {
    if (val || val === '') {
      this.setAttribute('error', encodeURI(val))
    } else {
      this.removeAttribute('error')
    }
  }

  get loading(): boolean {
    return this.hasAttribute('loading')
  }

  set loading(val: boolean) {
    if (val) {
      this.setAttribute('loading', '')
    } else {
      this.removeAttribute('loading')
    }
  }

  get masked(): boolean {
    return this.hasAttribute('masked')
  }

  set masked(val: boolean) {
    if (val) {
      this.setAttribute('masked', '')
    } else {
      this.removeAttribute('masked')
    }
  }

  // check if the data input has a valid structure
  validateInput(): boolean {
    return validateInput(this.seriesData)
  }

  unmask(): void {
    this.removeEventListener('click', this.unmask)
    this.masked = false
  }
}

class SeriesTableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SeriesTableError'
  }
}

function RegisterSeriesTable() {
  if (!window.customElements.get('series-table')) {
    window.customElements.define('series-table', SeriesTableElement)
  }
}

function validateInput(input: string[][] | null): boolean {
  const dataToValidate = input

  if (!dataToValidate) {
    return false
  }

  const slicedData = dataToValidate.slice(1)
  let valid = true

  for (const element of slicedData) {
    // check for an empty row
    if (element.length === 0) {
      valid = false
    }

    // check for size of a row not matching the header's size
    if (element.length !== dataToValidate[0]?.length) {
      valid = false
      break
    }
  }

  return valid
}

// eslint-disable-next-line custom-elements/no-exports-with-element
export {SeriesTableElement, SeriesTableError, RegisterSeriesTable, validateInput}

import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import type {RadioRange} from '../ExportButton'
import {ExportButton, ExportType} from '../ExportButton'
import {mockFetch} from '@github-ui/mock-fetch'
import {format, formatISO} from 'date-fns'
import {getAuditLogExportLogsProps} from '../test-utils/mock-data'

test('Renders Web ExportButton', () => {
  const props = {
    exportUrl: 'https://example.com/web',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  render(<ExportButton {...props} />)
  expect(screen.getByTestId('web-export-dialog-button')).toBeInTheDocument()
})

test('Renders Git ExportButton', () => {
  const props = {
    exportUrl: 'https://example.com/git',
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: () => {},
  }
  render(<ExportButton {...props} />)
  expect(screen.getByTestId('git-export-dialog-button')).toBeInTheDocument()
})

test('Renders dialog for a Web ExportButton', async () => {
  const props = {
    exportUrl: 'https://example.com/web',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')

  expect(screen.getByText('Export Application Events')).toBeInTheDocument()
  expect(screen.getByText('App events data is limited to activity from the last 180 days')).toBeInTheDocument()
  expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  expect(screen.getByText('Select an export format')).toBeInTheDocument()
  expect(screen.getByText('Select an export range')).toBeInTheDocument()
  expect(screen.getByTestId('web-export-button')).toBeInTheDocument()
})

test('Renders dialog for a Git ExportButton', async () => {
  const props = {
    exportUrl: 'https://example.com/git',
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: () => {},
  }
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('git-export-dialog-button'))
  await screen.findByRole('dialog')

  expect(screen.getByText('Export Git Activity')).toBeInTheDocument()
  expect(screen.getByText('Git activity data is limited to activity from the last 7 days')).toBeInTheDocument()
  expect(screen.getByText('Select an export range')).toBeInTheDocument()
  expect(screen.getByTestId('git-export-button')).toBeInTheDocument()
})

test('Submits web export form data', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('web-export-button')
  expect(exportButton).toBeInTheDocument()
  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  const d = new Date()
  d.setDate(d.getDate() - 7)
  const query = `created:>${formatISO(d, {representation: 'date'})}`

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(body.get('q')).toEqual(query)
  expect(body.get('export_format')).toEqual('json')
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Submits git export form data', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('git-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('git-export-button')
  expect(exportButton).toBeInTheDocument()
  await user.click(exportButton)

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Submits entries in search bar for web exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('web-export-button')
  expect(exportButton).toBeInTheDocument()
  const searchBar = screen.getByTestId('search-bar')
  expect(searchBar).toBeInTheDocument()
  await user.type(searchBar, 'actor:darcy')
  expect(searchBar).toHaveValue('actor:darcy')
  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  const d = new Date()
  d.setDate(d.getDate() - 7)
  const query = `created:>${formatISO(d, {representation: 'date'})} actor:darcy`

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(body.get('q')).toEqual(query)
  expect(body.get('export_format')).toEqual('json')
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Does not support search bar for git exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('git-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('git-export-button')
  expect(exportButton).toBeInTheDocument()
  const searchBar = screen.queryByTestId('search-bar')
  expect(searchBar).toBeNull()
  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  const d = new Date()
  d.setDate(d.getDate() - 7)

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(body.get('q')).toBeNull()
})

test('Submits CSV in web form', async () => {
  // expect(screen.getByRole('radio', {name: 'Public'})).toBeChecked()
  const props = {
    exportUrl: '',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('web-export-button')
  expect(exportButton).toBeInTheDocument()
  const radio = screen.getByTestId('csv-radio')
  await user.click(radio)
  expect(radio).toBeChecked()
  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  const d = new Date()
  d.setDate(d.getDate() - 7)
  const query = `created:>${formatISO(d, {representation: 'date'})}`

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(body.get('q')).toEqual(query)
  expect(body.get('export_format')).toEqual('csv')
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Submits 30 day date range for web exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('web-export-button')
  expect(exportButton).toBeInTheDocument()
  const radio = screen.getByTestId('second-radio')
  await user.click(radio)
  expect(radio).toBeChecked()
  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  const d = new Date()
  d.setDate(d.getDate() - 30)
  const query = `created:>${formatISO(d, {representation: 'date'})}`

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(body.get('q')).toEqual(query)
  expect(body.get('export_format')).toEqual('json')
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Submits 3 day date range for git exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('git-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('git-export-button')
  expect(exportButton).toBeInTheDocument()
  const radio = screen.getByTestId('second-radio')
  await user.click(radio)
  expect(radio).toBeChecked()
  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  let d = new Date()
  d.setDate(d.getDate() - 3)
  const startDate = `${formatISO(d, {representation: 'date'})}`
  d = new Date()
  const endDate = `${formatISO(d, {representation: 'date'})}`

  expect(mockFetch.fetch).toHaveBeenCalled()

  const start = body.get('start')
  const end = body.get('end')
  expect(start).toEqual(startDate)
  expect(end).toEqual(endDate)
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Submits custom date range for web exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('web-export-button')
  expect(exportButton).toBeInTheDocument()

  const datePickerButton = screen.getByTestId('anchor-button')
  expect(datePickerButton).toBeInTheDocument()
  await user.click(datePickerButton)
  expect(screen.getByTestId('datepicker-panel')).toBeInTheDocument()

  const today = new Date()
  const startDateCell = screen.getByTestId(`day-${format(today, 'MM/dd/yyyy')}`)
  expect(startDateCell).toBeInTheDocument()
  await user.click(startDateCell)
  await user.click(startDateCell)

  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  const query = `created:${formatISO(today, {representation: 'date'})}..${formatISO(today, {
    representation: 'date',
  })}`

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(body.get('q')).toEqual(query)
  expect(body.get('export_format')).toEqual('json')
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Submits custom date range for git exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: () => {},
  }
  mockFetch.mockRouteOnce(props.exportUrl, {errors: [], exports: getAuditLogExportLogsProps().exports})
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('git-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('git-export-button')
  expect(exportButton).toBeInTheDocument()

  const datePickerButton = screen.getByTestId('anchor-button')
  expect(datePickerButton).toBeInTheDocument()
  await user.click(datePickerButton)
  expect(screen.getByTestId('datepicker-panel')).toBeInTheDocument()

  const today = new Date()
  const startDateCell = screen.getByTestId(`day-${format(today, 'MM/dd/yyyy')}`)
  expect(startDateCell).toBeInTheDocument()
  await user.click(startDateCell)
  await user.click(startDateCell)

  await user.click(exportButton)

  const body = mockFetch.fetch.mock.calls[0][1].body
  expect(mockFetch.fetch).toHaveBeenCalled()
  const start = body.get('start')
  const end = body.get('end')
  const startDate = `${formatISO(today, {representation: 'date'})}`
  expect(start).toEqual(startDate)
  expect(end).toEqual(startDate)
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.exportUrl)
})

test('Calls onSubmit handler with newly created exports', async () => {
  const props = {
    exportUrl: '',
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: jest.fn(),
  }
  const response = {errors: [], exports: getAuditLogExportLogsProps().exports}
  mockFetch.mockRouteOnce(props.exportUrl, response)
  const {user} = render(<ExportButton {...props} />)

  user.click(screen.getByTestId('web-export-dialog-button'))
  await screen.findByRole('dialog')
  const exportButton = screen.getByTestId('web-export-button')
  await user.click(exportButton)
  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(props.onSubmit.mock.calls).toHaveLength(1)
  expect(props.onSubmit.mock.calls[0][0]).toBe(response)
})

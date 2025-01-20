import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AuditLogExportLogs} from '../AuditLogExportLogs'
import {getAuditLogExportLogsProps} from '../test-utils/mock-data'
import {mockFetch} from '@github-ui/mock-fetch'

test('AuditLogExportLogs renders correctly', () => {
  const props = getAuditLogExportLogsProps()
  render(<AuditLogExportLogs {...props} />)
  expect(screen.getByText('Export Git activity')).toBeInTheDocument()
  expect(screen.getByTestId('git-export-dialog-button')).toBeInTheDocument()
  expect(screen.getByText('Export application events')).toBeInTheDocument()
  expect(screen.getByTestId('web-export-dialog-button')).toBeInTheDocument()
  expect(screen.getByText('Export history')).toBeInTheDocument()
})

test('AuditLogExportLogs does not render Export Git button if disabled', () => {
  const props = getAuditLogExportLogsProps()
  props.showGitExportButton = false
  render(<AuditLogExportLogs {...props} />)
  expect(screen.queryByText('Export Git activity')).not.toBeInTheDocument()
  expect(screen.queryByTestId('git-export-dialog-button')).not.toBeInTheDocument()
})

test('AuditLogExportLogs shows when there are no exports', () => {
  const props = {
    exports: [],
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
    showGitExportButton: true,
  }
  render(<AuditLogExportLogs {...props} />)
  expect(screen.getByTestId('missing-exports-message')).toHaveTextContent(`We couldn't find any exports.`)
})

test('AuditLogExportLogs renders a list of exports', () => {
  const props = getAuditLogExportLogsProps()
  render(<AuditLogExportLogs {...props} />)
  expect(screen.queryByText(`We couldn't find any exports`)).not.toBeInTheDocument()
  expect(screen.getByTestId('export-0')).toBeInTheDocument()
  expect(screen.getByTestId('export-1')).toBeInTheDocument()
  expect(screen.queryByTestId('export-2')).not.toBeInTheDocument()
})

test('When submitting an export, the newly created one gets added to the list', async () => {
  const props = getAuditLogExportLogsProps()
  props.webExportUrl = 'http://localhost'
  const {user} = render(<AuditLogExportLogs {...props} />)
  expect(screen.getByTestId('export-0')).toBeInTheDocument()
  expect(screen.getByTestId('export-1')).toBeInTheDocument()

  // there are only two exports so there should not be a third
  expect(screen.queryByTestId('export-2')).not.toBeInTheDocument()

  const dialogButton = screen.getByTestId('web-export-dialog-button')
  await user.click(dialogButton)

  const dialog = await screen.findByRole('dialog')
  expect(dialog).toBeVisible()

  const newExport = {
    actor_name: 'chester-cheeto',
    actor_url: 'fake.github.url',
    export_type: 'web export',
    created_at: 'Fri, 23 Mar 2024 20:46:30.000000000 UTC +00:00',
    query_phrase: 'From January 11, 2024 to January 12, 2024',
    format_type: 'json',
    completed: true,
    expired: false,
    pending: false,
    total_chunks: 1,
    export_id: '43',
  }

  const response = {errors: [], exports: [newExport]}
  mockFetch.mockRouteOnce(props.webExportUrl, response)

  const exportButton = screen.getByTestId('web-export-button')
  await user.click(exportButton)

  expect(mockFetch.fetch).toHaveBeenCalled()
  expect(mockFetch.fetch.mock.calls[0][0]).toEqual(props.webExportUrl)
  expect(screen.getByTestId('export-0')).toBeInTheDocument()
  expect(screen.getByTestId('export-1')).toBeInTheDocument()

  // now the moment of truth, is there a new export in the document???
  expect(screen.getByTestId('export-2')).toBeInTheDocument()
})

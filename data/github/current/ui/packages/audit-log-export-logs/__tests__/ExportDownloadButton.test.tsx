import {screen, fireEvent, within} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AuditLogExportLogs} from '../AuditLogExportLogs'
import {downloadUrlBuilder, ExportDownloadButton} from '../ExportDownloadButton'

test('ExportDownloadButton shows preparing export message for pending export', () => {
  const props = {
    item: {
      actor_name: 'monalisa',
      actor_url: 'fake.github.url',
      export_type: 'web export',
      created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
      query_phrase: 'Query: ""',
      format_type: 'JSON',
      completed: false,
      expired: false,
      pending: true,
      total_chunks: 0,
      export_id: '42',
    },
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
  }

  render(<ExportDownloadButton {...props} />)
  expect(screen.getByTestId('preparing-export')).toBeInTheDocument()
})

test('ExportDownloadButton shows expired message for old, incomplete export', () => {
  const props = {
    item: {
      actor_name: 'monalisa',
      actor_url: 'fake.github.url',
      export_type: 'web export',
      created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
      query_phrase: 'Query: ""',
      format_type: 'JSON',
      completed: false,
      expired: false,
      pending: false,
      total_chunks: 0,
      export_id: '42',
    },
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
  }
  render(<ExportDownloadButton {...props} />)
  expect(screen.getByTestId('expired-pending')).toBeInTheDocument()
})

test('ExportDownloadButton shows expired message for old, complete export', () => {
  const props = {
    item: {
      actor_name: 'monalisa',
      actor_url: 'fake.github.url',
      export_type: 'web export',
      created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
      query_phrase: 'Query: ""',
      format_type: 'JSON',
      completed: true,
      expired: true,
      pending: false,
      total_chunks: 0,
      export_id: '42',
    },
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
  }
  render(<ExportDownloadButton {...props} />)
  expect(screen.getByTestId('expired-complete')).toBeInTheDocument()
})

test('ExportDownloadButton shows download button for complete, recent export', () => {
  const props = {
    item: {
      actor_name: 'monalisa',
      actor_url: 'fake.github.url',
      export_type: 'web export',
      created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
      query_phrase: 'Query: ""',
      format_type: 'JSON',
      completed: true,
      expired: false,
      pending: false,
      total_chunks: 0,
      export_id: '42',
    },
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
  }
  render(<ExportDownloadButton {...props} />)
  expect(screen.getByTestId('download-button')).toBeInTheDocument()
})

test('ExportDownloadButton shows triangle down icon for exports with chunks', () => {
  const props = {
    exports: [
      {
        actor_name: 'monalisa',
        actor_url: 'fake.github.url',
        export_type: 'web export',
        created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
        query_phrase: 'Query: ""',
        format_type: 'JSON',
        completed: true,
        expired: false,
        pending: false,
        total_chunks: 5,
        export_id: '42',
      },
    ],
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
    showGitExportButton: true,
  }
  // NOTE - this has to be rendered in AuditLogExportLogs because it needs the container for some reason
  render(<AuditLogExportLogs {...props} />)
  const downloadButton = screen.getByTestId('download-button')
  expect(downloadButton).toBeInTheDocument()
  const icon = within(downloadButton).getByRole('img', {hidden: true})
  expect(icon).toHaveClass('octicon-triangle-down')
})

test('ExportDownloadButton does not show triangle down icon for exports without chunks', () => {
  const props = {
    exports: [
      {
        actor_name: 'monalisa',
        actor_url: 'fake.github.url',
        export_type: 'web export',
        created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
        query_phrase: 'Query: ""',
        format_type: 'JSON',
        completed: true,
        expired: false,
        pending: false,
        total_chunks: 0,
        export_id: '42',
      },
    ],
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
    showGitExportButton: true,
  }
  // NOTE - this is being rendered in AuditLogExportLogs for parity with the previous test
  render(<AuditLogExportLogs {...props} />)
  const downloadButton = screen.getByTestId('download-button')
  expect(downloadButton).toBeInTheDocument()
  const icon = within(downloadButton).queryByRole('img', {hidden: true})
  expect(icon).not.toBeInTheDocument()
})

test('ExportDownloadButton shows a link for downloading each item for exports with chunks', () => {
  const props = {
    exports: [
      {
        actor_name: 'monalisa',
        actor_url: 'fake.github.url',
        export_type: 'web export',
        created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
        query_phrase: 'Query: ""',
        format_type: 'JSON',
        completed: true,
        expired: false,
        pending: false,
        total_chunks: 5,
        export_id: '42',
      },
    ],
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
    showGitExportButton: true,
  }
  // NOTE - this has to be rendered in AuditLogExportLogs because it needs the container for some reason
  render(<AuditLogExportLogs {...props} />)
  const downloadButton = screen.getByTestId('download-button')
  expect(downloadButton).toBeInTheDocument()
  fireEvent.click(downloadButton)
  screen.getByTestId('download-item-0')
  screen.getByTestId('download-item-1')
  screen.getByTestId('download-item-2')
  screen.getByTestId('download-item-3')
  screen.getByTestId('download-item-4')
})

test('The downloadUrlBuilder returns a function', () => {
  const builder = downloadUrlBuilder('https://github.com', {})
  expect(builder).toBeInstanceOf(Function)
})

test('The downloadUrlBuilder returns a function that creates urls', () => {
  const baseUrl = 'https://github.com'
  const defaultParams = {
    first: 'first',
  }
  const builder = downloadUrlBuilder(baseUrl, defaultParams)
  const url = builder({second: 'second'})
  expect(url).toEqual(`${baseUrl}/?first=first&second=second`)
})

test('The downloadUrlBuilder returns a builder that includes defaults if called multiple times but not previous calls params', () => {
  const baseUrl = 'https://github.com'
  const defaultParams = {
    first: 'first',
  }
  const builder = downloadUrlBuilder(baseUrl, defaultParams)
  const url1 = builder({second: 'second'})
  expect(url1).toEqual(`${baseUrl}/?first=first&second=second`)
  const url2 = builder({third: 'third'})
  expect(url2).toEqual(`${baseUrl}/?first=first&third=third`)
})

test('The downloadBuilder returns a builder that permits changing default params', () => {
  const baseUrl = 'https://github.com'
  const defaultParams = {
    first: 'first',
  }
  const builder = downloadUrlBuilder(baseUrl, defaultParams)
  const url = builder({first: 'chicken'})
  expect(url).toEqual(`${baseUrl}/?first=chicken`)
})

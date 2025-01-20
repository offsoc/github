import {render, screen} from '@testing-library/react'
import {ExportStatusBanner} from '../ExportStatusBanner'
import {ExportJobState} from '../../types/export-job-state'

const renderComponent = (props = {}) => {
  const defaultProps = {
    exportJobState: ExportJobState.Inactive,
    onDismissClick: jest.fn(),
    emailNotificationMessage: '',
    showDownloadButtonOnReady: false,
    onDownloadButtonClick: jest.fn(),
  }

  return render(<ExportStatusBanner {...defaultProps} {...props} />)
}

test('renders the Pending state with no email notification message', () => {
  renderComponent({
    exportJobState: ExportJobState.Pending,
    emailNotificationMessage: undefined,
  })

  expect(screen.getByTestId('export-status-text-long')).toHaveTextContent('The CSV report is being generated.')
  expect(screen.getByTestId('export-status-text-short')).toHaveTextContent('Generating CSV')
  expect(screen.getByTestId('export-status-pending-spinner')).toBeInTheDocument()
  expect(screen.getByTestId('ghe-button-dismiss-export')).toBeInTheDocument()
})

test('renders the Pending state with an email notification message', () => {
  renderComponent({
    exportJobState: ExportJobState.Pending,
    emailNotificationMessage: 'Email notification message',
  })

  expect(screen.getByTestId('export-status-text-long')).toHaveTextContent('Email notification message')
  expect(screen.getByTestId('export-status-text-short')).toHaveTextContent('Generating CSV')
  expect(screen.getByTestId('export-status-pending-spinner')).toBeInTheDocument()
  expect(screen.getByTestId('ghe-button-dismiss-export')).toBeInTheDocument()
})

test('renders the Ready state with no download button', () => {
  renderComponent({
    exportJobState: ExportJobState.Ready,
    showDownloadButtonOnReady: false,
  })

  expect(screen.getByTestId('export-status-text-long')).toHaveTextContent('CSV report generation complete.')
  expect(screen.getByTestId('export-status-text-short')).toHaveTextContent('Downloaded CSV')
  expect(screen.getByTestId('ghe-button-dismiss-export')).toBeInTheDocument()
})

test('renders the Ready state with a download button', () => {
  renderComponent({
    exportJobState: ExportJobState.Ready,
    showDownloadButtonOnReady: true,
  })

  expect(screen.getByTestId('export-status-text-long')).toHaveTextContent('CSV report generation complete.')
  expect(screen.getByTestId('export-status-text-short')).toHaveTextContent('Download CSV')
  expect(screen.getByTestId('ghe-button-dismiss-export')).toBeInTheDocument()
})

test('renders the Error state', () => {
  renderComponent({
    exportJobState: ExportJobState.Error,
  })

  expect(screen.getByTestId('export-status-text-long')).toHaveTextContent(
    'The CSV report could not be generated. Please try again later.',
  )
  expect(screen.getByTestId('export-status-text-short')).toHaveTextContent('Download failed')
  expect(screen.getByTestId('ghe-button-dismiss-export')).toBeInTheDocument()
})

test('calls onDismissClick when the dismiss button is clicked', () => {
  const onDismissClick = jest.fn()
  renderComponent({onDismissClick})

  screen.getByTestId('ghe-button-dismiss-export').click()

  expect(onDismissClick).toHaveBeenCalledTimes(1)
})

test('calls onDownloadButtonClick when the download button is clicked', () => {
  const onDownloadButtonClick = jest.fn()
  renderComponent({
    exportJobState: ExportJobState.Ready,
    showDownloadButtonOnReady: true,
    onDownloadButtonClick,
  })

  screen.getByText('Download CSV').click()

  expect(onDownloadButtonClick).toHaveBeenCalledTimes(1)
})

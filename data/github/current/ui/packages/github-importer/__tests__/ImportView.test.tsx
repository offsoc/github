import {screen, act} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AliveTestProvider, dispatchAliveTestMessage, signChannel} from '@github-ui/use-alive/test-utils'

import {ImportView, type ImportViewPayload} from '../routes/ImportView'
import {getImportViewRoutePayload} from '../test-utils/mock-data'

interface AliveMessageData {
  status: string
  timestamp: string
  failure_reason: string
}

function renderImportView(payload?: Partial<ImportViewPayload>) {
  render(
    <AliveTestProvider>
      <ImportView />
    </AliveTestProvider>,
    {
      routePayload: {
        ...getImportViewRoutePayload(),
        channel: signChannel(channel),
        ...payload,
      },
    },
  )
}

async function sendAliveEvent(data: AliveMessageData) {
  await act(() => {
    dispatchAliveTestMessage(channel, data)
  })
}

const oldWindowLocation = window.location

beforeAll(() => {
  // set up a mock window.location to make sure we're generating links correctly
  // @ts-expect-error overriding window.location in test
  delete window.location
  window.location = {} as Location

  Object.defineProperties(window.location, {
    href: {value: 'https://github.com/test-user/test-repo/import'},
    protocol: {value: 'https:'},
    host: {value: 'github.com'},
    hostname: {value: 'github.com'},
    pathname: {value: '/test-user/test-repo/import'},
  })
})

afterAll(() => {
  window.location = oldWindowLocation
})

// Set up the Route Payload to use this signed channel
const channel = 'some-channel'

test('ImportView renders a status based on the intial payload values', () => {
  renderImportView()

  expect(screen.getByText('Importing commits and revision history to GitHub...')).toBeInTheDocument()
})

describe('renders ImportView for an in-progress migration', () => {
  test('renders the components for an in-progress migration', () => {
    renderImportView()

    expect(screen.getByText('Preparing your new repository')).toBeInTheDocument()
    expect(screen.getByTestId('in-progress-spinner')).toBeInTheDocument()
    expect(screen.getByText('Importing commits and revision history to GitHub...')).toBeInTheDocument()

    const statusBox = screen.getByTestId('import-status-message-box')
    expect(statusBox).toHaveFocus()
  })
})

describe('renders ImportView for a succeeded migration', () => {
  test('renders components for a succeeded migration', () => {
    renderImportView({status: 'MIGRATION_STATE_SUCCEEDED'})

    expect(screen.getByText('Preparing your new repository')).toBeInTheDocument()
    expect(screen.queryByTestId('in-progress-spinner')).not.toBeInTheDocument()

    const icon = screen.getByRole('img', {hidden: true})
    expect(icon).toBeVisible()
    expect(icon.classList.contains('Octicon-sc-9kayk9-0')).toBe(true)
    expect(icon.classList.contains('anim-fade-in')).toBe(true)

    const message = screen.getByText(/Importing complete!/)
    expect(message).toBeInTheDocument()

    const statusBox = screen.getByTestId('import-status-message-box')
    expect(statusBox).toHaveFocus()

    const hyperlink = screen.getByText('test-user/test-repo')
    expect(hyperlink).toBeInTheDocument()
    expect(hyperlink.getAttribute('href')).toBe('/test-user/test-repo')
  })
})

describe('renders ImportView for failed migrations', () => {
  test('renders components for a failed migration', async () => {
    renderImportView({
      status: 'MIGRATION_STATE_FAILED',
      failure_reason: 'A critical error occured in the Clone Source step of the git migration.',
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    expect(screen.getByText('We found an error during import')).toBeInTheDocument()

    const icon = screen.getByRole('img', {hidden: true})
    expect(icon).toBeVisible()
    expect(icon.classList.contains('Octicon-sc-9kayk9-0')).toBe(true)
    expect(icon.classList.contains('anim-fade-in')).toBe(false)

    expect(
      screen.getByText('A critical error occured in the Clone Source step of the git migration.'),
    ).toBeInTheDocument()

    const hyperlink = screen.getByText('contact support')
    expect(hyperlink).toBeInTheDocument()
    expect(hyperlink.getAttribute('href')).toBe('/contact')

    const statusBox = screen.getByTestId('import-failure-flash')
    expect(statusBox).toHaveFocus()
  })

  describe('renders error details', () => {
    test('renders the error details if error details are present', async () => {
      renderImportView({
        status: 'MIGRATION_STATE_FAILED',
        failure_reason:
          'A critical error occured in the Check For Large Files step of the git migration. Files above push limit detected',
        error_details: [
          'Files above push limit:',
          'AnotherLargeTestFile.txt(c1b9db4e5b6315e62cb005de4e3ec8aaf8c286d1) => 300MiB',
          'LargeTestFile.txt(10f1a0bf47fca0d7b287e96142ffbf7fdfedf059) => 200MiB',
          'main-large-file-1gb.txt(4fce05a4e4ed8cefef2d99f32c519b2fd7841b74) => 1024MiB',
        ],
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(screen.getByText('We found an error during import')).toBeInTheDocument()

      expect(
        screen.getByText(
          'A critical error occured in the Check For Large Files step of the git migration. Files above push limit detected',
        ),
      ).toBeInTheDocument()

      const statusBox = screen.getByTestId('import-failure-flash')
      expect(statusBox).toHaveFocus()

      const details = screen.getByTestId('migration-error-details')
      expect(details).toBeInTheDocument()

      const summary = screen.getByText('Error Details')
      expect(summary).toBeInTheDocument()

      const detail = screen.getByText('Files above push limit:')
      expect(detail).toBeInTheDocument()
    })

    test('truncates the error details if more than 20 are present', async () => {
      const fake_error_details = ['Files above push limit:']
      for (let i = 1; i <= 25; i++) {
        fake_error_details.push(`file_${i}.txt`)
      }

      renderImportView({
        status: 'MIGRATION_STATE_FAILED',
        failure_reason:
          'A critical error occured in the Check For Large Files step of the git migration. Files above push limit detected',
        error_details: fake_error_details,
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      expect(screen.getByText('We found an error during import')).toBeInTheDocument()

      expect(
        screen.getByText(
          'A critical error occured in the Check For Large Files step of the git migration. Files above push limit detected',
        ),
      ).toBeInTheDocument()

      const statusBox = screen.getByTestId('import-failure-flash')
      expect(statusBox).toHaveFocus()

      const details = screen.getByTestId('migration-error-details')
      expect(details).toBeInTheDocument()

      const summary = screen.getByText('Error Details')
      expect(summary).toBeInTheDocument()

      const detail = screen.getByText('Files above push limit:')
      expect(detail).toBeInTheDocument()

      const lastDetail = screen.queryByText('file_25.txt')
      expect(lastDetail).not.toBeInTheDocument()

      const truncatedWarning = screen.queryByText('* This list has been truncated to 20 lines')
      expect(truncatedWarning).toBeInTheDocument()
    })
  })
})

describe('updates upon receiving Alive messages', () => {
  test('updates state upon receiving data from websocket', async () => {
    renderImportView()

    expect(screen.getByText('Importing commits and revision history to GitHub...')).toBeInTheDocument()

    await sendAliveEvent({
      status: 'MIGRATION_STATE_FAILED',
      timestamp: '2024-03-01T01:00:00Z',
      failure_reason: 'Some reason',
    })

    expect(screen.getByText('We found an error during import')).toBeInTheDocument()
    expect(screen.getByText('Some reason')).toBeInTheDocument()
  })

  test('updates state only based on most-recent websocket message', async () => {
    const newer_message_data = {
      status: 'MIGRATION_STATE_FAILED',
      timestamp: '2024-03-01T00:30:00Z',
      failure_reason: 'Some reason',
    }
    const older_message_data = {
      status: 'MIGRATION_STATE_IN_PROGRESS',
      timestamp: '2024-03-01T00:00:00Z',
      failure_reason: '',
    }

    renderImportView()

    expect(screen.getByText('Importing commits and revision history to GitHub...')).toBeInTheDocument()

    await sendAliveEvent(newer_message_data)
    await sendAliveEvent(older_message_data)

    expect(screen.getByText('We found an error during import')).toBeInTheDocument()
    expect(screen.getByText('Some reason')).toBeInTheDocument()
  })
})

describe('status error cases', () => {
  test('Renders a default pending status message when status is missing', () => {
    // Render with an empty status
    renderImportView({status: ''})

    expect(screen.getByText('Your import will begin shortly...')).toBeInTheDocument()
  })

  test('Renders a message when status is invalid', () => {
    // Render with an invalid status
    renderImportView({
      status: 'MIGRATION_STATE_INVALID',
    })

    expect(screen.getByText('Something went wrong when fetching the import status...')).toBeInTheDocument()
  })
})

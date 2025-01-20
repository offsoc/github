import {mockFetch} from '@github-ui/mock-fetch'
import {createExportJob, pollForExportJobCompletion} from '../download-csv'

describe('services/download-csv', () => {
  const testUrl = '/download'
  const jobUrl = '/job/1'
  const exportUrl = '/export.csv'
  const emailNotificationMessage = 'Email notification message'

  let abortController: AbortController

  beforeEach(() => {
    abortController = new AbortController()
  })

  test('successful job creation and polling', async () => {
    mockFetch.mockRouteOnce(
      testUrl,
      {method: 'POST', body: {export_format: 'csv'}},
      {
        ok: true,
        status: 200,
        json: async () => ({
          export_url: exportUrl,
          job_url: jobUrl,
          notify: emailNotificationMessage,
        }),
      },
    )

    mockFetch.mockRouteOnce(
      jobUrl,
      {},
      {
        ok: true,
        status: 202, // simulate pending job
      },
    )

    mockFetch.mockRouteOnce(
      jobUrl,
      {},
      {
        ok: true,
        status: 200, // simulate job completion
      },
    )

    const jobResponse = await createExportJob(testUrl, abortController.signal)
    expect(jobResponse).toEqual({
      export_url: exportUrl,
      job_url: jobUrl,
      notify: emailNotificationMessage,
    })

    await pollForExportJobCompletion(jobResponse.job_url, abortController.signal)
  })

  test('error during job creation', async () => {
    const error = 'Failed to create export job'
    mockFetch.mockRouteOnce(
      testUrl,
      {method: 'POST', body: {export_format: 'csv'}},
      {
        ok: false,
        status: 500,
        json: async () => ({error}),
      },
    )

    await expect(createExportJob(testUrl, abortController.signal)).rejects.toThrow(new Error(error))
  })

  test('polling error with error message', async () => {
    const errorMessage = 'Job error'
    mockFetch.mockRouteOnce(
      testUrl,
      {method: 'POST', body: {export_format: 'csv'}},
      {
        ok: true,
        status: 200,
        json: async () => ({
          export_url: exportUrl,
          job_url: jobUrl,
        }),
      },
    )

    mockFetch.mockRouteOnce(
      jobUrl,
      {},
      {
        ok: true,
        status: 202, // simulate pending job
      },
    )

    mockFetch.mockRouteOnce(
      jobUrl,
      {},
      {
        ok: false,
        status: 400,
        json: async () => ({
          job: {error_message: errorMessage},
        }),
      },
    )

    await expect(pollForExportJobCompletion(jobUrl, abortController.signal)).rejects.toThrow(new Error(errorMessage))
  })

  test('polling error without error message', async () => {
    mockFetch.mockRouteOnce(
      testUrl,
      {method: 'POST', body: {export_format: 'csv'}},
      {
        ok: true,
        status: 200,
        json: async () => ({
          export_url: exportUrl,
          job_url: jobUrl,
        }),
      },
    )

    mockFetch.mockRouteOnce(
      jobUrl,
      {},
      {
        ok: true,
        status: 202, // simulate pending job
      },
    )

    mockFetch.mockRouteOnce(
      jobUrl,
      {},
      {
        ok: false,
        status: 400,
        json: async () => ({}),
      },
    )

    await expect(pollForExportJobCompletion(jobUrl, abortController.signal)).rejects.toThrow(
      new Error('Failed to download CSV file'),
    )
  })
})

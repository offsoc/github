import {verifiedFetchJSON} from '@github-ui/verified-fetch'

const POLLING_INTERVAL = 2000

async function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise(resolve => {
    const timeoutId = setTimeout(() => {
      resolve()
    }, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId)
      resolve()
    })
  })
}

interface CheckExportJobStatusResponse {
  job: {
    error_message?: string
  }
}
async function checkExportJobStatus(url: string, signal: AbortSignal): Promise<number> {
  const response = await verifiedFetchJSON(url, {signal})

  if (response.status >= 400) {
    let responseJson: CheckExportJobStatusResponse
    try {
      responseJson = (await response.json()) as CheckExportJobStatusResponse
    } catch {
      throw new Error('Failed to download CSV file')
    }
    throw new Error(responseJson?.job?.error_message || 'Failed to download CSV file')
  }

  return response.status
}

interface CreateExportJobResponse {
  export_url: string
  job_url: string
  notify?: string
  error?: string
}
export async function createExportJob(url: string, signal: AbortSignal): Promise<CreateExportJobResponse> {
  const response = await verifiedFetchJSON(url, {
    method: 'POST',
    body: {export_format: 'csv'},
    signal,
  })

  if (!response.ok) {
    throw new Error('Failed to create export job')
  }

  return response.json()
}

export async function pollForExportJobCompletion(jobUrl: string, signal: AbortSignal): Promise<void> {
  // Wait for the job to finish
  let status
  do {
    status = await checkExportJobStatus(jobUrl, signal)

    if (status !== 200) {
      await wait(POLLING_INTERVAL, signal)
    }
  } while (status !== 200)

  return
}

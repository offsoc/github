import {announce} from '@github-ui/aria-live'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {DownloadIcon} from '@primer/octicons-react'
import {Button, Spinner} from '@primer/react'
import {memo, useState} from 'react'

export interface SecurityOverviewExportButtonProps {
  createExportUrl: string
  errorBannerId?: string
  successBannerId?: string
  startedBannerId?: string
  buttonSize?: 'small' | 'medium' | 'large'
}

export interface CreateExportResponse {
  jobStatusUrl: string
  downloadExportUrl: string
  error?: string
}

export class ExportError extends Error {}

interface JobStatusResponse {
  job: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    error_message?: string
  }
}

const SmallSpinner = memo(() => <Spinner size={'small'} sx={{color: 'fg.default'}} />)
SmallSpinner.displayName = 'SmallSpinner'

export function SecurityOverviewExportButton({
  createExportUrl,
  errorBannerId,
  successBannerId,
  startedBannerId,
  buttonSize = 'small',
}: SecurityOverviewExportButtonProps): JSX.Element {
  const [state, setState] = useState<'stopped' | 'loading'>('stopped')
  const loading = state === 'loading'

  const loadingDescription =
    startedBannerId == null
      ? 'Generating your report. Stay on this page to automatically download the report.'
      : "Generating your report. You will receive an email when it's ready. Stay on this page to automatically download the report."

  async function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function pollJobStatus(url: string): Promise<void> {
    const response = await verifiedFetch(url)

    if (response.status === 202) {
      await wait(2000)
      return pollJobStatus(url)
    } else if (response.status > 399) {
      const responseJson = (await response.json()) as JobStatusResponse
      throw new ExportError(
        responseJson?.job?.error_message ||
          "We couldn't generate your report. Please try again later. If the problem persists, please contact support.",
      )
    }
  }

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
    e.preventDefault()

    if (!loading) {
      setState('loading')

      const errorBanner = errorBannerId ? document.getElementById(errorBannerId) : null
      if (errorBanner) {
        errorBanner.hidden = true
      }

      const successBanner = successBannerId ? document.getElementById(successBannerId) : null
      if (successBanner) {
        successBanner.hidden = true
      }

      const startedBanner = startedBannerId ? document.getElementById(startedBannerId) : null
      if (startedBanner) {
        startedBanner.hidden = true
        announce(startedBanner.querySelector('p:last-child')?.textContent || loadingDescription)
      } else {
        announce(loadingDescription)
      }

      // Wait a brief moment for the loading state announcement to start.
      // Solves an issue where the loading state announcement happens after the error banner role=status announcement
      // when the error occurs immediately.
      await wait(10)

      try {
        if (startedBanner) {
          startedBanner.hidden = false
        }

        // Start the export job
        const response = await verifiedFetch(createExportUrl, {method: 'POST'})
        const {jobStatusUrl, downloadExportUrl, error} = await (response.json() as Promise<CreateExportResponse>)

        if (error) {
          throw new ExportError(error)
        }

        // Wait for the job to finish
        await pollJobStatus(jobStatusUrl)

        // Download the export
        window.location.assign(downloadExportUrl)

        const successAnnouncement =
          startedBannerId == null
            ? 'Your report is ready and the download has started.'
            : 'Your report is ready and the download has started. An email with the report has also been sent to you.'

        announce(successAnnouncement)
        if (successBanner) {
          if (startedBanner) {
            startedBanner.hidden = true
          }
          successBanner.hidden = false
        }
      } catch (err) {
        const errorText =
          err instanceof ExportError
            ? err.message
            : 'Something went wrong while exporting your data. Please try again later. If the problem persists, please contact support.'

        announce(errorText)
        if (errorBanner) {
          const errorBannerTextContainer = errorBanner.querySelector('p:last-child')
          if (errorBannerTextContainer) {
            errorBannerTextContainer.textContent = errorText
          }

          errorBanner.hidden = false
          if (startedBanner) {
            startedBanner.hidden = true
          }
        }
      } finally {
        setState('stopped')
      }
    }
  }

  return (
    <>
      <Button
        size={buttonSize}
        onClick={handleClick}
        aria-disabled={loading}
        {...(loading ? {'aria-describedby': 'so-export-loading-description'} : {})}
        leadingVisual={loading ? SmallSpinner : DownloadIcon}
        variant={loading ? 'invisible' : 'default'}
        data-state={state}
        sx={{
          // For some reason '[data-state="loading"]' alone gets scrubbed
          ':not([data-state="stopped"])': {
            ':hover,:active': {bg: 'transparent'},
          },
        }}
      >
        Export CSV
      </Button>
      {loading && (
        <span id="so-export-loading-description" hidden={true}>
          {loadingDescription}
        </span>
      )}
    </>
  )
}

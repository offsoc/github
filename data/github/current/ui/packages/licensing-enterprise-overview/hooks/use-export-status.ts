import {useCallback, useEffect, useRef, useState} from 'react'
import {ExportJobState} from '../types/export-job-state'
import {createExportJob, pollForExportJobCompletion} from '../services/download-csv'

export function useExportStatus(csvDownloadUrl: string) {
  const [exportJobState, setExportJobState] = useState<ExportJobState>(ExportJobState.Inactive)
  const [emailNotificationMessage, setEmailNotificationMessage] = useState<string | undefined>(undefined)
  const [readyExportUrl, setReadyExportUrl] = useState<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const autoDownloadExport = !emailNotificationMessage

  const doDownload = useCallback(() => {
    window.location.assign(readyExportUrl)
  }, [readyExportUrl])

  // clean up on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // when export is ready, do the download
  useEffect(() => {
    if (exportJobState === ExportJobState.Ready && readyExportUrl && autoDownloadExport) {
      doDownload()
    }
  }, [exportJobState, autoDownloadExport, readyExportUrl, doDownload])

  const startExport = async () => {
    // abort any pending export
    abortControllerRef.current?.abort()

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setExportJobState(ExportJobState.Pending)
    setEmailNotificationMessage(undefined)

    try {
      const {job_url: jobUrl, export_url: exportUrl, notify} = await createExportJob(csvDownloadUrl, signal)

      // server returns an email-specific status message iff it's sending an email notification
      if (notify) {
        setEmailNotificationMessage(notify)
      }

      await pollForExportJobCompletion(jobUrl, signal)

      setReadyExportUrl(exportUrl)
      setExportJobState(ExportJobState.Ready)
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        // ignore abort errors
        setExportJobState(ExportJobState.Error)
      }
    }
  }

  const dismissExport = () => {
    abortControllerRef.current?.abort()
    setExportJobState(ExportJobState.Inactive)
  }

  return {
    exportJobState,
    emailNotificationMessage,
    startExport,
    dismissExport,
    doDownload,
    autoDownloadExport,
  }
}

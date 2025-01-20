import {verifiedFetch} from '@github-ui/verified-fetch'
import type React from 'react'
import {useCallback, useRef, useState} from 'react'
import type {CSVUploadPayload} from '../../types'

export function useCsvUpload(organization: string, onUploadSuccess?: (payload: CSVUploadPayload) => void) {
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResponse, setUploadResponse] = useState<CSVUploadPayload | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClearData = useCallback(() => {
    setUploadResponse(null)
  }, [])

  const handleUploadIntent = useCallback((event: React.MouseEvent) => {
    event.preventDefault()

    if (!inputRef.current) return

    inputRef.current.click()
  }, [])

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0]

      if (isUploading || !file) {
        return
      }

      setIsUploading(true)

      const formData = new FormData()
      formData.append('file_csv', file)

      try {
        const response = await verifiedFetch(`/organizations/${organization}/settings/copilot/confirm_add_users_csv`, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        })
        const payload = await response.json()
        setUploadResponse(payload.users as CSVUploadPayload)
        setUploadError(null)
        onUploadSuccess?.(payload.users)
      } catch (e) {
        setUploadError((e as Error).message)
      } finally {
        setIsUploading(false)

        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    },
    [isUploading, organization, onUploadSuccess],
  )

  return {
    error: uploadError,
    userData: uploadResponse,
    inputRef,
    handleUploadIntent,
    handleUpload,
    handleClearData,
    isUploading,
  }
}

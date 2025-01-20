import type React from 'react'
import {useCallback, useRef, useState} from 'react'

export function useJsonUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUploadIntent = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault()

    if (!inputRef.current) return

    inputRef.current.click()
  }, [])

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0]

      if (isUploading) {
        return
      }
      if (!file) {
        throw new Error('No file specified')
      }
      if (file.type !== 'text/json' && file.type !== 'application/json') {
        throw new Error('Invalid file type')
      }

      setIsUploading(true)
      let text
      try {
        text = await file.text()
      } catch {
        setIsUploading(false)
        throw new Error('Error importing ruleset')
      }
      try {
        JSON.parse(text)
      } catch {
        setIsUploading(false)
        throw new Error('Invalid ruleset specified')
      }
      setIsUploading(false)
      return text
    },
    [isUploading],
  )

  return {
    inputRef,
    handleUploadIntent,
    handleUpload,
    isUploading,
  }
}

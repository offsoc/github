import {useCallback, useState} from 'react'

import type {PreviewMarkdownRequestBody} from '../api/markdown/api-preview-markdown'
import {apiPreviewMarkdown} from '../api/markdown/api-preview-markdown'

/** Get rendered Markdown as HTML. */
export const useMarkdownPreview = (context?: Omit<PreviewMarkdownRequestBody, 'text'>) => {
  const [html, setHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadPreview = useCallback(
    async (markdown: string) => {
      setIsLoading(true)
      setHtml('')
      const preview = await apiPreviewMarkdown({text: markdown, ...context})
      setIsLoading(false)
      setHtml(preview)

      return preview
    },
    [context],
  )

  return {html, isLoading, loadPreview}
}

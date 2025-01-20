import {MarkdownViewer, type MarkdownViewerProps} from '@github-ui/markdown-viewer'

import {sanitizeRenderedMarkdown} from '../../helpers/sanitize'

// this is a bonkers way to omit a key from a union which is not supported natively in typescript
// see https://github.com/microsoft/TypeScript/issues/31501#issuecomment-1280579305
type OmitUnion<T, K extends keyof any> = T extends any ? Omit<T, K> : never

type UnverifiedHTMLProps = OmitUnion<MarkdownViewerProps, 'verifiedHTML'> & {
  unverifiedHTML: string
}

/**
 * A viewer for Markdown containing additional sanitizing of the received
 * rendered HTML string.
 */
export function SanitizedMarkdownViewer(props: UnverifiedHTMLProps) {
  const sanitizedHtml = sanitizeRenderedMarkdown(props.unverifiedHTML)
  return <MarkdownViewer {...props} verifiedHTML={sanitizedHtml} />
}

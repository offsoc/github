import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {graphql, useFragment} from 'react-relay'
import type {MarkdownElement_input$key} from './__generated__/MarkdownElement_input.graphql'
import {Suspense} from 'react'
import {FormElementLoading} from '../FormElementLoading'
import type {SafeHTMLString} from '@github-ui/safe-html'

export type MarkdownElementInternalProps = {
  verifiedHTML: SafeHTMLString
  type: 'markdown'
}

export const MarkdownElement = ({elementRef}: {elementRef: MarkdownElement_input$key}) => {
  const data = useFragment(
    graphql`
      fragment MarkdownElement_input on IssueFormElementMarkdown {
        contentHTML
      }
    `,
    elementRef,
  )

  return <MarkdownElementInternal verifiedHTML={data.contentHTML as SafeHTMLString} type={'markdown'} />
}

export const MarkdownElementInternal = ({verifiedHTML}: MarkdownElementInternalProps) => {
  return (
    // The Suspense boundary is required since MarkdownViewer doesn't seem to be SSR-compatible
    <Suspense fallback={<FormElementLoading />}>
      <MarkdownViewer verifiedHTML={verifiedHTML} />
    </Suspense>
  )
}

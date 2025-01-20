import {MarkdownViewer} from '@github-ui/markdown-viewer'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {useEffect, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'

export const reactReplaceElementPrefix = `react-replace-${Math.floor(Math.random() * 1000000000)}`

export interface ReactReplaceBlock {
  regex: RegExp
  renderer: (match: string) => JSX.Element
}

export interface ReactReplaceMatch {
  id: string
  componentType: string
  matchedContent: string
}

export interface ReactMarkdownRendererProps {
  body: string | undefined
  matches: ReactReplaceMatch[]
  onLinkClick?: (event: MouseEvent) => void
  reactReplaceBlocks: {[key: string]: ReactReplaceBlock}
}

export function ReactMarkdownRenderer(props: ReactMarkdownRendererProps): JSX.Element {
  const {body, matches, onLinkClick, reactReplaceBlocks} = props

  const [rendered, setRendered] = useState<boolean>(false)

  useEffect(() => {
    setRendered(true)
  }, [])

  const markdownViewer = useMemo(() => {
    return <MarkdownViewer onLinkClick={onLinkClick} verifiedHTML={body as SafeHTMLString} />
  }, [body, onLinkClick])

  return (
    <>
      {markdownViewer}
      {rendered &&
        matches.map(match => {
          const domNode = document.getElementById(match.id)
          if (domNode && reactReplaceBlocks[match.componentType]) {
            return createPortal(reactReplaceBlocks[match.componentType]?.renderer(match.matchedContent), domNode)
          }
          return null
        })}
    </>
  )
}

export function replaceStringsWithReactContainers(
  blocks: {[key: string]: ReactReplaceBlock},
  messageId: string,
  input?: string,
): {output: string; matches: ReactReplaceMatch[]} {
  if (!input) return {output: '', matches: []}
  const matches: ReactReplaceMatch[] = []
  let output = input
  for (const [key, block] of Object.entries(blocks)) {
    let match
    while ((match = block.regex.exec(output)) !== null) {
      const id = `${reactReplaceElementPrefix}-${matches.length}-${messageId}`
      output = output.replace(
        match[0],
        // eslint-disable-next-line github/unescaped-html-literal
        `<span id="${id}"></span>`,
      )
      matches.push({id, componentType: key, matchedContent: match[0]})
    }
  }
  return {output, matches}
}

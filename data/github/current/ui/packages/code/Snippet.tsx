import type React from 'react'

import {SafeHTMLText, type SafeHTMLString} from '@github-ui/safe-html'
import {Box, Link} from '@primer/react'
import {useFileContext} from './context'

export type CodeLine = {
  /** A pre-colorized line of code */
  html: SafeHTMLString
  /** This line of code's line number */
  number: number
}

export function Snippet(props: {lines: CodeLine[]}) {
  const file = useFileContext()

  const lines: React.ReactNode[] = []

  for (const line of props.lines) {
    lines.push(
      <tr key={line.number} role="row">
        <td role="cell">
          <Link
            href={`${file.fileUrl}/#L${line.number}`}
            className="blob-num"
            sx={{display: 'block', textDecoration: 'none !important', color: 'fg.subtle'}}
          >
            {line.number}
          </Link>
        </td>
        <SafeHTMLText
          as="td"
          className="blob-code blob-code-inner"
          role="cell"
          html={line.html}
          sx={{
            cursor: 'text',
            wordWrap: 'break-word',
            color: 'fg.default',
            overflowWrap: 'anywhere',
            mark: {backgroundColor: 'var(--highlight-neutral-bgColor, var(--color-search-keyword-hl))'},
          }}
        />
      </tr>,
    )
  }

  return (
    <Box
      className="code-list"
      sx={{
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        minWidth: 0,
        py: 2,
      }}
    >
      <table role="table">
        {
          // We need to add role="rowgroup" because we don't have table headers
          // And in order to screen readers to know that we really mean for this to be a table
          // We must define it explicitly
          <tbody role="rowgroup">{lines}</tbody>
        }
      </table>
    </Box>
  )
}

import type {SafeHTMLString} from '@github-ui/safe-html'
import {SafeHTMLDiv} from '@github-ui/safe-html'
import {Box} from '@primer/react'

interface SimpleCodeListingProps {
  lineNumbers: number[]
  lines: SafeHTMLString[]
  trimLineBeginnings?: boolean
}

export function SimpleCodeListing({lineNumbers, lines, trimLineBeginnings}: SimpleCodeListingProps) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'row', overflowX: 'auto', pb: 3}}>
      <table
        style={{
          fontSize: '12px',
          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace',
          overflowX: 'auto',
        }}
      >
        {lineNumbers.map((num, i) => (
          <tr key={`line-row-${num}`}>
            <td key={num}>{num}</td>
            <td style={{whiteSpace: 'pre', paddingLeft: '16px'}}>
              <SafeHTMLDiv
                key={`line-${i}`}
                html={
                  trimLineBeginnings
                    ? trimLineBeginning(lines[i] ?? ('' as SafeHTMLString))
                    : lines[i] || ('\n' as SafeHTMLString)
                }
              />
            </td>
          </tr>
        ))}
      </table>
    </Box>
  )
}

function trimLineBeginning(str: SafeHTMLString): SafeHTMLString {
  return str.trimStart() as SafeHTMLString
}

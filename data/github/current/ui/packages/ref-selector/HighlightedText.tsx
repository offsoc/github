import {Box} from '@primer/react'

function splitTextBySearchTerm(text: string, search: string) {
  if (!search) {
    return [text]
  }

  const splitLowercase = text.toLowerCase().split(search.toLowerCase())
  if (splitLowercase.length < 2) {
    return [text]
  }

  let idx = 0
  const out = []
  for (const component of splitLowercase) {
    out.push(text.substring(idx, idx + component.length))
    idx += component.length
    out.push(text.substring(idx, idx + search.length))
    idx += search.length
  }
  return out
}
/**
 * @param text the text to highlight
 * @param search the search term to highlight within the text
 * @param hideOverflow
 * @returns safe HTML that has the search term highlighted within the text of the provided text
 * parameter
 */
export function HighlightedText({
  text,
  search,
  hideOverflow = false,
  overflowWidth = 0,
}: {
  text: string
  search: string
  hideOverflow?: boolean
  overflowWidth?: number
}) {
  const segments = splitTextBySearchTerm(text, search)
  const nodes = segments.map((segment, index) =>
    index % 2 === 1 ? (
      <strong className="color-fg-default" key={index}>
        {segment}
      </strong>
    ) : (
      segment
    ),
  )
  const overflowVal = hideOverflow ? 'hidden' : 'visible'
  const overflowWidthVal = overflowWidth ? `${overflowWidth}px` : undefined

  return (
    <Box
      sx={{
        maxWidth: overflowWidthVal,
        overflow: overflowVal,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: search.length ? 'fg.muted' : 'fg.default',
      }}
    >
      {nodes}
    </Box>
  )
}

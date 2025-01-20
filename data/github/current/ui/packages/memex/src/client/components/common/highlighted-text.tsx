import {Box, Text, type TextProps} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {FuzzyFilterChunk} from '../../helpers/suggester'

interface HighlightedTextProps extends TextProps {
  text: string
  chunks: Array<FuzzyFilterChunk>
}

const highlightedTextStyle: BetterSystemStyleObject = {
  bg: theme => `${theme.colors.searchKeyword.hl}`,
  color: 'inherit',
  fontWeight: 'bold',
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({text, chunks, ...textProps}) => {
  return (
    <Text {...textProps}>
      {chunks.map(chunk => {
        const textChunk = text.substr(chunk.startIndex, chunk.endIndex - chunk.startIndex)
        return chunk.highlight ? (
          <Box as="mark" sx={highlightedTextStyle} key={chunk.startIndex.toString()}>
            {textChunk}
          </Box>
        ) : (
          textChunk
        )
      })}
    </Text>
  )
}

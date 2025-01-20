import {Box, Text} from '@primer/react'

import type {LineDiffComparison, LineModification, TextDiffProps, WordModification} from './text-diff'
import {textDiff} from './text-diff'

const getBorderStyling = (modification: LineModification) => {
  const borderStyle = '3px solid'

  switch (modification) {
    case 'ADDED':
      return {borderLeft: borderStyle, borderColor: 'var(--borderColor-success-emphasis, var(--color-success-fg))'}
    case 'REMOVED':
      return {borderLeft: borderStyle, borderColor: 'var(--borderColor-danger-emphasis, var(--color-danger-fg))'}
    case 'EDITED':
      return {borderLeft: borderStyle, borderColor: 'var(--borderColor-severe-emphasis, var(--color-severe-fg))'}
    case 'UNCHANGED':
      return {}
  }
}

const getWordStyling = (modification: WordModification) => {
  switch (modification) {
    case 'ADDED':
      return {backgroundColor: 'var(--diffBlob-addition-bgColor-word, var(--color-diff-blob-addition-word-bg))'}
    case 'REMOVED':
      return {
        textDecoration: 'line-through',
        backgroundColor: 'var(--diffBlob-deletion-bgColor-word, var(--color-diff-blob-deletion-word-bg))',
      }
    case 'UNCHANGED':
      return {}
  }
}

const LineDiffViewer = ({words, modification}: LineDiffComparison) => {
  return (
    <Box as="span" sx={{pl: 2}}>
      {modification === 'EDITED' &&
        words.map((word, index) => {
          // We only show word by word styling if the modifications were within the line.
          return (
            <Text key={index} sx={{...getWordStyling(word.modification)}}>
              {word.word}
              {index === words.length - 1 ? '' : ' '}
            </Text>
          )
        })}
      {modification !== 'EDITED' && words.length > 0 && <span>{words.map(word => word.word).join(' ')}</span>}
      {words.length === 0 && <br />}
    </Box>
  )
}

export const TextDiffViewer = ({before, after}: TextDiffProps) => {
  const lineDiffSummary = textDiff({before, after})

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', overflow: 'auto', gap: 1}}>
      {lineDiffSummary.lines.map((line, index) => {
        return (
          <Box
            key={index}
            sx={{
              ...getBorderStyling(line.modification),
              flexDirection: 'row',
            }}
          >
            <LineDiffViewer {...line} />
          </Box>
        )
      })}
    </Box>
  )
}
